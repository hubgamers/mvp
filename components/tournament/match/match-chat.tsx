"use client"

import { useEffect, useRef, useState, useTransition, type FormEvent } from "react"
import { Lock, MessageSquare, Send } from "lucide-react"
import { toast } from "sonner"
import { getMatchChatMessages, sendMatchChatMessage } from "@/app/actions/match.actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export interface MatchChatMessage {
  id: string
  senderId: string
  senderName: string
  avatarUrl: string | null
  content: string
  createdAt: string
}

export function MatchChat({
  matchId,
  currentUserId,
  canUseChat,
}: {
  matchId: string
  currentUserId: string
  canUseChat: boolean
}) {
  const [messages, setMessages] = useState<MatchChatMessage[]>([])
  const [content, setContent] = useState("")
  const [isPending, startTransition] = useTransition()
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!canUseChat) return

    let disposed = false
    let timer: ReturnType<typeof setTimeout> | undefined
    let hasReportedError = false

    async function refreshMessages() {
      try {
        const result = await getMatchChatMessages(matchId)
        if (!result.success) {
          if (!hasReportedError && !disposed) toast.error(result.message)
          hasReportedError = true
          return
        }
        if (disposed) return
        setMessages(result.messages)
        timer = setTimeout(refreshMessages, 5000)
      } catch {
        if (!hasReportedError && !disposed) {
          toast.error("Impossible de synchroniser le chat du match.")
        }
        hasReportedError = true
      }
    }

    void refreshMessages()
    return () => {
      disposed = true
      if (timer) clearTimeout(timer)
    }
  }, [canUseChat, matchId])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const message = content.trim()
    if (!message) return

    startTransition(async () => {
      try {
        const result = await sendMatchChatMessage(matchId, message)
        if (!result.success) {
          toast.error(result.message)
          return
        }
        setMessages((current) => [...current.filter((item) => item.id !== result.chatMessage.id), result.chatMessage].slice(-50))
        setContent("")
      } catch {
        toast.error("Impossible d’envoyer le message.")
      }
    })
  }

  return (
    <Card className="flex h-130 flex-col">
      <CardHeader className="border-b bg-muted/30">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="h-4 w-4 text-primary" />
          Chat du match
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Discussion réservée aux joueurs inscrits et à l’organisation.
        </p>
      </CardHeader>
      <CardContent
        aria-live="polite"
        className="flex-1 space-y-3 overflow-y-auto bg-muted/10 p-4"
      >
        {!canUseChat ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
            <Lock className="h-5 w-5" />
            Le chat est réservé aux participants de ce match.
          </div>
        ) : messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Aucun message pour le moment.</p>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.senderId === currentUserId
            return (
              <div key={message.id} className={`flex gap-2 ${isCurrentUser ? "flex-row-reverse" : ""}`}>
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={message.avatarUrl ?? undefined} alt="" />
                  <AvatarFallback>{message.senderName.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className={`max-w-[80%] space-y-1 ${isCurrentUser ? "text-right" : ""}`}>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{message.senderName}</span>
                    <time dateTime={message.createdAt}>
                      {new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(
                        new Date(message.createdAt),
                      )}
                    </time>
                  </div>
                  <p
                    className={`whitespace-pre-wrap wrap-break-word rounded-xl border px-3 py-2 text-left text-sm ${
                      isCurrentUser ? "border-primary bg-primary text-primary-foreground" : "bg-card"
                    }`}
                  >
                    {message.content}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={endRef} />
      </CardContent>
      {canUseChat && (
        <form onSubmit={submitMessage} className="flex gap-2 border-t p-3">
          <Input
            aria-label="Votre message"
            value={content}
            onChange={(event) => setContent(event.target.value.slice(0, 1000))}
            maxLength={1000}
            placeholder="Écrire un message…"
            disabled={isPending}
          />
          <Button type="submit" size="icon" aria-label="Envoyer le message" disabled={isPending || !content.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      )}
    </Card>
  )
}
