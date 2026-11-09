import { prisma } from "@/lib/prisma";

export type PlanCategory = "player" | "organizer" | "club" | "studio";
export type PlanTier = "starter" | "plus" | "pro";

export interface PlanEntitlements {
  tier: PlanTier;
  squadsCreated: number;
  squadsJoined: number;
  activeTournaments: number;
  teamsPerTournament: number;
  tournamentStages: number;
  tournamentOverlays: number;
  referees: number;
  clubs: number;
  lineups: number;
  clubMembers: number;
  studioOverlays: number;
  recruitment: boolean;
  customization: boolean;
  sponsorsAndCasters: boolean;
}

const planLimits: Record<PlanCategory, Record<PlanTier, PlanEntitlements>> = {
  player: {
    starter: {
      tier: "starter", squadsCreated: 5, squadsJoined: 5, activeTournaments: 0, teamsPerTournament: 0,
      tournamentStages: 0, tournamentOverlays: 0, referees: 0, clubs: 0, lineups: 0, clubMembers: 0,
      studioOverlays: 0, recruitment: false, customization: false,
      sponsorsAndCasters: false,
    },
    plus: {
      tier: "plus", squadsCreated: 15, squadsJoined: 15, activeTournaments: 0, teamsPerTournament: 0,
      tournamentStages: 0, tournamentOverlays: 0, referees: 0, clubs: 0, lineups: 0, clubMembers: 0,
      studioOverlays: 0, recruitment: false, customization: true,
      sponsorsAndCasters: false,
    },
    pro: {
      tier: "pro", squadsCreated: 25, squadsJoined: 25, activeTournaments: 0, teamsPerTournament: 0,
      tournamentStages: 0, tournamentOverlays: 0, referees: 0, clubs: 0, lineups: 0, clubMembers: 0,
      studioOverlays: 0, recruitment: false, customization: true,
      sponsorsAndCasters: false,
    },
  },
  organizer: {
    starter: {
      tier: "starter", squadsCreated: 0, squadsJoined: 0, activeTournaments: 1, teamsPerTournament: 16,
      tournamentStages: 2, tournamentOverlays: 1, referees: 1, clubs: 0, lineups: 0, clubMembers: 0,
      studioOverlays: 0, recruitment: false, customization: false,
      sponsorsAndCasters: false,
    },
    plus: {
      tier: "plus", squadsCreated: 0, squadsJoined: 0, activeTournaments: 3, teamsPerTournament: 32,
      tournamentStages: 5, tournamentOverlays: 5, referees: 5, clubs: 0, lineups: 0, clubMembers: 0,
      studioOverlays: 0, recruitment: false, customization: true,
      sponsorsAndCasters: true,
    },
    pro: {
      tier: "pro", squadsCreated: 0, squadsJoined: 0, activeTournaments: 10, teamsPerTournament: 64,
      tournamentStages: 5, tournamentOverlays: 10, referees: 15, clubs: 0, lineups: 0, clubMembers: 0,
      studioOverlays: 0, recruitment: false, customization: true,
      sponsorsAndCasters: true,
    },
  },
  club: {
    starter: {
      tier: "starter", squadsCreated: 0, squadsJoined: 0, activeTournaments: 0, teamsPerTournament: 0,
      tournamentStages: 0, tournamentOverlays: 0, referees: 0, clubs: 1, lineups: 1, clubMembers: 10,
      studioOverlays: 0, recruitment: false, customization: false,
      sponsorsAndCasters: false,
    },
    plus: {
      tier: "plus", squadsCreated: 0, squadsJoined: 0, activeTournaments: 0, teamsPerTournament: 0,
      tournamentStages: 0, tournamentOverlays: 0, referees: 0, clubs: 1, lineups: 5, clubMembers: 50,
      studioOverlays: 0, recruitment: true, customization: true,
      sponsorsAndCasters: false,
    },
    pro: {
      tier: "pro", squadsCreated: 0, squadsJoined: 0, activeTournaments: 0, teamsPerTournament: 0,
      tournamentStages: 0, tournamentOverlays: 0, referees: 0, clubs: 1, lineups: 15, clubMembers: 150,
      studioOverlays: 0, recruitment: true, customization: true,
      sponsorsAndCasters: false,
    },
  },
  studio: {
    starter: {
      tier: "starter", squadsCreated: 0, squadsJoined: 0, activeTournaments: 0, teamsPerTournament: 0,
      tournamentStages: 0, tournamentOverlays: 0, referees: 0, clubs: 0, lineups: 0, clubMembers: 0,
      studioOverlays: 2, recruitment: false, customization: false,
      sponsorsAndCasters: false,
    },
    plus: {
      tier: "plus", squadsCreated: 0, squadsJoined: 0, activeTournaments: 0, teamsPerTournament: 0,
      tournamentStages: 0, tournamentOverlays: 0, referees: 0, clubs: 0, lineups: 0, clubMembers: 0,
      studioOverlays: 5, recruitment: false, customization: true,
      sponsorsAndCasters: true,
    },
    pro: {
      tier: "pro", squadsCreated: 0, squadsJoined: 0, activeTournaments: 0, teamsPerTournament: 0,
      tournamentStages: 0, tournamentOverlays: 0, referees: 0, clubs: 0, lineups: 0, clubMembers: 0,
      studioOverlays: 15, recruitment: false, customization: true,
      sponsorsAndCasters: true,
    },
  },
};

export async function getPlanEntitlements(
  userId: string,
  category: PlanCategory
): Promise<PlanEntitlements> {
  return getEntitlementsForUsers([userId], category);
}

async function getEntitlementsForUsers(
  userIds: string[],
  category: PlanCategory
): Promise<PlanEntitlements> {
  const subscriptions = userIds.length
    ? await prisma.stripe_subscriptions.findMany({
    where: {
      user_id: { in: userIds },
      is_current: true,
      status: { in: ["active", "trialing", "past_due"] },
      plan_id: { startsWith: `${category}-` },
    },
    select: { plan_id: true },
    })
    : [];

  const hasPro = subscriptions.some(({ plan_id }) => plan_id.endsWith("-pro"));
  const hasPlus = subscriptions.some(({ plan_id }) => plan_id.endsWith("-plus"));
  const tier: PlanTier = hasPro
    ? "pro"
    : hasPlus
      ? "plus"
      : "starter";

  return planLimits[category][tier];
}

export async function getTournamentEntitlements(
  userId: string,
  tournamentId: string
) {
  const owners = await prisma.tournaments_members.findMany({
    where: { tournament_id: tournamentId, role_code: "ADMIN" },
    select: { user_id: true },
  });
  return getEntitlementsForUsers(
    owners.length ? owners.map((owner) => owner.user_id) : [userId],
    "organizer"
  );
}

export async function getClubEntitlements(userId: string, clubId: string) {
  const owners = await prisma.clubs_members.findMany({
    where: { club_id: clubId, role_code: { in: ["ADMIN", "OWNER"] } },
    select: { user_id: true },
  });
  return getEntitlementsForUsers(
    owners.length ? owners.map((owner) => owner.user_id) : [userId],
    "club"
  );
}

export function planLimitMessage(
  label: string,
  limit: number,
  category: PlanCategory
) {
  return `${label} maximum atteint (${limit}). Passez à une offre supérieure pour augmenter cette limite : /dashboard/billing?category=${category}`;
}

export async function checkSquadCreationCapacity(userId: string, squadId: string) {
  const [entitlements, existingMembership, createdCount] = await Promise.all([
    getPlanEntitlements(userId, "player"),
    prisma.squads_members.findUnique({
      where: { user_id_squad_id: { user_id: userId, squad_id: squadId } },
      select: { role_code: true },
    }),
    prisma.squads_members.count({
      where: { user_id: userId, role_code: "OWNER" },
    }),
  ]);
  if (existingMembership?.role_code === "OWNER" || createdCount < entitlements.squadsCreated) {
    return { allowed: true, message: "" };
  }
  return {
    allowed: false,
    message: planLimitMessage("Squads créées", entitlements.squadsCreated, "player"),
  };
}

export async function checkSquadJoinCapacity(userId: string, squadId: string) {
  const [entitlements, existingMembership, joinedCount] = await Promise.all([
    getPlanEntitlements(userId, "player"),
    prisma.squads_members.findUnique({
      where: { user_id_squad_id: { user_id: userId, squad_id: squadId } },
      select: { squad_id: true },
    }),
    prisma.squads_members.count({
      where: { user_id: userId, role_code: { not: "OWNER" } },
    }),
  ]);
  if (existingMembership || joinedCount < entitlements.squadsJoined) {
    return { allowed: true, message: "" };
  }
  return {
    allowed: false,
    message: planLimitMessage("Squads rejointes", entitlements.squadsJoined, "player"),
  };
}

export async function checkTournamentRosterCapacity(
  userId: string,
  tournamentId: string,
  rosterId?: string
) {
  const tournament = await prisma.tournaments.findUnique({
    where: { id: tournamentId },
    select: { nb_rosters: true },
  });
  if (!tournament) {
    return { allowed: false, message: "Tournoi introuvable." };
  }
  const entitlements = await getTournamentEntitlements(userId, tournamentId);

  const limit = Math.min(
    entitlements.teamsPerTournament,
    tournament.nb_rosters && tournament.nb_rosters > 0
      ? tournament.nb_rosters
      : entitlements.teamsPerTournament
  );
  const registeredCount = await prisma.tournaments_registrations.count({
    where: {
      tournament_id: tournamentId,
      ...(rosterId ? { roster_id: { not: rosterId } } : {}),
    },
  });

  return registeredCount >= limit
    ? {
        allowed: false,
        message: planLimitMessage("Équipes inscrites", limit, "organizer"),
      }
    : { allowed: true, message: "" };
}
