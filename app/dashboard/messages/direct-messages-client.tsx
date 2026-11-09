"use client"

import { useEffect, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MessageSquare, Search, Send, UserRound } from "lucide-react"
import { searchDirectMessageUsers, sendDirectMessage, startDirectConversation } from "@/app/actions/message.actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

type UserSummary = { id: string; display_name: string }

interface DirectMessagesClientProps {
  currentUserId: string
  conversations: {
    id: string
    peer: UserSummary
    latestMessage: string
    updatedAt: string
  }[]
  selectedConversationId: string | null
  selectedPeer: UserSummary | null
  messages: {
    id: string
    senderId: string
    senderName: string
    text: string
    createdAt: string
  }[]
}

function formatMessageDate(value: string) {
  return new Date(value).toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "UTC",
  })
}

export function DirectMessagesClient({
  currentUserId,
  conversations,
  selectedConversationId,
  selectedPeer,
  messages,
}: DirectMessagesClientProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<UserSummary[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState("")
  const [message, setMessage] = useState("")
  const [actionError, setActionError] = useState("")
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const normalizedQuery = query.trim()
    if (normalizedQuery.length < 2) return

    let active = true
    const timeout = setTimeout(async () => {
      setIsSearching(true)
      try {
        const result = await searchDirectMessageUsers(normalizedQuery)
        if (!active) return
        setResults(result.success ? result.users : [])
        setSearchError(result.success ? "" : result.message)
      } catch (error) {
        console.error("Erreur de recherche de joueurs:", error)
        if (active) setSearchError("La recherche a échoué. Réessayez.")
      } finally {
        if (active) setIsSearching(false)
      }
    }, 250)

    return () => {
      active = false
      clearTimeout(timeout)
    }
  }, [query])

  useEffect(() => {
    if (!selectedConversationId) return

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh()
    }, 10000)

    return () => clearInterval(interval)
  }, [router, selectedConversationId])

  function handleStartConversation(userId: string) {
    setActionError("")
    startTransition(async () => {
      try {
        const result = await startDirectConversation(userId)
        if (!result.success) {
          setActionError(result.message)
          return
        }
        setQuery("")
        router.push(`/dashboard/messages?conversation=${result.conversationId}`)
      } catch (error) {
        console.error("Erreur de démarrage de conversation:", error)
        setActionError("Impossible de démarrer la conversation. Réessayez.")
      }
    })
  }

  function handleSendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedConversationId || !message.trim()) return

    setActionError("")
    startTransition(async () => {
      try {
        const result = await sendDirectMessage(selectedConversationId, message)
        if (!result.success) {
          setActionError(result.message)
          return
        }
        setMessage("")
        router.refresh()
      } catch (error) {
        console.error("Erreur d'envoi de message:", error)
        setActionError("Impossible d'envoyer le message. Réessayez.")
      }
    })
  }

  return (
    <div className="grid min-h-[620px] gap-5 md:grid-cols-[320px_1fr]">
      <Card className="flex flex-col overflow-hidden border-white/10 bg-card/60">
        <CardHeader className="border-b border-white/5 p-4 pb-3">
          <CardTitle className="text-sm font-bold text-white">Conversations</CardTitle>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setResults([])
                setSearchError("")
                setIsSearching(false)
              }}
              placeholder="Rechercher un joueur..."
              aria-label="Rechercher un joueur"
              className="pl-9"
            />
          </div>
          {query.trim().length >= 2 && (
            <div className="mt-2 space-y-1" aria-live="polite">
              {searchError && <p className="px-2 text-xs text-red-400">{searchError}</p>}
              {isSearching && <p className="px-2 text-xs text-muted-foreground">Recherche...</p>}
              {!isSearching && !searchError && results.length === 0 && (
                <p className="px-2 text-xs text-muted-foreground">Aucun joueur trouvé.</p>
              )}
              {results.map((result) => (
                <button
                  key={result.id}
                  type="button"
                  onClick={() => handleStartConversation(result.id)}
                  disabled={isPending}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-white hover:bg-white/10 disabled:opacity-50"
                >
                  <UserRound className="size-4 text-cyan-400" />
                  <span className="truncate">{result.display_name}</span>
                  <span className="ml-auto text-xs text-cyan-400">Écrire</span>
                </button>
              ))}
            </div>
          )}
        </CardHeader>

        <div className="flex-1 divide-y divide-white/5 overflow-y-auto">
          {conversations.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">Aucune conversation pour le moment.</p>
          ) : conversations.map((conversation) => (
            <Link
              key={conversation.id}
              href={`/dashboard/messages?conversation=${conversation.id}`}
              className={`block p-4 transition-colors hover:bg-white/[0.04] ${
                selectedConversationId === conversation.id ? "border-l-2 border-cyan-400 bg-white/[0.06]" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-semibold text-white">{conversation.peer.display_name}</span>
                {conversation.latestMessage && (
                  <span className="shrink-0 text-[10px] text-muted-foreground">{formatMessageDate(conversation.updatedAt)}</span>
                )}
              </div>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {conversation.latestMessage || "Démarrer la conversation"}
              </p>
            </Link>
          ))}
        </div>
      </Card>

      <Card className="flex min-h-[620px] flex-col overflow-hidden border-white/10 bg-card/60">
        {selectedConversationId && selectedPeer ? (
          <>
            <CardHeader className="flex flex-row items-center gap-3 border-b border-white/5 p-4">
              <div className="flex size-10 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400">
                <UserRound className="size-5" />
              </div>
              <div className="min-w-0">
                <CardTitle className="truncate text-sm text-white">{selectedPeer.display_name}</CardTitle>
                <Badge variant="outline" className="mt-1 border-cyan-500/20 text-[10px] text-cyan-400">Message privé</Badge>
              </div>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col p-0">
              <div className="flex-1 space-y-4 overflow-y-auto p-4">
                {messages.length === 0 ? (
                  <div className="flex h-full min-h-40 flex-col items-center justify-center text-center">
                    <MessageSquare className="mb-3 size-8 text-cyan-400/50" />
                    <p className="text-sm font-medium text-white">Votre conversation commence ici</p>
                    <p className="mt-1 text-xs text-muted-foreground">Envoyez un premier message à {selectedPeer.display_name}.</p>
                  </div>
                ) : messages.map((item) => {
                  const isMine = item.senderId === currentUserId
                  return (
                    <div key={item.id} className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
                      <div className="mb-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                        {!isMine && <span className="font-semibold text-white">{item.senderName}</span>}
                        <time dateTime={item.createdAt}>{formatMessageDate(item.createdAt)}</time>
                      </div>
                      <p className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm ${
                        isMine
                          ? "rounded-tr-sm bg-cyan-500 text-slate-950"
                          : "rounded-tl-sm border border-white/10 bg-black/40 text-slate-200"
                      }`}>
                        {item.text}
                      </p>
                    </div>
                  )
                })}
              </div>

              {actionError && <p role="alert" className="px-4 pb-2 text-xs text-red-400">{actionError}</p>}
              <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-white/5 p-3">
                <Input
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Écrivez votre message..."
                  aria-label="Votre message"
                  maxLength={2000}
                  disabled={isPending}
                  className="h-10"
                />
                <Button type="submit" disabled={isPending || !message.trim()} aria-label="Envoyer le message" className="h-10 px-4">
                  <Send className="size-4" />
                </Button>
              </form>
            </CardContent>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <MessageSquare className="mb-4 size-12 text-cyan-400/40" />
            <h2 className="text-base font-bold text-white">Votre messagerie</h2>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Recherchez un joueur pour démarrer une conversation ou sélectionnez un échange existant.
            </p>
            {actionError && <p role="alert" className="mt-4 text-xs text-red-400">{actionError}</p>}
          </div>
        )}
      </Card>
    </div>
  )
}
