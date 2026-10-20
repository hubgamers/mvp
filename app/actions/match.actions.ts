'use server'

import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { getMatchDetailsForUser } from "@/lib/matches"
import { ensurePublicProfile } from "@/lib/profiles"

const CHAT_MESSAGE_MAX_LENGTH = 1000

export async function updateMatchScore(matchId: string, gameNumber: number, scoreA: number, scoreB: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Non authentifié." }
  if (
    !Number.isInteger(gameNumber) ||
    !Number.isInteger(scoreA) ||
    !Number.isInteger(scoreB) ||
    scoreA < 0 ||
    scoreB < 0 ||
    scoreA > 1000 ||
    scoreB > 1000
  ) {
    return { success: false, message: "Les scores saisis sont invalides." }
  }

  try {
    const access = await getMatchDetailsForUser(matchId, user.id)
    if (!access?.canManageMatch) {
      return { success: false, message: "Vous n’êtes pas autorisé à modifier ce match." }
    }
    const { match } = access
    if (gameNumber < 1 || gameNumber > match.best_of) {
      return { success: false, message: "Le numéro de manche est invalide pour ce match." }
    }
    if (["COMPLETED", "CANCELLED", "BYE"].includes(match.status)) {
      return { success: false, message: "Ce match ne peut plus être modifié." }
    }

    const winnerSide = scoreA === scoreB ? null : scoreA > scoreB ? "A" : "B"
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
        winner_side: winnerSide,
      },
      create: {
        match_id: matchId,
        game_number: gameNumber,
        score_a: scoreA,
        score_b: scoreB,
        winner_side: winnerSide,
      },
    })

    revalidatePath(`/dashboard/matches/${matchId}`)
    revalidatePath(`/dashboard/tournaments/${match.tournaments.id}`)
    return { success: true, message: "Score mis à jour avec succès." }
  } catch (error) {
    console.error("Erreur updateMatchScore:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erreur lors de la mise à jour du score.",
    }
  }
}

export async function getMatchChatMessages(matchId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false as const, message: "Non authentifié." }

  try {
    const access = await getMatchDetailsForUser(matchId, user.id)
    if (!access?.canUseMatchChat) {
      return { success: false as const, message: "Le chat est réservé aux participants de ce match." }
    }

    const messages = await prisma.match_messages.findMany({
      where: { match_id: matchId },
      orderBy: { created_at: "desc" },
      take: 50,
      include: {
        profiles: { select: { username: true, display_name: true, avatar_url: true } },
      },
    })

    return {
      success: true as const,
      messages: messages.reverse().map((item) => ({
        id: item.id,
        senderId: item.sender_id,
        senderName: item.profiles.display_name || item.profiles.username || "Joueur",
        avatarUrl: item.profiles.avatar_url,
        content: item.content,
        createdAt: item.created_at.toISOString(),
      })),
    }
  } catch (error) {
    console.error("Erreur getMatchChatMessages:", error)
    return { success: false as const, message: "Impossible de charger les messages du match." }
  }
}

export async function sendMatchChatMessage(matchId: string, rawContent: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false as const, message: "Non authentifié." }

  if (typeof rawContent !== "string") {
    return { success: false as const, message: "Le message saisi est invalide." }
  }
  const content = rawContent.trim()
  if (!content || content.length > CHAT_MESSAGE_MAX_LENGTH) {
    return { success: false as const, message: "Le message doit contenir entre 1 et 1000 caractères." }
  }

  try {
    const access = await getMatchDetailsForUser(matchId, user.id)
    if (!access?.canUseMatchChat) {
      return { success: false as const, message: "Le chat est réservé aux participants de ce match." }
    }

    const profile = await ensurePublicProfile(user)
    const item = await prisma.match_messages.create({
      data: { match_id: matchId, sender_id: user.id, content },
      include: {
        profiles: { select: { username: true, display_name: true, avatar_url: true } },
      },
    })

    revalidatePath(`/dashboard/matches/${matchId}`)
    return {
      success: true as const,
      chatMessage: {
        id: item.id,
        senderId: profile.id,
        senderName: item.profiles.display_name || item.profiles.username || "Joueur",
        avatarUrl: item.profiles.avatar_url,
        content: item.content,
        createdAt: item.created_at.toISOString(),
      },
    }
  } catch (error) {
    console.error("Erreur sendMatchChatMessage:", error)
    return { success: false as const, message: "Impossible d’envoyer le message." }
  }
}

export async function updateMatchStream(matchId: string, rawStreamUrl: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Non authentifié." }

  if (typeof rawStreamUrl !== "string") {
    return { success: false, message: "Saisissez une URL de diffusion HTTPS valide." }
  }
  const input = rawStreamUrl.trim()
  let streamUrl: string | null = null
  if (input) {
    try {
      const parsedUrl = new URL(input)
      if (
        parsedUrl.protocol !== "https:" ||
        !parsedUrl.hostname ||
        parsedUrl.username ||
        parsedUrl.password ||
        input.length > 2048
      ) {
        return { success: false, message: "Saisissez une URL de diffusion HTTPS valide." }
      }
      streamUrl = parsedUrl.toString()
    } catch {
      return { success: false, message: "Saisissez une URL de diffusion HTTPS valide." }
    }
  }

  try {
    const access = await getMatchDetailsForUser(matchId, user.id)
    if (!access?.canManageBroadcast) {
      return { success: false, message: "Seul l’organisateur peut gérer la diffusion de ce match." }
    }

    await prisma.matches.update({
      where: { id: matchId },
      data: { stream_url: streamUrl },
    })
    revalidatePath(`/dashboard/matches/${matchId}`)
    return {
      success: true,
      message: streamUrl ? "Lien de diffusion enregistré." : "Lien de diffusion supprimé.",
    }
  } catch (error) {
    console.error("Erreur updateMatchStream:", error)
    return { success: false, message: "Impossible de mettre à jour la diffusion." }
  }
}
