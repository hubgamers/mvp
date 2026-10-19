'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

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
      role: "CAPTAIN", // Le créateur/membre l'inscrit en tant que capitaine ou rôle par défaut
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
  role?: 'MANAGER' | 'CAPTAIN' | 'PLAYER'
  structure?: {
    id: string
    name: string
  }
}

// Récupérer toutes les équipes liées à une structure
export async function getTeamsByStructureId(structureId: string): Promise<TeamDetail[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("structures_teams")
    .select(`
      role,
      team:teams (
        id,
        name,
        game,
        platform,
        created_at
      )
    `)
    .eq("structure_id", structureId)

  if (error || !data) {
    console.error("Erreur récupération équipes structure:", error?.message)
    return []
  }

  return data.map((item: any) => ({
    ...item.team,
    role: item.role,
  })) as TeamDetail[]
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

  const email = formData.get("email") as string
  const role = formData.get("role") as 'MANAGER' | 'CAPTAIN' | 'PLAYER'

  if (!email) {
    return { success: false, message: "L'email du membre est obligatoire." }
  }

  // 1. Trouver l'utilisateur par son email dans la table `users`
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single()

  if (userError || !user) {
    return { success: false, message: "Aucun utilisateur trouvé avec cet email." }
  }

  // 2. Insérer dans la table de liaison `teams_users`
  const { error: insertError } = await supabase
    .from("teams_users")
    .insert({
      team_id: teamId,
      user_id: user.id,
      role: role || "PLAYER",
    })

  if (insertError) {
    if (insertError.code === "23505") {
      return { success: false, message: "Cet utilisateur fait déjà partie de l'équipe." }
    }
    return { success: false, message: insertError.message }
  }

  revalidatePath(`/dashboard/structures/${structureId}/teams/${teamId}`)
  return { success: true, message: "Membre ajouté avec succès !" }
}