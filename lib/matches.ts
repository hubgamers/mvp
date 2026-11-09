import { prisma } from "@/lib/prisma"

export async function getMatchDetailsForUser(matchId: string, userId: string) {
  const match = await prisma.tournaments_matches.findUnique({
    where: { id: matchId },
    include: {
      tournaments_stages: {
        include: {
          tournaments: {
            select: {
              id: true,
              name: true,
              game_id: true,
              platform: true,
              tournaments_members: {
                where: { user_id: userId },
                select: { role_code: true },
              },
            },
          },
        },
      },
      rosters_tournaments_matches_roster1_idTorosters: {
        include: {
          rosters_members: {
            where: { user_id: userId },
            select: { role_code: true },
          },
        },
      },
      rosters_tournaments_matches_roster2_idTorosters: {
        include: {
          rosters_members: {
            where: { user_id: userId },
            select: { role_code: true },
          },
        },
      },
      match_arbiters: {
        where: { user_id: userId },
        select: { user_id: true },
      },
      tournaments_match_games: {
        orderBy: { game_number: "asc" },
      },
    },
  })

  if (!match) return null

  const tournament = match.tournaments_stages.tournaments
  const tournamentMembership = tournament.tournaments_members[0]
  const rosterMemberships = [
    ...(match.rosters_tournaments_matches_roster1_idTorosters?.rosters_members ?? []),
    ...(match.rosters_tournaments_matches_roster2_idTorosters?.rosters_members ?? []),
  ]
  const isTournamentAdmin = tournamentMembership?.role_code === "ADMIN"
  const isTournamentReferee =
    tournamentMembership?.role_code === "ARBITER" || match.match_arbiters.length > 0
  const isTournamentOrganizer = isTournamentAdmin || isTournamentReferee
  const isTeamMember = rosterMemberships.length > 0

  if (!isTournamentOrganizer && !isTeamMember) return null

  const canManageMatch =
    isTournamentOrganizer ||
    rosterMemberships.some(({ role_code }) => role_code === "CAPTAIN" || role_code === "MANAGER")

  return {
    match,
    canManageMatch,
    canUseMatchChat: true,
    canManageBroadcast: isTournamentAdmin,
  }
}
