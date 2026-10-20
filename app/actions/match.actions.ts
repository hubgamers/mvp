// app/actions/match.actions.ts
'use server'

import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Mettre à jour le score d'un match ou d'un jeu
export async function updateMatchScore(matchId: string, gameNumber: number, scoreA: number, scoreB: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Non authentifié." }

  try {
    // Mettre à jour ou créer le score du jeu spécifique
    await prisma.match_games.upsert({
      where: {
        match_id_game_number: {
          match_id: matchId,
          game_number: gameNumber,
        },
      },
      update: {
        score_a: scoreA,
        score_b: scoreB,
      },
      create: {
        match_id: matchId,
        game_number: gameNumber,
        score_a: scoreA,
        score_b: scoreB,
      },
    })

    revalidatePath(`/dashboard/matches/${matchId}`)
    return { success: true, message: "Scores mis à jour avec succès." }
  } catch (error: any) {
    console.error("Erreur updateMatchScore:", error)
    return { success: false, message: error?.message || "Erreur lors de la mise à jour du score." }
  }
}