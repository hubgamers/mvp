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
      // 1. Récupérer le match actuel avec ses informations d'étape
      const currentMatch = await tx.tournaments_matches.findUnique({
        where: { id: data.match_id },
        include: { tournaments_stages: true }
      })

      if (!currentMatch) throw new Error("Match introuvable.")

      // 2. Mettre à jour les informations du match actuel
      const match = await tx.tournaments_matches.update({
        where: { id: data.match_id },
        data: {
          winner_roster_id: data.winner_roster_id,
          status_code: data.status_code || "COMPLETED",
          ended_at: data.winner_roster_id ? new Date() : undefined,
        },
      })

      // 3. Mettre à jour ou insérer les manches
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

      // 4. PROPAGATION DU VAINQUEUR POUR UN BRACKET
      // Si l'étape est un BRACKET, qu'un vainqueur est défini et que le match possède un round_number
      const isBracket = currentMatch.tournaments_stages?.type_code?.includes("ELIMINATION") || 
                        currentMatch.tournaments_stages?.type_code?.includes("BRACKET")

      if (isBracket && data.winner_roster_id && currentMatch.round_number) {
        // Récupérer tous les matchs de cette étape triés par ordre de création ou ID pour identifier les paires
        const stageMatches = await tx.tournaments_matches.findMany({
          where: { stage_id: currentMatch.stage_id },
          orderBy: { id: 'asc' } // ou un champ de position/index si vous en avez un
        })

        // Filtrer les matchs du même tour
        const currentRoundMatches = stageMatches.filter(m => (m.round_number || 1) === currentMatch.round_number)
        const matchIndexInRound = currentRoundMatches.findIndex(m => m.id === currentMatch.id)

        if (matchIndexInRound !== -1) {
          // Trouver le match suivant (Tour + 1)
          const nextRoundNumber = currentMatch.round_number + 1
          const nextRoundMatches = stageMatches.filter(m => (m.round_number || 1) === nextRoundNumber)

          if (nextRoundMatches.length > 0) {
            // Index du match suivant dans l'arbre (ex: match 0 et 1 du tour 1 alimentent le match 0 du tour 2)
            const nextMatchIndex = Math.floor(matchIndexInRound / 2)
            const targetNextMatch = nextRoundMatches[nextMatchIndex]

            if (targetNextMatch) {
              // Déterminer s'il doit aller en roster1_id (si index pair) ou roster2_id (si index impair)
              const isEven = matchIndexInRound % 2 === 0
              const updateData = isEven 
                ? { roster1_id: data.winner_roster_id } 
                : { roster2_id: data.winner_roster_id }

              await tx.tournaments_matches.update({
                where: { id: targetNextMatch.id },
                data: updateData,
              })
            }
          }
        }
      }

      return match
    })

    revalidatePath(`/dashboard/matches/${data.match_id}`)
    revalidatePath(`/tournaments`)
    return { success: true, message: "Score mis à jour et équipe propagée avec succès.", match: updated }
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

export async function sendDisputeMessage(dispute_id: string, message: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Non authentifié." }

  if (!message.trim()) return { success: false, message: "Le message ne peut pas être vide." }

  try {
    // 1. Insérer le message de litige en base de données
    const newMessage = await prisma.match_dispute_messages.create({
      data: {
        dispute_id: dispute_id,
        user_id: user.id,
        message: message.trim(),
      },
      include: {
        users: {
          select: { display_name: true },
        },
      },
    })

    // 2. Récupérer le match_id associé pour revalider le chemin
    const dispute = await prisma.match_disputes.findUnique({
      where: { id: dispute_id },
      select: { match_id: true },
    })

    if (dispute) {
      revalidatePath(`/dashboard/matches/${dispute.match_id}`)
    }

    return { success: true, message: "Message envoyé avec succès.", data: newMessage }
  } catch (error) {
    console.error("Erreur sendDisputeMessage:", error)
    return { success: false, message: "Impossible d'envoyer le message." }
  }
}

export async function sendMatchMessage(match_id: string, message: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Non authentifié." }

  if (!message.trim()) return { success: false, message: "Le message ne peut pas être vide." }

  try {
    const newMessage = await prisma.match_messages.create({
      data: {
        match_id: match_id,
        user_id: user.id,
        message: message.trim(),
      },
      include: {
        users: {
          select: { display_name: true },
        },
      },
    })

    revalidatePath(`/dashboard/matches/${match_id}`)
    return { success: true, message: "Message envoyé.", data: newMessage }
  } catch (error) {
    console.error("Erreur sendMatchMessage:", error)
    return { success: false, message: "Impossible d'envoyer le message." }
  }
}