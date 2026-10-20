// app/actions/structure.actions.ts
'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getCurrentUserWithProfile } from "./auth.actions"
import { Resend } from "resend"
import { createClient } from "@/lib/supabase/server" // Gardé uniquement pour récupérer l'utilisateur auth Supabase si besoin

const resend = new Resend(process.env.RESEND_API_KEY)

export async function getStructures() {
  const supabase = await createClient()

  // 1. Récupérer l'utilisateur connecté via Supabase Auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  try {
    // 2. Récupérer toutes les structures avec le profil créateur via Prisma
    const structures = await prisma.structures.findMany({
      include: {
        profiles: {
          select: {
            id: true,
            username: true,
            avatar_url: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    })

    // 3. Récupérer les rôles de l'utilisateur connecté pour toutes les structures
    const userRoles = await prisma.structure_members.findMany({
      where: {
        user_id: user.id,
      },
      select: {
        structure_id: true,
        role: true,
      },
    })

    // Créer un Set des structures où l'utilisateur est ADMIN ou OWNER
    const adminStructureIds = new Set(
      userRoles
        ?.filter((item) => item.role === "ADMIN" || item.role === "OWNER")
        .map((item) => item.structure_id) || []
    )

    // 4. Injecter `creator` (pour correspondre au format attendu) et `isAdmin`
    return structures.map((structure) => ({
      ...structure,
      creator: structure.profiles,
      isAdmin: adminStructureIds.has(structure.id),
    }))
  } catch (error) {
    console.error("Erreur récupération structures:", error)
    return []
  }
}

export async function getMyStructures() {
  const user = await getCurrentUserWithProfile()
  if (!user.user?.id) return []

  const userId = user.user.id

  try {
    // 1. Récupérer les relations membres de l'utilisateur
    const memberRelations = await prisma.structure_members.findMany({
      where: { user_id: userId },
      select: { structure_id: true, role: true },
    })

    const memberStructureIds = memberRelations.map((rel) => rel.structure_id)

    const adminStructureIds = new Set(
      memberRelations
        .filter((rel) => rel.role === "ADMIN" || rel.role === "OWNER")
        .map((rel) => rel.structure_id)
    )

    // 2. Récupérer les structures créées ou dont l'utilisateur est membre
    const data = await prisma.structures.findMany({
      where: {
        OR: [
          { created_by: userId },
          ...(memberStructureIds.length > 0 ? [{ id: { in: memberStructureIds } }] : []),
        ],
      },
      include: {
        profiles: {
          select: {
            id: true,
            username: true,
            avatar_url: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    })

    // 3. Mapper les données
    return data.map((structure) => ({
      ...structure,
      creator: structure.profiles,
      isAdmin: adminStructureIds.has(structure.id) || structure.created_by === userId,
    }))
  } catch (error) {
    console.error("Erreur récupération structures:", error)
    return []
  }
}

// Récupérer une structure par son ID
export async function getStructureById(id: string) {
  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser) return null

  try {
    // 1. Récupérer la structure avec son créateur, ses membres et leurs profils liés
    const structure = await prisma.structures.findUnique({
      where: { id },
      include: {
        profiles: {
          select: {
            id: true,
            username: true,
            avatar_url: true,
          },
        },
        structure_members: {
          include: {
            profiles: {
              select: {
                id: true,
                username: true,
                avatar_url: true,
                created_at: true,
              },
            },
          },
        },
        structure_teams: {
          include: {
            teams: true,
          },
        },
      },
    })

    if (!structure) return null

    // 2. Déterminer si l'utilisateur courant est ADMIN ou OWNER
    const currentUserMembership = structure.structure_members.find(
      (m) => m.user_id === currentUser.id
    )
    const isAdmin = currentUserMembership?.role === 'ADMIN' || currentUserMembership?.role === 'OWNER'

    // 3. Formater proprement les membres
    const formattedMembers = structure.structure_members.map((m) => ({
      ...m.profiles,
      role: m.role,
    })).filter((m) => m.id)

    return {
      ...structure,
      creator: structure.profiles,
      isAdmin,
      members: formattedMembers,
      teams: structure.structure_teams.map((item) => item.teams).filter(Boolean),
    }
  } catch (error) {
    console.error("Erreur getStructureById:", error)
    return null
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

  // Générer un slug simple basé sur le nom
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "") + "-" + Date.now().toString().slice(-4)

  try {
    // 1. Créer la structure et ajouter l'administrateur en une seule transaction
    const structure = await prisma.$transaction(async (tx) => {
      const newStruct = await tx.structures.create({
        data: {
          name,
          slug,
          created_by: user.id,
        },
      })

      // 2. Ajouter automatiquement le créateur comme OWNER/ADMIN dans `structure_members`
      await tx.structure_members.create({
        data: {
          structure_id: newStruct.id,
          user_id: user.id,
          role: "OWNER",
        },
      })

      return newStruct
    })

    revalidatePath("/dashboard/structures")
    redirect(`/dashboard/structures/${structure.id}`)
  } catch (error: any) {
    console.error("Erreur création structure:", error)
    return { success: false, message: error?.message || "Erreur lors de la création de la structure." }
  }
}

// Modifier une structure
export async function updateStructure(structureId: string, prevState: any, formData: FormData) {
  const name = formData.get("name") as string

  if (!name) {
    return { success: false, message: "Le nom de la structure est obligatoire." }
  }

  try {
    await prisma.structures.update({
      where: { id: structureId },
      data: { name },
    })

    revalidatePath(`/dashboard/structures/${structureId}`)
    revalidatePath("/dashboard/structures")
    redirect(`/dashboard/structures/${structureId}`)
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

// Fonction utilitaire pour vérifier si l'utilisateur est ADMIN ou OWNER de la structure
async function isStructureAdmin(userId: string, structureId: string) {
  const membership = await prisma.structure_members.findUnique({
    where: {
      structure_id_user_id: {
        structure_id: structureId,
        user_id: userId,
      },
    },
    select: { role: true },
  })

  return membership?.role === 'ADMIN' || membership?.role === 'OWNER'
}

// 1. Inviter un membre dans la structure
export async function inviteMemberToStructure(structureId: string, prevState: any, formData: FormData) {
  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser) return { success: false, message: "Non authentifié." }

  const email = (formData.get("email") as string)?.trim().toLowerCase()
  const role = ((formData.get("role") as string) || "MEMBER") as any

  if (!email) {
    return { success: false, message: "L'email est obligatoire." }
  }

  // Vérification des droits d'admin
  const isAdmin = await isStructureAdmin(currentUser.id, structureId)
  if (!isAdmin) {
    return { success: false, message: "Action non autorisée. Vous devez être administrateur." }
  }

  try {
    // Vérifier si l'utilisateur existe via son email dans le schéma auth ou profiles
    // Comme la table users d'auth n'est pas forcément liée directement par email simple sans passer par un lookup,
    // on cherche d'abord dans la table users d'auth de Prisma si possible ou par l'intermédiaire des profils liés.
    const targetUser = await prisma.users.findFirst({
      where: { email },
      select: { id: true },
    })

    if (targetUser) {
      const existingMember = await prisma.structure_members.findUnique({
        where: {
          structure_id_user_id: {
            structure_id: structureId,
            user_id: targetUser.id,
          },
        },
      })

      if (existingMember) {
        return { success: false, message: "Cet utilisateur fait déjà partie de la structure." }
      }
    }

    // Vérifier si une invitation PENDING existe déjà
    const pendingInvite = await prisma.invitations.findFirst({
      where: {
        email,
        target_id: structureId,
        target_type: "STRUCTURE",
        status: "PENDING",
      },
    })

    if (pendingInvite) {
      return { success: false, message: "Une invitation est déjà en attente pour cet email." }
    }

    // Récupérer le nom de la structure
    const structure = await prisma.structures.findUnique({
      where: { id: structureId },
      select: { name: true },
    })

    const structName = structure?.name || "la structure"

    // Créer l'invitation dans la table correspondante
    await prisma.invitations.create({
      data: {
        email,
        target_type: "STRUCTURE",
        target_id: structureId,
        invited_by: currentUser.id,
        role,
        status: "PENDING",
        token_hash: crypto.randomUUID(), // Assure l'unicité du token requis par le schéma
      },
    })

    // Envoi de l'email via Resend
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

    revalidatePath(`/dashboard/structures/${structureId}`)
    return { success: true, message: "Invitation envoyée avec succès !" }
  } catch (error: any) {
    console.error("Erreur invitation:", error)
    return { success: false, message: error?.message || "Erreur lors de l'invitation." }
  }
}

// 2. Supprimer un membre de la structure
export async function removeMemberFromStructure(structureId: string, userIdToRemove: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Non authentifié." }

  const isAdmin = await isStructureAdmin(user.id, structureId)
  if (!isAdmin) {
    return { success: false, message: "Action non autorisée. Seuls les administrateurs peuvent retirer un membre." }
  }

  try {
    await prisma.structure_members.delete({
      where: {
        structure_id_user_id: {
          structure_id: structureId,
          user_id: userIdToRemove,
        },
      },
    })

    revalidatePath(`/dashboard/structures/${structureId}`)
    return { success: true, message: "Membre retiré de la structure avec succès." }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

// 3. Modifier le rôle d'un membre dans la structure
export async function updateStructureMemberRole(structureId: string, userIdToUpdate: string, formData: FormData) {
  const supabase = await createClient()
  const newRole = formData.get("role") as any

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Non authentifié." }

  const isAdmin = await isStructureAdmin(user.id, structureId)
  if (!isAdmin) {
    return { success: false, message: "Action non autorisée." }
  }

  try {
    await prisma.structure_members.update({
      where: {
        structure_id_user_id: {
          structure_id: structureId,
          user_id: userIdToUpdate,
        },
      },
      data: { role: newRole },
    })

    revalidatePath(`/dashboard/structures/${structureId}`)
    return { success: true, message: "Rôle mis à jour avec succès." }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

// 4. Récupérer les membres d'une structure avec leurs infos profil
export async function getStructureMembers(structureId: string) {
  try {
    const data = await prisma.structure_members.findMany({
      where: { structure_id: structureId },
      include: {
        profiles: {
          select: {
            id: true,
            username: true,
            avatar_url: true,
          },
        },
      },
    })

    return data.map((item) => ({
      id: item.profiles?.id,
      email: item.profiles?.username, // ou autre champ du profil si l'email vient de la table auth
      avatar_url: item.profiles?.avatar_url,
      role: item.role,
    }))
  } catch (error) {
    console.error("Erreur getStructureMembers:", error)
    return []
  }
}