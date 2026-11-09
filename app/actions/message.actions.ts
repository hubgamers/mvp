'use server'

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

const messagesPath = "/dashboard/messages"
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

async function getAuthenticatedUserId() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) throw error
  return user?.id ?? null
}

export async function searchDirectMessageUsers(query: string) {
  const userId = await getAuthenticatedUserId()
  if (!userId) return { success: false as const, message: "Connectez-vous pour rechercher des joueurs.", users: [] }
  if (typeof query !== "string") {
    return { success: false as const, message: "Recherche invalide.", users: [] }
  }

  const normalizedQuery = query.trim()
  if (normalizedQuery.length < 2) return { success: true as const, users: [] }
  if (normalizedQuery.length > 64) {
    return { success: false as const, message: "La recherche est trop longue.", users: [] }
  }

  try {
    const users = await prisma.users.findMany({
      where: {
        id: { not: userId },
        display_name: { contains: normalizedQuery, mode: "insensitive" },
      },
      select: { id: true, display_name: true },
      orderBy: { display_name: "asc" },
      take: 8,
    })

    return { success: true as const, users }
  } catch (error) {
    console.error("Erreur searchDirectMessageUsers:", error)
    return { success: false as const, message: "Impossible de rechercher des joueurs.", users: [] }
  }
}

export async function startDirectConversation(recipientId: string) {
  const userId = await getAuthenticatedUserId()
  if (!userId) return { success: false as const, message: "Non authentifié." }
  console.log('recipientId', recipientId, typeof recipientId)
  if (typeof recipientId !== "string" || !uuidPattern.test(recipientId) || recipientId === userId) {
    return { success: false as const, message: "Destinataire invalide." }
  }

  try {
    const recipient = await prisma.users.findUnique({
      where: { id: recipientId },
      select: { id: true },
    })
    if (!recipient) return { success: false as const, message: "Joueur introuvable." }

    const [user1_id, user2_id] = [userId, recipientId].sort()
    console.log('test', user1_id, user2_id)
    const conversation = await prisma.direct_conversations.upsert({
      where: { user1_id_user2_id: { user1_id, user2_id } },
      create: { user1_id, user2_id },
      update: {},
      select: { id: true },
    })

    revalidatePath(messagesPath)
    return { success: true as const, conversationId: conversation.id }
  } catch (error) {
    console.error("Erreur startDirectConversation:", error)
    return { success: false as const, message: "Impossible de démarrer la conversation." }
  }
}

export async function sendDirectMessage(conversationId: string, message: string) {
  const userId = await getAuthenticatedUserId()
  if (!userId) return { success: false as const, message: "Non authentifié." }

  if (typeof message !== "string") {
    return { success: false as const, message: "Message invalide." }
  }
  const normalizedMessage = message.trim()
  if (typeof conversationId !== "string" || !uuidPattern.test(conversationId) || normalizedMessage.length === 0 || normalizedMessage.length > 2000) {
    return { success: false as const, message: "Le message doit contenir entre 1 et 2 000 caractères." }
  }

  try {
    const conversation = await prisma.direct_conversations.findFirst({
      where: {
        id: conversationId,
        OR: [{ user1_id: userId }, { user2_id: userId }],
      },
      select: { id: true },
    })
    if (!conversation) return { success: false as const, message: "Conversation introuvable." }

    await prisma.$transaction([
      prisma.direct_messages.create({
        data: {
          conversation_id: conversation.id,
          sender_id: userId,
          message: normalizedMessage,
        },
      }),
      prisma.direct_conversations.update({
        where: { id: conversation.id },
        data: { updated_at: new Date() },
      }),
    ])

    revalidatePath(messagesPath)
    return { success: true as const }
  } catch (error) {
    console.error("Erreur sendDirectMessage:", error)
    return { success: false as const, message: "Impossible d'envoyer le message." }
  }
}

export async function getConversations() {
  const userId = await getAuthenticatedUserId()
  if (!userId) return { success: false as const, message: "Non authentifié.", conversations: [] }

  try {
    const conversations = await prisma.direct_conversations.findMany({
      where: { OR: [{ user1_id: userId }, { user2_id: userId }] },
      include: {
        user1: { select: { id: true, display_name: true } },
        user2: { select: { id: true, display_name: true } },
        messages: {
          orderBy: { created_at: "desc" },
          take: 1,
          select: { message: true, created_at: true },
        },
      },
      orderBy: { updated_at: "desc" },
    })

    return {
      success: true as const,
      message: "Conversations affichées avec succès.",
      conversations,
    }
  } catch (error) {
    console.error("Erreur getConversations:", error)
    return { success: false as const, message: "Impossible d'afficher les conversations.", conversations: [] }
  }
}