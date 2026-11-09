import { redirect } from "next/navigation"
import { MessageSquare } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { DirectMessagesClient } from "./direct-messages-client"
import { getConversations } from "@/app/actions/message.actions"

export const metadata = {
  title: "Messagerie · HubGamers",
  description: "Échangez en privé avec les joueurs HubGamers.",
}

export default async function DirectMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ conversation?: string }>
}) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  if (!user) redirect("/login")

  const conversationsResult = await getConversations()
  const conversations = conversationsResult.success && conversationsResult.conversations 
    ? conversationsResult.conversations 
    : []

  const { conversation: requestedConversationId } = await searchParams
  const selectedConversation = conversations.find(
    (conversation) => conversation.id === requestedConversationId
  ) ?? conversations[0]

  const messages = selectedConversation
    ? await prisma.direct_messages.findMany({
        where: { conversation_id: selectedConversation.id },
        include: { sender: { select: { id: true, display_name: true } } },
        orderBy: { created_at: "desc" },
        take: 100,
      })
    : []

  const peer = selectedConversation
    ? selectedConversation.user1_id === user.id
      ? selectedConversation.user2
      : selectedConversation.user1
    : null

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-6 lg:p-8">
      <header>
        <div className="mb-1 flex items-center gap-2">
          <MessageSquare className="size-4 text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Espace Général</span>
        </div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">Messagerie</h1>
        <p className="mt-1 text-sm text-muted-foreground">Discutez en privé avec les joueurs de la communauté.</p>
      </header>

      <DirectMessagesClient
        currentUserId={user.id}
        conversations={conversations.map((conversation) => {
          const otherUser = conversation.user1_id === user.id ? conversation.user2 : conversation.user1
          const latestMessage = conversation.messages[0]
          return {
            id: conversation.id,
            peer: otherUser,
            latestMessage: latestMessage?.message ?? "",
            updatedAt: (latestMessage?.created_at ?? conversation.updated_at).toISOString(),
          }
        })}
        selectedConversationId={selectedConversation?.id ?? null}
        selectedPeer={peer}
        messages={messages.reverse().map((message) => ({
          id: message.id,
          senderId: message.sender.id,
          senderName: message.sender.display_name,
          text: message.message,
          createdAt: message.created_at.toISOString(),
        }))}
      />
    </div>
  )
}