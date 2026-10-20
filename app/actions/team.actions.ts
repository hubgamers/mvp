'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function createTeamForStructure(structureId: string, prevState: any, formData: FormData) {
  const supabase = await createClient()

  const name = formData.get("name") as string
  const game = formData.get("game") as string
  const platform = formData.get("platform") as 'PC' | 'PLAYSTATION' | 'XBOX'

  if (!name || !game) {
    return { success: false, message: "Le nom de l'équipe et le jeu sont obligatoires." }
  }

  // 1. Créer l'équipe dans la table `teams`
  const { data: newTeam, error: teamError } = await supabase
    .from("teams")
    .insert({
      name,
      game,
      platform: platform || "PC",
    })
    .select()
    .single()

  if (teamError || !newTeam) {
    return { success: false, message: teamError?.message || "Erreur lors de la création de l'équipe." }
  }

  // 2. Lier l'équipe à la structure dans la table de jointure `structures_teams`
  const { error: relationError } = await supabase
    .from("structures_teams")
    .insert({
      structure_id: structureId,
      team_id: newTeam.id,
    })

  if (relationError) {
    return { success: false, message: relationError.message }
  }

  revalidatePath(`/dashboard/structures/${structureId}`)
  return { success: true, message: "Équipe créée et rattachée avec succès !" }
}

export interface TeamDetail {
  id: string
  name: string
  game: string
  platform: 'PC' | 'PLAYSTATION' | 'XBOX'
  created_at: string
  structure?: {
    id: string
    name: string
  }
}

// Récupérer toutes les équipes liées à une structure
export async function getTeamsByStructureId(structureId: string): Promise<TeamDetail[]> {
  const supabase = await createClient()
  console.log("getTeamsByStructureId")

  // 1. On sélectionne uniquement la relation vers `teams`
  const { data, error } = await supabase
    .from("structures_teams")
    .select(`
      team:teams (
        id,
        name,
        game,
        platform,
        created_at
      )
    `)
    .eq("structure_id", structureId)

  if (error) {
    console.error("Erreur récupération équipes structure:", error.message)
    return []
  }


  if (!data || data.length === 0) {
    return []
  }


  // 2. Extraire et nettoyer les objets team (en gérant le cas où Supabase renvoie un objet ou un tableau)
  const teams = data
    .map((item: any) => item.team)
    .filter((team: any) => team !== null)

  return teams as TeamDetail[]
}

// Récupérer le détail d'une équipe par son ID
export async function getTeamById(teamId: string, structureId?: string): Promise<TeamDetail | null> {
  const supabase = await createClient()

  const { data: team, error } = await supabase
    .from("teams")
    .select("*")
    .eq("id", teamId)
    .single()

  if (error || !team) return null

  // Récupérer les membres de l'équipe
  const { data: membersData } = await supabase
    .from("teams_users")
    .select(`
      role,
      user:users (
        id,
        email,
        avatar_url
      )
    `)
    .eq("team_id", teamId)

  return {
    ...team,
    members: membersData?.map((item: any) => ({
      ...item.user,
      role: item.role,
    })) || [],
  } as TeamDetail
}

export async function addMemberToTeam(teamId: string, structureId: string, prevState: any, formData: FormData) {
  const supabase = await createClient()

  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser) return { success: false, message: "Non authentifié." }

  const email = (formData.get("email") as string)?.trim().toLowerCase()
  const role = formData.get("role") as 'MANAGER' | 'CAPTAIN' | 'PLAYER'

  if (!email) {
    return { success: false, message: "L'email du membre est obligatoire." }
  }

  // 1. Vérifier si l'utilisateur existe ET s'il est DÉJÀ membre actif de l'équipe
  const { data: targetUser } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle()

  if (targetUser) {
    const { data: existingMember } = await supabase
      .from("teams_users")
      .select("team_id")
      .eq("team_id", teamId)
      .eq("user_id", targetUser.id)
      .maybeSingle()

    if (existingMember) {
      return { success: false, message: "Cet utilisateur fait déjà partie de l'équipe." }
    }
  }

  // 2. Vérifier s'il existe DÉJÀ une invitation PENDING en cours
  const { data: pendingInvite } = await supabase
    .from("invitations")
    .select("id")
    .eq("email", email)
    .eq("target_id", teamId)
    .eq("type", "TEAM")
    .eq("status", "PENDING")
    .maybeSingle()

  if (pendingInvite) {
    return { success: false, message: "Une invitation est déjà en attente pour cette adresse email." }
  }

  // 3. Si aucune invitation PENDING n'existe (soit aucune, soit de nouvelles après un refus/retrait), on crée l'invitation
  const { data: teamData } = await supabase.from("teams").select("name").eq("id", teamId).single()
  const teamName = teamData?.name || "l'équipe"

  const { error: inviteError } = await supabase
    .from("invitations")
    .insert({
      email,
      type: 'TEAM',
      target_id: teamId,
      invited_by: currentUser.id,
      role: role || "PLAYER",
      status: "PENDING"
    })

  if (inviteError) {
    return { success: false, message: inviteError.message }
  }

  // 4. Envoi de l'e-mail via Resend
  try {
    await resend.emails.send({
      from: 'HubGamers <onboarding@resend.dev>',
      to: email,
      subject: `Invitation à rejoindre l'équipe ${teamName} sur HubGamers`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2>Invitation E-sport</h2>
          <p>Bonjour,</p>
          <p>Vous avez été invité à rejoindre l'équipe <strong>${teamName}</strong> en tant que <strong>${role}</strong>.</p>
          <p>Rendez-vous dans votre espace <strong>Mes Invitations</strong> sur HubGamers pour accepter ou refuser.</p>
        </div>
      `,
    })
  } catch (mailError) {
    console.error("Erreur envoi email:", mailError)
  }

  revalidatePath(`/dashboard/structures/${structureId}/teams/${teamId}`)
  return { success: true, message: "Invitation envoyée avec succès !" }
}

// Fonction utilitaire interne pour vérifier si l'utilisateur a les droits de gestion sur l'équipe
async function canManageTeam(supabase: any, userId: string, teamId: string, structureId: string) {
  // 1. Vérifier si l'utilisateur est ADMIN de la structure
  const { data: structUser } = await supabase
    .from("structures_users")
    .select("role")
    .eq("structure_id", structureId)
    .eq("user_id", userId)
    .single()

  if (structUser && structUser.role === 'ADMIN') {
    return true
  }

  // 2. Vérifier si l'utilisateur est CAPTAIN ou MANAGER de l'équipe
  const { data: teamUser } = await supabase
    .from("teams_users")
    .select("role")
    .eq("team_id", teamId)
    .eq("user_id", userId)
    .single()

  if (teamUser && (teamUser.role === 'CAPTAIN' || teamUser.role === 'MANAGER')) {
    return true
  }

  return false
}

// Suppression d'un membre avec vérification des droits
export async function removeMemberFromTeam(teamId: string, structureId: string, userIdToRemove: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Non authentifié." }

  // Vérifier les droits
  const authorized = await canManageTeam(supabase, user.id, teamId, structureId)
  if (!authorized) {
    return { success: false, message: "Action non autorisée. Vous devez être administrateur de la structure ou gestionnaire de l'équipe." }
  }

  const { error } = await supabase
    .from("teams_users")
    .delete()
    .eq("team_id", teamId)
    .eq("user_id", userIdToRemove)

  if (error) {
    return { success: false, message: error.message }
  }

  revalidatePath(`/dashboard/structures/${structureId}/teams/${teamId}`)
  return { success: true, message: "Membre retiré de l'équipe avec succès." }
}

// Modification du rôle d'un membre avec vérification des droits
export async function updateTeamMemberRole(teamId: string, structureId: string, userIdToUpdate: string, formData: FormData) {
  const supabase = await createClient()
  const newRole = formData.get("role") as string

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, name: "error", message: "Non authentifié." }

  // Vérifier les droits
  const authorized = await canManageTeam(supabase, user.id, teamId, structureId)
  if (!authorized) {
    return { success: false, message: "Action non autorisée." }
  }

  const { error } = await supabase
    .from("teams_users")
    .update({ role: newRole })
    .eq("team_id", teamId)
    .eq("user_id", userIdToUpdate)

  if (error) {
    return { success: false, message: error.message }
  }

  revalidatePath(`/dashboard/structures/${structureId}/teams/${teamId}`)
  return { success: true, message: "Rôle mis à jour avec succès." }
}

export interface SearchedTeam {
  id: string
  name: string
  game?: string
  structureName?: string
}

export async function searchTeamsForTournament(
  query: string,
  excludeTeamIds: string[] = []
): Promise<SearchedTeam[]> {
  const supabase = await createClient()

  if (!query || query.trim().length < 2) {
    return []
  }

  const cleanQuery = query.trim()

  // 1. Rechercher les équipes par leur nom directement
  const { data: teamsByName, error: teamError } = await supabase
    .from("teams")
    .select(`
      id,
      name,
      game,
      structures_teams (
        structure:structures (
          name
        )
      )
    `)
    .ilike("name", `%${cleanQuery}%`)
    .limit(10)

  if (teamError) {
    console.error("Erreur recherche teamsByName:", teamError.message)
  }

  // 2. Rechercher les structures par leur nom pour trouver leurs équipes associées
  const { data: structuresByName, error: structError } = await supabase
    .from("structures")
    .select(`
      id,
      name,
      structures_teams (
        team:teams (
          id,
          name,
          game
        )
      )
    `)
    .ilike("name", `%${cleanQuery}%`)
    .limit(10)

  if (structError) {
    console.error("Erreur recherche structuresByName:", structError.message)
  }

  // 3. Fusionner et dédoublonner les résultats
  const excludeSet = new Set(excludeTeamIds)
  const resultMap = new Map<string, SearchedTeam>()

  // Ajouter les équipes trouvées par leur nom
  if (teamsByName) {
    for (const team of teamsByName as any[]) {
      if (!excludeSet.has(team.id)) {
        const structureName = team.structures_teams?.[0]?.structure?.name || undefined
        resultMap.set(team.id, {
          id: team.id,
          name: team.name,
          game: team.game,
          structureName,
        })
      }
    }
  }

  // Ajouter les équipes trouvées via le nom de leur structure
  if (structuresByName) {
    for (const struct of structuresByName as any[]) {
      const structName = struct.name
      const teamsList = struct.structures_teams || []

      for (const rel of teamsList) {
        const team = rel.team
        if (team && !excludeSet.has(team.id) && !resultMap.has(team.id)) {
          resultMap.set(team.id, {
            id: team.id,
            name: team.name,
            game: team.game,
            structureName: structName,
          })
        }
      }
    }
  }

  return Array.from(resultMap.values())
}