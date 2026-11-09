"use client"

import { useState } from "react"
import Link from "next/link"
import { MessageSquare, Send, Swords, Shield, ExternalLink, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface MatchChatClientProps {
  matches: any[]
  currentUser: { id: string; display_name: string }
}

interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  role: "player" | "arbiter" | "system"
  text: string
  timestamp: string
}

export function MatchChatClient({ matches, currentUser }: MatchChatClientProps) {
  const [selectedMatchId, setSelectedMatchId] = useState(
    matches.length > 0 ? matches[0].id : null
  )

  const selectedMatch = matches.find((m) => m.id === selectedMatchId)

  // Simulation de messages initiaux pour ce match
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({
    default: [
      {
        id: "1",
        senderId: "system",
        senderName: "Système HubGamers",
        role: "system",
        text: "Le salon de match officiel est ouvert. Veuillez confirmer vos présences.",
        timestamp: "18:00",
      },
      {
        id: "2",
        senderId: "arbiter",
        senderName: "Arbitre Officiel",
        role: "arbiter",
        text: "Bonjour aux deux capitaines. Serveur EU Central. Merci de vérifier vos comptes de jeu.",
        timestamp: "18:02",
      },
    ],
  })

  const [inputMessage, setInputMessage] = useState("")

  const activeMessages = (selectedMatchId && messages[selectedMatchId]) || messages["default"]

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || !selectedMatchId) return

    const newMsg: ChatMessage = {
      id: Math.random().toString(),
      senderId: currentUser.id,
      senderName: currentUser.display_name,
      role: "player",
      text: inputMessage.trim(),
      timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages((prev) => ({
      ...prev,
      [selectedMatchId]: [...(prev[selectedMatchId] || messages["default"]), newMsg],
    }))

    setInputMessage("")
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-16 rounded-2xl border border-dashed border-white/10 bg-black/20">
        <MessageSquare className="size-12 mx-auto text-muted-foreground mb-3 opacity-40" />
        <h3 className="text-base font-bold text-white">Aucun match actif avec salon de chat</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          Les salons de discussion s'ouvrent automatiquement dès que votre équipe est programmée dans un arbre de tournoi.
        </p>
        <Button asChild size="sm" variant="outline" className="mt-4 text-xs">
          <Link href="/dashboard/tournaments/explore">Explorer les tournois</Link>
        </Button>
      </div>
    )
  }

  const r1 = selectedMatch?.rosters_tournaments_matches_roster1_idTorosters
  const r2 = selectedMatch?.rosters_tournaments_matches_roster2_idTorosters

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[650px]">
      {/* Colonne gauche (1/3) : Liste des salons */}
      <Card className="border-white/10 bg-card/60 backdrop-blur-sm flex flex-col h-full overflow-hidden">
        <CardHeader className="p-4 pb-2 border-b border-white/5">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Mes Salons Actifs ({matches.length})
          </CardTitle>
        </CardHeader>
        <div className="flex-1 overflow-y-auto divide-y divide-white/5">
          {matches.map((m) => {
            const isSelected = m.id === selectedMatchId
            return (
              <button
                key={m.id}
                onClick={() => setSelectedMatchId(m.id)}
                className={`w-full p-4 text-left transition-colors flex flex-col gap-1.5 ${
                  isSelected ? "bg-white/10 border-l-2 border-cyan-400" : "hover:bg-white/[0.03]"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span className="truncate">{m.tournaments_stages.tournaments.name}</span>
                  <Badge variant="outline" className="text-[9px] uppercase">
                    {m.match_statuses.label}
                  </Badge>
                </div>

                <div className="text-xs font-bold text-white truncate">
                  <span className="text-cyan-400">{m.rosters_tournaments_matches_roster1_idTorosters?.name || "TBD"}</span>
                  <span className="text-muted-foreground mx-1.5">vs</span>
                  <span className="text-purple-400">{m.rosters_tournaments_matches_roster2_idTorosters?.name || "TBD"}</span>
                </div>
              </button>
            )
          })}
        </div>
      </Card>

      {/* Colonne droite (2/3) : Zone de Chat */}
      <Card className="md:col-span-2 border-white/10 bg-card/60 backdrop-blur-sm flex flex-col h-full overflow-hidden">
        {selectedMatch && (
          <CardHeader className="p-4 pb-3 border-b border-white/5 flex flex-row items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  {r1?.name || "Roster 1"} vs {r2?.name || "Roster 2"}
                </span>
                <Badge variant="outline" className="text-[10px] text-cyan-400 border-cyan-500/20">
                  Salon Officiel
                </Badge>
              </div>
              <span className="text-[11px] text-muted-foreground">
                Tournoi : {selectedMatch.tournaments_stages.tournaments.name}
              </span>
            </div>

            <Button asChild size="sm" variant="ghost" className="h-8 text-xs text-muted-foreground hover:text-white">
              <Link href={`/dashboard/matches/${selectedMatch.id}`}>
                Feuille de match
                <ExternalLink className="size-3 ml-1" />
              </Link>
            </Button>
          </CardHeader>
        )}

        {/* Message feed */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {activeMessages.map((msg: {
            id: string
            senderId: string
            role: string
            text: string
            senderName: string
            timestamp: string
          }) => {
            const isMe = msg.senderId === currentUser.id
            const isSystem = msg.role === "system"
            const isArbiter = msg.role === "arbiter"

            if (isSystem) {
              return (
                <div key={msg.id} className="text-center py-1">
                  <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[11px] text-slate-400">
                    ⚙️ {msg.text}
                  </span>
                </div>
              )
            }

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div className="flex items-center gap-1.5 mb-1 text-[11px] text-muted-foreground">
                  <span className="font-semibold text-white">{msg.senderName}</span>
                  {isArbiter && (
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[9px] py-0 px-1">
                      Arbitre
                    </Badge>
                  )}
                  <span>· {msg.timestamp}</span>
                </div>
                <div
                  className={`p-3 rounded-2xl text-xs max-w-md ${
                    isMe
                      ? "bg-cyan-500 text-slate-950 font-medium rounded-tr-none"
                      : isArbiter
                      ? "bg-amber-500/10 border border-amber-500/30 text-slate-200 rounded-tl-none"
                      : "bg-black/50 border border-white/10 text-slate-200 rounded-tl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            )
          })}
        </div>

        {/* Input box */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-white/5 flex gap-2">
          <Input
            placeholder="Écrivez un message aux capitaines et arbitres..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="bg-black/40 border-white/10 text-xs h-10 focus-visible:ring-cyan-400"
          />
          <Button type="submit" className="h-10 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs">
            <Send className="size-4" />
          </Button>
        </form>
      </Card>
    </div>
  )
}
