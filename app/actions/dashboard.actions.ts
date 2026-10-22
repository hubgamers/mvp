"use server"

import { prisma } from "@/lib/prisma"

export async function getDashboardData(userId: string) {
  try {
    // 1. Profil utilisateur
    const userProfile = await prisma.users.findUnique({
      where: { id: userId },
      select: { display_name: true, email: true },
    })

    // 2. Tournois de l'utilisateur
    const userTournaments = await prisma.tournaments.findMany({
      where: {
        tournaments_members: {
          some: { user_id: userId },
        },
      },
      take: 4,
      orderBy: { start_at: "desc" },
      include: {
        tournament_statuses: true,
        _count: {
          select: {
            tournaments_registrations: true,
            tournaments_matches: true,
          },
        },
      },
    })

    // 3. Lineups / Rosters
    const userRosters = await prisma.rosters.findMany({
      where: {
        deleted: false,
        rosters_members: {
          some: { user_id: userId },
        },
      },
      take: 4,
      include: {
        rosters_members: {
          include: {
            team_roles: true,
            users: { select: { display_name: true } },
          },
        },
        _count: {
          select: {
            tournaments_registrations: true,
          },
        },
      },
    })

    // 4. Clubs / Structures
    const userClubs = await prisma.clubs.findMany({
      where: {
        deleted: false,
        clubs_members: {
          some: { user_id: userId },
        },
      },
      take: 3,
      include: {
        clubs_members: {
          where: { user_id: userId },
          include: { club_roles: true },
        },
        _count: {
          select: { clubs_members: true },
        },
      },
    })

    // 5. Invitations en attente
    const pendingInvitations = await prisma.invitations.findMany({
      where: {
        status: "WAIT",
      },
      take: 5,
      orderBy: { created_at: "desc" },
      include: {
        invitation_target_types: true,
      },
    })

    // 6. Escouades de l'utilisateur
    const userSquads = await prisma.squads.findMany({
      where: {
        squads_members: {
          some: { user_id: userId },
        },
      },
      take: 4,
      include: {
        squad_types: true,
        squads_members: true,
      },
    })

    // 7. Prochains matchs programmés
    const rosterIds = userRosters.map((r) => r.id)
    const upcomingMatches = rosterIds.length > 0
      ? await prisma.tournaments_matches.findMany({
          where: {
            OR: [
              { roster1_id: { in: rosterIds } },
              { roster2_id: { in: rosterIds } },
            ],
            status_code: { in: ["PENDING", "READY", "LIVE"] },
          },
          take: 3,
          orderBy: { scheduled_at: "asc" },
          include: {
            match_statuses: true,
            rosters_tournaments_matches_roster1_idTorosters: true,
            rosters_tournaments_matches_roster2_idTorosters: true,
            tournaments_stages: {
              include: { tournaments: true },
            },
          },
        })
      : []

    return {
      success: true,
      userProfile,
      userTournaments,
      userRosters,
      userClubs,
      userSquads,
      pendingInvitations,
      upcomingMatches,
    }
  } catch (error) {
    console.error("Erreur getDashboardData:", error)
    return {
      success: false,
      userProfile: null,
      userTournaments: [],
      userRosters: [],
      userClubs: [],
      userSquads: [],
      pendingInvitations: [],
      upcomingMatches: [],
    }
  }
}