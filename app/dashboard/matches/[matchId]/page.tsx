import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getMatchDetailsForUser } from "@/lib/matches"
import MatchDetail, { type MatchDetailData, type MatchDetailTeam } from "@/components/tournament/match/match-detail"

interface PageProps {
  params: Promise<{ matchId: string }>
}

type MatchResult = NonNullable<Awaited<ReturnType<typeof getMatchDetailsForUser>>>
type MatchTeamRecord = NonNullable<
  MatchResult["match"]["match_slots_match_slots_match_idTomatches"][number]["tournament_registrations"]
>["teams"]

function formatTeam(team: MatchTeamRecord | null): MatchDetailTeam | null {
  if (!team) return null

  return {
    id: team.id,
    name: team.name,
    logoUrl: team.logo_url,
    players: team.team_members.map((membership) => ({
      id: membership.user_id,
      name:
        membership.profiles.display_name ||
        membership.profiles.username ||
        "Joueur",
      avatarUrl: membership.profiles.avatar_url,
      role: membership.role,
    })),
  }
}

export default async function MatchDetailPage({ params }: PageProps) {
  const { matchId } = await params
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(matchId)) {
    notFound()
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login?authRequired=1")

  const result = await getMatchDetailsForUser(matchId, user.id)
  if (!result) notFound()

  const { match, canManageMatch, canManageBroadcast, canUseMatchChat } = result
  const slots = match.match_slots_match_slots_match_idTomatches
  const teamAlpha = formatTeam(slots.find((slot) => slot.side === "A")?.tournament_registrations?.teams ?? null)
  const teamBeta = formatTeam(slots.find((slot) => slot.side === "B")?.tournament_registrations?.teams ?? null)

  const matchDetail: MatchDetailData = {
    id: match.id,
    tournamentId: match.tournaments.id,
    tournamentName: match.tournaments.name,
    stageName: match.tournament_stages.name,
    game: match.tournaments.game,
    platform: match.tournaments.platform,
    status: match.status,
    scheduledAt: match.scheduled_at?.toISOString() ?? null,
    bestOf: match.best_of,
    rules: match.tournaments.rules,
    teamAlpha,
    teamBeta,
    games: match.match_games.map((game) => ({
      gameNumber: game.game_number,
      mapName: game.map_name,
      scoreA: game.score_a,
      scoreB: game.score_b,
      winnerSide: game.winner_side,
    })),
    canManageMatch,
    canManageBroadcast,
    canUseMatchChat,
    currentUserId: user.id,
    streamUrl: match.stream_url,
  }

  return <MatchDetail match={matchDetail} />
}
