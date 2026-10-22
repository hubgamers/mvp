
'use server'
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface UpdateMatchScoreInput {
  match_id: string
  winner_roster_id?: string
  status_code?: string
  games?: {
    game_number: number
    roster1_score: number
    roster2_score: number
    winner_roster_id?: string
    map_name?: string
  }[]
}

export async function updateMatchScore(data: UpdateMatchScoreInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Non authentifié." }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      // 1. Mettre à jour les informations du match
      const match = await tx.tournaments_matches.update({
        where: { id: data.match_id },
        data: {
          winner_roster_id: data.winner_roster_id,
          status_code: data.status_code || "COMPLETED",
          ended_at: data.winner_roster_id ? new Date() : undefined,
        },
      })

      // 2. Mettre à jour ou insérer les manches
      if (data.games && data.games.length > 0) {
        for (const game of data.games) {
          const existingGame = await tx.tournaments_match_games.findFirst({
            where: {
              match_id: data.match_id,
              game_number: game.game_number,
            },
          })

          if (existingGame) {
            await tx.tournaments_match_games.update({
              where: { id: existingGame.id },
              data: {
                roster1_score: game.roster1_score,
                roster2_score: game.roster2_score,
                winner_roster_id: game.winner_roster_id,
                map_name: game.map_name,
              },
            })
          } else {
            await tx.tournaments_match_games.create({
              data: {
                match_id: data.match_id,
                game_number: game.game_number,
                roster1_score: game.roster1_score,
                roster2_score: game.roster2_score,
                winner_roster_id: game.winner_roster_id,
                map_name: game.map_name,
              },
            })
          }
        }
      }

      return match
    })

    revalidatePath(`/dashboard/matches/${data.match_id}`)
    return { success: true, message: "Score mis à jour avec succès.", match: updated }
  } catch (error) {
    console.error("Erreur updateMatchScore:", error)
    return { success: false, message: "Impossible de mettre à jour le score du match." }
  }
}

export async function matchCheckIn(match_id: string, roster_num: 1 | 2) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Non authentifié." }

  try {
    const dataToUpdate = roster_num === 1 
      ? { roster1_checked_in: true } 
      : { roster2_checked_in: true }

    const match = await prisma.tournaments_matches.update({
      where: { id: match_id },
      data: dataToUpdate,
    })

    revalidatePath(`/dashboard/matches/${match_id}`)
    return { success: true, message: "Check-in confirmé avec succès.", match }
  } catch (error) {
    console.error("Erreur matchCheckIn:", error)
    return { success: false, message: "Impossible de valider le check-in du match." }
  }
}

interface OpenDisputeInput {
  match_id: string
  reason: string
}

export async function openMatchDispute(data: OpenDisputeInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Non authentifié." }

  try {
    await prisma.$transaction([
      prisma.match_disputes.create({
        data: {
          match_id: data.match_id,
          opened_by_user_id: user.id,
          reason: data.reason,
          status_code: "OPEN",
        },
      }),
      prisma.tournaments_matches.update({
        where: { id: data.match_id },
        data: { status_code: "DISPUTED" },
      }),
    ])

    revalidatePath(`/dashboard/matches/${data.match_id}`)
    return { success: true, message: "Litige ouvert avec succès. Un arbitre va intervenir." }
  } catch (error) {
    console.error("Erreur openMatchDispute:", error)
    return { success: false, message: "Impossible d'ouvrir le litige." }
  }
}

export async function resolveMatchDispute(dispute_id: string, resolution_notes: string, winner_roster_id?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Non authentifié." }

  try {
    const dispute = await prisma.match_disputes.update({
      where: { id: dispute_id },
      data: {
        handled_by_user_id: user.id,
        resolution_notes,
        status_code: "RESOLVED",
      },
    })

    if (winner_roster_id) {
      await prisma.tournaments_matches.update({
        where: { id: dispute.match_id },
        data: {
          winner_roster_id,
          status_code: "COMPLETED",
          ended_at: new Date(),
        },
      })
    }

    revalidatePath(`/dashboard/matches/${dispute.match_id}`)
    return { success: true, message: "Litige résolu avec succès." }
  } catch (error) {
    console.error("Erreur resolveMatchDispute:", error)
    return { success: false, message: "Impossible de résoudre le litige." }
  }
}
