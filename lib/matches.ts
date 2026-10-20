import { prisma } from "@/lib/prisma"

export async function getMatchDetailsForUser(matchId: string, userId: string) {
  const match = await prisma.matches.findFirst({
    where: {
      id: matchId,
      tournaments: { deleted_at: null },
    },
    include: {
      tournaments: {
        select: {
          id: true,
          name: true,
          game: true,
          platform: true,
          is_public: true,
          created_by: true,
          organizer_structure_id: true,
          rules: true,
        },
      },
      tournament_stages: { select: { name: true } },
      match_slots_match_slots_match_idTomatches: {
        include: {
          tournament_registrations: {
            include: {
              teams: {
                include: {
                  team_members: {
                    include: {
                      profiles: {
                        select: { id: true, username: true, display_name: true, avatar_url: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      match_games: {
        orderBy: { game_number: "asc" },
        select: {
          game_number: true,
          map_name: true,
          score_a: true,
          score_b: true,
          winner_side: true,
        },
      },
    },
  })

  if (!match) return null

  const teams = match.match_slots_match_slots_match_idTomatches
    .map((slot) => slot.tournament_registrations?.teams)
    .filter((team) => team !== undefined)
  const teamIds = teams.map((team) => team.id)
  const teamMemberships = teamIds.length
    ? await prisma.team_members.findMany({
        where: { team_id: { in: teamIds }, user_id: userId },
        select: { role: true },
      })
    : []

  const structureMembership = match.tournaments.organizer_structure_id
    ? await prisma.structure_members.findUnique({
        where: {
          structure_id_user_id: {
            structure_id: match.tournaments.organizer_structure_id,
            user_id: userId,
          },
        },
        select: { role: true },
      })
    : null

  const isOrganizer =
    match.tournaments.created_by === userId ||
    structureMembership?.role === "OWNER" ||
    structureMembership?.role === "ADMIN"
  const isTeamMember = teamMemberships.length > 0
  const canManageMatch =
    isOrganizer ||
    teamMemberships.some((membership) => membership.role === "CAPTAIN" || membership.role === "MANAGER")
  const canUseMatchChat = isOrganizer || isTeamMember

  if (!match.tournaments.is_public && !isOrganizer && !isTeamMember) return null

  return { match, canManageMatch, canUseMatchChat, canManageBroadcast: isOrganizer }
}
