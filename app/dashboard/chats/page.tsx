import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { prisma } from "@/lib/prisma"
import { MessageSquare, Swords, Shield, Send, Users, Sparkles, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MatchChatClient } from "./match-chat-client"

export const metadata = {
  title: "Match Chats · HubGamers",
  description: "Canal de communication officiel entre capitaines d'équipes et arbitres de tournoi.",
}

export default async function MatchChatsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Récupérer les rosters de l'utilisateur
  const myRosters = await prisma.rosters.findMany({
    where: {
      rosters_members: {
        some: { user_id: user.id },
      },
    },
    select: { id: true },
  })

  const rosterIds = myRosters.map((r) => r.id)

  // Récupérer les matchs récents associés à ces rosters ou pour lesquels l'utilisateur est arbitre
  const matches = await prisma.tournaments_matches.findMany({
    where: {
      OR: [
        { roster1_id: { in: rosterIds } },
        { roster2_id: { in: rosterIds } },
        { match_arbiters: { some: { user_id: user.id } } },
      ],
    },
    include: {
      match_statuses: true,
      tournaments_stages: {
        include: { tournaments: true },
      },
      rosters_tournaments_matches_roster1_idTorosters: true,
      rosters_tournaments_matches_roster2_idTorosters: true,
      match_arbiters: {
        include: {
          users: { select: { display_name: true } },
        },
      },
    },
    orderBy: { updated_at: "desc" },
    take: 10,
  })

  const currentUser = await prisma.users.findUnique({
    where: { id: user.id },
    select: { id: true, display_name: true },
  })

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <MessageSquare className="size-4 text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            SALONS DE DISCUSSION DE COMPÉTITION
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
          Match Chats & Arbitrage
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Échangez avec vos adversaires sur les maps, les identifiants de salon privé et recevez les consignes de l'arbitre.
        </p>
      </div>

      <MatchChatClient
        matches={matches}
        currentUser={currentUser || { id: user.id, display_name: "Joueur" }}
      />
    </div>
  )
}
