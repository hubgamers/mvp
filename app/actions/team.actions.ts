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