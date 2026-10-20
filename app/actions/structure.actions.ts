// app/actions/structure.actions.ts
'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getCurrentUserWithProfile } from "./auth.actions"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export interface Structure {
  id: string
  name: string
  created_by: string
  created_at: string
  creator?: {
    id: string
    email: string
    avatar_url?: string
  }
  members_count?: number
  teams?: Team[]
  isAdmin: boolean
}

export interface Team {
  id: string
  name: string
  game: string
  platform: 'PC' | 'PLAYSTATION' | 'XBOX'
  role?: 'MANAGER' | 'CAPTAIN' | 'PLAYER'
  created_at?: string
}

export async function getStructures() {
  const supabase = await createClient()

  // 1. Récupérer l'utilisateur connecté
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // 2. Récupérer toutes les structures avec le créateur
  const { data: structures, error: structError } = await supabase
    .from("structures")
    .select(`
      *,
      creator:users!structures_created_by_fkey (
        id,
        email,
        avatar_url
      )
    `)
    .order("created_at", { ascending: false })

  if (structError || !structures) {
    console.error("Erreur récupération structures:", structError?.message)
    return []
  }

  // 3. Récupérer les rôles de l'utilisateur connecté pour toutes les structures
  const { data: userRoles, error: rolesError } = await supabase
    .from("structures_users")
    .select("structure_id, role")
    .eq("user_id", user.id)

  if (rolesError) {
    console.error("Erreur récupération rôles utilisateur:", rolesError.message)
  }

  // Créer un Set ou une Map des structures où l'utilisateur est ADMIN
  const adminStructureIds = new Set(
    userRoles
      ?.filter((item) => item.role === "ADMIN")
      .map((item) => item.structure_id) || []
  )

  // 4. Injecter `isAdmin` dans chaque objet structure
  return structures.map((structure: any) => ({
    ...structure,
    isAdmin: adminStructureIds.has(structure.id),
  }))
}

export async function getMyStructures(): Promise<Structure[]> {
  const supabase = await createClient()
  const user = await getCurrentUserWithProfile()

  if (!user.user?.id) return []

  const userId = user.user.id

  // 1. Récupérer les structures ET le rôle de l'utilisateur dans `structures_users`
  const { data: memberRelations, error: memberError } = await supabase
    .from("structures_users")
    .select("structure_id, role")
    .eq("user_id", userId)

  if (memberError) {
    console.error("Erreur récupération structures membres:", memberError.message)
  }

  const memberStructureIds = memberRelations?.map((rel) => rel.structure_id) || []
  
  // Créer un Set des structures où l'utilisateur est ADMIN
  const adminStructureIds = new Set(
    memberRelations
      ?.filter((rel) => rel.role === "ADMIN")
      .map((rel) => rel.structure_id) || []
  )

  // 2. Récupérer toutes les structures créées par l'utilisateur OU dont il est membre
  const { data, error } = await supabase
    .from("structures")
    .select(`
      *,
      creator:users!structures_created_by_fkey (
        id,
        email,
        avatar_url
      )
    `)
    .or(`created_by.eq.${userId}${memberStructureIds.length > 0 ? `,id.in.(${memberStructureIds.join(',')})` : ''}`)
    .order("created_at", { ascending: false })

  if (error || !data) {
    console.error("Erreur récupération structures:", error?.message)
    return []
  }

  // 3. Mapper les données pour injecter `isAdmin` (True si admin, ou si l'utilisateur est le créateur direct)
  return data.map((structure: any) => ({
    ...structure,
    isAdmin: adminStructureIds.has(structure.id) || structure.created_by === userId,
  })) as Structure[]
}

// Récupérer une structure par son ID
export async function getStructureById(id: string) {
  const supabase = await createClient()

  // 1. Récupérer l'utilisateur connecté
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser) return null

  // 2. Récupérer la structure, son créateur, et ses membres
  const { data: structure, error } = await supabase
    .from("structures")
    .select(`
      *,
      creator:users!structures_created_by_fkey (
        id,
        email,
        avatar_url
      ),
      members:structures_users (
        role,
        user:users (
          id,
          email,
          avatar_url,
          created_at
        )
      )
    `)
    .eq("id", id)
    .single()

  if (error || !structure) return null

  // 3. Récupérer les équipes de cette structure
  const { data: teamsData } = await supabase
    .from("structures_teams")
    .select(`
      team:teams (*)
    `)
    .eq("structure_id", id)

  // 4. Déterminer si l'utilisateur courant est ADMIN de cette structure
  const currentUserMembership = structure.members?.find(
    (m: any) => m.user?.id === currentUser.id
  )
  const isAdmin = currentUserMembership?.role === 'ADMIN'

  // 5. Formater proprement les membres (aplatir l'objet user + rôle)
  const formattedMembers = structure.members?.map((m: any) => ({
    ...m.user,
    role: m.role,
  })).filter((m: any) => m.id) || []

  return {
    ...structure,
    isAdmin,
    members: formattedMembers,
    teams: teamsData?.map((item: any) => item.team).filter(Boolean) || [],
  }
}

// Créer une structure
export async function createStructure(prevState: any, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Non authentifié." }

  const name = formData.get("name") as string

  if (!name) {
    return { success: false, message: "Le nom de la structure est obligatoire." }
  }

  // 1. Créer la structure dans la table `structures`
  const { data: structure, error: structError } = await supabase
    .from("structures")
    .insert({
      name,
      created_by: user.id,
    })
    .select("id")
    .single()

  if (structError || !structure) {
    return { success: false, message: structError?.message || "Erreur lors de la création de la structure." }
  }

  // 2. Ajouter automatiquement le créateur comme ADMIN dans `structures_users`
  const { error: memberError } = await supabase
    .from("structures_users")
    .insert({
      structure_id: structure.id,
      user_id: user.id,
      role: "ADMIN",
    })

  if (memberError && memberError.code !== "23505") {
    console.error("Erreur ajout du créateur à la structure:", memberError.message)
    return { success: false, message: memberError.message }
  }

  // 3. Revalider le cache et rediriger
  revalidatePath("/dashboard/structures")
  
  // Redirection vers la vue détaillée de la structure créée
  redirect(`/dashboard/structures/${structure.id}`)
}

// Modifier une structure
export async function updateStructure(structureId: string, prevState: any, formData: FormData) {
  const supabase = await createClient()

  const name = formData.get("name") as string

  if (!name) {
    return { success: false, message: "Le nom de la structure est obligatoire." }
  }

  const { error } = await supabase
    .from("structures")
    .update({ name })
    .eq("id", structureId)

  if (error) {
    return { success: false, message: error.message }
  }

  revalidatePath(`/dashboard/structures/${structureId}`)
  revalidatePath("/dashboard/structures")
  redirect(`/dashboard/structures/${structureId}`)
}


// Fonction utilitaire pour vérifier si l'utilisateur est ADMIN de la structure
async function isStructureAdmin(supabase: any, userId: string, structureId: string) {
  const { data } = await supabase
    .from("structures_users")
    .select("role")
    .eq("structure_id", structureId)
    .eq("user_id", userId)
    .single()

  return data?.role === 'ADMIN'
}

// 1. Inviter un membre dans la structure
export async function inviteMemberToStructure(structureId: string, prevState: any, formData: FormData) {
  const supabase = await createClient()

  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser) return { success: false, message: "Non authentifié." }

  const email = (formData.get("email") as string)?.trim().toLowerCase()
  const role = (formData.get("role") as string) || "USER"

  if (!email) {
    return { success: false, message: "L'email est obligatoire." }
  }

  // Vérification des droits d'admin
  const isAdmin = await isStructureAdmin(supabase, currentUser.id, structureId)
  if (!isAdmin) {
    return { success: false, message: "Action non autorisée. Vous devez être administrateur." }
  }

  // Vérifier si l'utilisateur est déjà membre de la structure
  const { data: targetUser } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle()

  if (targetUser) {
    const { data: existingMember } = await supabase
      .from("structures_users")
      .select("structure_id")
      .eq("structure_id", structureId)
      .eq("user_id", targetUser.id)
      .maybeSingle()

    if (existingMember) {
      return { success: false, message: "Cet utilisateur fait déjà partie de la structure." }
    }
  }

  // Vérifier si une invitation PENDING existe déjà
  const { data: pendingInvite } = await supabase
    .from("invitations")
    .select("id")
    .eq("email", email)
    .eq("target_id", structureId)
    .eq("type", "STRUCTURE")
    .eq("status", "PENDING")
    .maybeSingle()

  if (pendingInvite) {
    return { success: false, message: "Une invitation est déjà en attente pour cet email." }
  }

  // Récupérer le nom de la structure pour l'email
  const { data: structData } = await supabase
    .from("structures")
    .select("name")
    .eq("id", structureId)
    .single()

  const structName = structData?.name || "la structure"

  // Créer l'invitation
  const { error: inviteError } = await supabase
    .from("invitations")
    .insert({
      email,
      type: 'STRUCTURE',
      target_id: structureId,
      invited_by: currentUser.id,
      role,
      status: "PENDING"
    })

  if (inviteError) {
    return { success: false, message: inviteError.message }
  }

  // Envoi de l'email via Resend
  try {
    await resend.emails.send({
      from: 'HubGamers <onboarding@resend.dev>',
      to: email,
      subject: `Invitation à rejoindre ${structName} sur HubGamers`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2>Invitation Structure E-sport</h2>
          <p>Bonjour,</p>
          <p>Vous avez été invité à rejoindre la structure <strong>${structName}</strong> en tant que <strong>${role}</strong>.</p>
          <p>Connectez-vous sur votre tableau de bord <strong>HubGamers</strong> dans l'onglet <strong>Mes Invitations</strong> pour accepter ou refuser cette proposition.</p>
        </div>
      `,
    })
  } catch (mailError) {
    console.error("Erreur d'envoi d'e-mail:", mailError)
  }

  revalidatePath(`/dashboard/structures/${structureId}`)
  return { success: true, message: "Invitation envoyée avec succès !" }
}

// 2. Supprimer un membre de la structure
export async function removeMemberFromStructure(structureId: string, userIdToRemove: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Non authentifié." }

  const isAdmin = await isStructureAdmin(supabase, user.id, structureId)
  if (!isAdmin) {
    return { success: false, message: "Action non autorisée. Seuls les administrateurs peuvent retirer un membre." }
  }

  const { error } = await supabase
    .from("structures_users")
    .delete()
    .eq("structure_id", structureId)
    .eq("user_id", userIdToRemove)

  if (error) {
    return { success: false, message: error.message }
  }

  revalidatePath(`/dashboard/structures/${structureId}`)
  return { success: true, message: "Membre retiré de la structure avec succès." }
}

// 3. Modifier le rôle d'un membre dans la structure
export async function updateStructureMemberRole(structureId: string, userIdToUpdate: string, formData: FormData) {
  const supabase = await createClient()
  const newRole = formData.get("role") as string

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Non authentifié." }

  const isAdmin = await isStructureAdmin(supabase, user.id, structureId)
  if (!isAdmin) {
    return { success: false, message: "Action non autorisée." }
  }

  const { error } = await supabase
    .from("structures_users")
    .update({ role: newRole })
    .eq("structure_id", structureId)
    .eq("user_id", userIdToUpdate)

  if (error) {
    return { success: false, message: error.message }
  }

  revalidatePath(`/dashboard/structures/${structureId}`)
  return { success: true, message: "Rôle mis à jour avec succès." }
}

// 4. Récupérer les membres d'une structure avec leurs infos profil
export async function getStructureMembers(structureId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("structures_users")
    .select(`
      role,
      user:users (
        id,
        email,
        avatar_url
      )
    `)
    .eq("structure_id", structureId)

  if (error || !data) {
    console.error("Erreur récupération membres structure:", error?.message)
    return []
  }

  return data.map((item: any) => ({
    id: item.user?.id,
    email: item.user?.email,
    avatar_url: item.user?.avatar_url,
    role: item.role,
  }))
}