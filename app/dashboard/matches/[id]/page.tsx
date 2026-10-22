import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { prisma } from "@/lib/prisma"
import {
  Swords,
  Shield,
  Clock,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Trophy,
  Users,
  Gamepad2,
  MessageSquare,
  Camera,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MatchDetailClient } from "./match-detail-client"

interface MatchPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function MatchDetailPage({ params }: MatchPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const match = await prisma.tournaments_matches.findUnique({
    where: { id },
    include: {
      match_statuses: true,
      tournaments_stages: {
        include: {
          tournaments: true,
          bo_options: true,
        },
      },
      rosters_tournaments_matches_roster1_idTorosters: {
        include: {
          rosters_members: {
            include: {
              team_roles: true,
              users: { select: { id: true, display_name: true } },
            },
          },
        },
      },
      rosters_tournaments_matches_roster2_idTorosters: {
        include: {
          rosters_members: {
            include: {
              team_roles: true,
              users: { select: { id: true, display_name: true } },
            },
          },
        },
      },
      rosters_tournaments_matches_winner_roster_idTorosters: true,
      tournaments_match_games: {
        orderBy: { game_number: "asc" },
      },
      match_arbiters: {
        include: {
          users: { select: { id: true, display_name: true, email: true } },
        },
      },
      match_disputes: {
        include: {
          dispute_statuses: true,
          users_match_disputes_opened_by_user_idTousers: { select: { display_name: true } },
        },
        orderBy: { created_at: "desc" },
      },
      match_media: {
        include: {
          match_media_types: true,
        },
      },
    },
  })

  if (!match) {
    notFound()
  }

  const roster1 = match.rosters_tournaments_matches_roster1_idTorosters
  const roster2 = match.rosters_tournaments_matches_roster2_idTorosters

  const isRoster1Member = roster1?.rosters_members.some((m) => m.user_id === user.id)
  const isRoster2Member = roster2?.rosters_members.some((m) => m.user_id === user.id)
  const isArbiter = match.match_arbiters.some((a) => a.user_id === user.id)

  const isRoster1Captain = roster1?.rosters_members.some(
    (m) => m.user_id === user.id && m.role_code === "CAPTAIN"
  )
  const isRoster2Captain = roster2?.rosters_members.some(
    (m) => m.user_id === user.id && m.role_code === "CAPTAIN"
  )

  const canManageScore = isArbiter || isRoster1Captain || isRoster2Captain

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8 max-w-6xl mx-auto w-full">
      {/* Barre de retour et statut */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm" className="h-9 w-9 p-0 rounded-full border-white/10">
            <Link href={`/dashboard/tournaments/${match.tournaments_stages.tournament_id}`}>
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-[10px] uppercase font-mono">
                {match.match_statuses.label}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {match.tournaments_stages.tournaments.name} · {match.tournaments_stages.name || "Arbre"}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              Feuille de Match · Round {match.round_number || 1} ({match.tournaments_stages.bo_options.label})
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="outline" className="border-white/10 text-xs">
            <Link href="/dashboard/chats">
              <MessageSquare className="size-3.5 mr-1.5 text-cyan-400" />
              Chat du match
            </Link>
          </Button>
        </div>
      </div>

      {/* Duel : Roster 1 vs Roster 2 */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
        {/* Roster 1 */}
        <Card className="md:col-span-3 border-white/10 bg-gradient-to-r from-cyan-950/30 to-black/50 p-6 text-center space-y-3">
          <div className="size-16 mx-auto rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-black text-2xl shadow-lg">
            {roster1?.name?.slice(0, 2).toUpperCase() || "TBD"}
          </div>
          <div>
            <h2 className="text-xl font-black text-white">{roster1?.name || "À déterminer"}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {roster1?.rosters_members.length || 0} joueurs dans la lineup
            </p>
          </div>
          <div>
            {match.roster1_checked_in ? (
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                <CheckCircle2 className="size-3 mr-1" />
                Check-in effectué
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-500/30">
                Check-in en attente
              </Badge>
            )}
          </div>
        </Card>

        {/* Versus & Scores */}
        <div className="md:col-span-1 text-center py-2 space-y-2">
          <div className="text-xs font-black uppercase tracking-widest text-muted-foreground">VS</div>
          {match.winner_roster_id && (
            <Badge className="bg-amber-400 text-slate-950 font-black text-[10px]">
              Vainqueur validé
            </Badge>
          )}
        </div>

        {/* Roster 2 */}
        <Card className="md:col-span-3 border-white/10 bg-gradient-to-l from-purple-950/30 to-black/50 p-6 text-center space-y-3">
          <div className="size-16 mx-auto rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-black text-2xl shadow-lg">
            {roster2?.name?.slice(0, 2).toUpperCase() || "TBD"}
          </div>
          <div>
            <h2 className="text-xl font-black text-white">{roster2?.name || "À déterminer"}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {roster2?.rosters_members.length || 0} joueurs dans la lineup
            </p>
          </div>
          <div>
            {match.roster2_checked_in ? (
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                <CheckCircle2 className="size-3 mr-1" />
                Check-in effectué
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-500/30">
                Check-in en attente
              </Badge>
            )}
          </div>
        </Card>
      </div>

      {/* Gestion interactive des scores et check-in */}
      <MatchDetailClient
        match={match}
        canManageScore={canManageScore}
        isRoster1Captain={!!isRoster1Captain}
        isRoster2Captain={!!isRoster2Captain}
        isArbiter={isArbiter}
      />
    </div>
  )
}
