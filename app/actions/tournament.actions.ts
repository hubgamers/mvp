// app/actions/tournament.actions.ts
'use server'

import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { ensurePublicProfile } from "@/lib/profiles"

export interface TournamentDetail {
  id: string
  name: string
  slug: string
  description?: string | null
  rules?: string | null
  game: string
  platform: "PC" | "PLAYSTATION" | "XBOX" | "SWITCH" | "MOBILE" | "CROSS_PLATFORM" | "OTHER"
  status: "DRAFT" | "REGISTRATION_OPEN" | "REGISTRATION_CLOSED" | "CHECK_IN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "ARCHIVED"
  starts_at?: Date | null
  ends_at?: Date | null
  timezone?: string
  created_at: Date
  is_public: boolean
  is_free: boolean
  prize_pool?: string | number | null
  prize_currency?: string | null
  created_by: string
  min_teams?: number
  max_teams?: number | null
  team_size_min?: number | null
  team_size_max?: number | null
  creator?: { username: string | null; avatar_url: string | null } | null
  isAdmin?: boolean
  registrations?: Array<{
    id: string
    status: string
    team: { id: string; name: string; game: string; logo_url: string | null; platform: string }
  }>
  tournament_stages?: Array<{ id: string; name: string; stage_order: number; stage_type: string }>
}

// Récupérer la liste des tournois publics
export async function getTournaments(): Promise<TournamentDetail[]> {
  try {
    const tournaments = await prisma.tournaments.findMany({
      where: {
        deleted_at: null,
        is_public: true,
      },
      orderBy: {
        starts_at: 'asc',
      },
    })

    return tournaments.map((tournament) => ({
      ...tournament,
      prize_pool: tournament.prize_pool?.toNumber() ?? null,
    }))
  } catch (error) {
    console.error("Erreur getTournaments:", error)
    return []
  }
}

export async function getMyTournaments(): Promise<TournamentDetail[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  try {
    const tournaments = await prisma.tournaments.findMany({
      where: {
        deleted_at: null,
        created_by: user.id,
      },
      orderBy: {
        starts_at: 'asc',
      },
    })

    return tournaments.map((tournament) => ({
      ...tournament,
      prize_pool: tournament.prize_pool?.toNumber() ?? null,
    }))
  } catch (error) {
    console.error("Erreur getTournaments:", error)
    return []
  }
}

// Récupérer un tournoi par son ID ou son Slug
export async function getTournamentById(idOrSlug: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  try {
    const tournament = await prisma.tournaments.findFirst({
      where: {
        OR: [
          { id: idOrSlug },
          { slug: idOrSlug },
        ],
        deleted_at: null,
      },
      include: {
        profiles: {
          select: {
            id: true,
            username: true,
            avatar_url: true,
          },
        },
        tournament_stages: {
          orderBy: { stage_order: 'asc' },
        },
        tournament_registrations: {
          include: {
            teams: {
              select: {
                id: true,
                name: true,
                game: true,
                logo_url: true,
                platform: true,
              },
            },
          },
        },
      },
    })

    if (!tournament) return null
    if (!tournament.is_public && tournament.created_by !== user?.id) return null
    return {
      ...tournament,
      creator: tournament.profiles,
      prize_pool: tournament.prize_pool?.toNumber() ?? null,
      isAdmin: tournament.created_by === user?.id,
      registrations: tournament.tournament_registrations.map((registration) => ({
        id: registration.id,
        status: registration.status,
        team: registration.teams,
      })),
    }
  } catch (error) {
    console.error("Erreur getTournamentById:", error)
    return null
  }
}

export async function updateTournament(tournamentId: string, prevState: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Non authentifié." }

  const name = String(formData.get("name") || "").trim()
  const game = String(formData.get("game") || "").trim()
  const platform = String(formData.get("platform") || "")
  const status = String(formData.get("status") || "")
  const allowedPlatforms = ["PC", "PLAYSTATION", "XBOX", "SWITCH", "MOBILE", "CROSS_PLATFORM", "OTHER"]
  const allowedStatuses = ["DRAFT", "REGISTRATION_OPEN", "REGISTRATION_CLOSED", "CHECK_IN", "IN_PROGRESS", "COMPLETED", "CANCELLED", "ARCHIVED"]

  if (!name || !game) {
    return { success: false, message: "Le nom du tournoi et le jeu sont obligatoires." }
  }
  if (!allowedPlatforms.includes(platform) || !allowedStatuses.includes(status)) {
    return { success: false, message: "Plateforme ou statut invalide." }
  }

  try {
    const result = await prisma.tournaments.updateMany({
      where: { id: tournamentId, created_by: user.id, deleted_at: null },
      data: {
        name,
        game,
        platform: platform as "PC" | "PLAYSTATION" | "XBOX" | "SWITCH" | "MOBILE" | "CROSS_PLATFORM" | "OTHER",
        status: status as "DRAFT" | "REGISTRATION_OPEN" | "REGISTRATION_CLOSED" | "CHECK_IN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "ARCHIVED",
      },
    })
    if (result.count === 0) {
      return { success: false, message: "Tournoi introuvable ou action non autorisée." }
    }

    revalidatePath(`/dashboard/tournaments/${tournamentId}`)
    revalidatePath("/dashboard/tournaments")
  } catch (error) {
    console.error("Erreur updateTournament:", error)
    return { success: false, message: "Erreur lors de la mise à jour du tournoi." }
  }
  redirect(`/dashboard/tournaments/${tournamentId}`)
}

// Créer un tournoi
export async function createTournament(prevState: any, formData: FormData) {
  const supabase = await createClient()
  // Dans createTournament, juste après avoir récupéré `user` :
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Non authentifié." }

  // SÉCURITÉ : Vérifier et créer le profil s'il n'existe pas encore dans public.profiles
  try {
    await ensurePublicProfile(user)
  } catch (error) {
    console.error("Impossible de créer le profil public:", error)
    return { success: false, message: "Erreur de synchronisation du profil utilisateur." }
  }

  const name = formData.get("name") as string
  const game = formData.get("game") as string
  const platform = (formData.get("platform") as string) || "PC"
  const description = formData.get("description") as string
  const rules = formData.get("rules") as string
  const organizerStructureId = (formData.get("organizer_structure_id") as string) || null

  const isPublic = formData.get("is_public") === "true"
  const isFree = formData.get("is_free") === "true"

  const minTeams = parseInt(formData.get("min_teams") as string) || 2
  const maxTeams = formData.get("max_teams") ? parseInt(formData.get("max_teams") as string) : null
  const teamSizeMin = formData.get("team_size_min") ? parseInt(formData.get("team_size_min") as string) : null
  const teamSizeMax = formData.get("team_size_max") ? parseInt(formData.get("team_size_max") as string) : null

  const prizePool = formData.get("prize_pool") ? parseFloat(formData.get("prize_pool") as string) : null
  const prizeCurrency = (formData.get("prize_currency") as string) || "EUR"

  const registrationOpensAt = formData.get("registration_opens_at") ? new Date(formData.get("registration_opens_at") as string) : null
  const registrationClosesAt = formData.get("registration_closes_at") ? new Date(formData.get("registration_closes_at") as string) : null
  const checkInOpensAt = formData.get("check_in_opens_at") ? new Date(formData.get("check_in_opens_at") as string) : null
  const startsAt = formData.get("starts_at") ? new Date(formData.get("starts_at") as string) : null
  const endsAt = formData.get("ends_at") ? new Date(formData.get("ends_at") as string) : null
  const timezone = String(formData.get("timezone") || "UTC").trim()

  if (!name || !game) {
    return { success: false, message: "Le nom du tournoi et le jeu sont obligatoires." }
  }
  if (!["PC", "PLAYSTATION", "XBOX", "SWITCH", "MOBILE", "CROSS_PLATFORM", "OTHER"].includes(platform)) {
    return { success: false, message: "Plateforme invalide." }
  }
  if (
    minTeams < 2 ||
    (maxTeams !== null && (!Number.isInteger(maxTeams) || maxTeams < minTeams)) ||
    (teamSizeMin !== null && (!Number.isInteger(teamSizeMin) || teamSizeMin < 1)) ||
    (teamSizeMax !== null && (!Number.isInteger(teamSizeMax) || teamSizeMax < (teamSizeMin ?? 1))) ||
    (prizePool !== null && (!Number.isFinite(prizePool) || prizePool < 0))
  ) {
    return { success: false, message: "Vérifiez les limites d'équipes, le format et la récompense." }
  }
  if (
    (registrationOpensAt && Number.isNaN(registrationOpensAt.getTime())) ||
    (registrationClosesAt && Number.isNaN(registrationClosesAt.getTime())) ||
    (checkInOpensAt && Number.isNaN(checkInOpensAt.getTime())) ||
    (startsAt && Number.isNaN(startsAt.getTime())) ||
    (endsAt && Number.isNaN(endsAt.getTime())) ||
    (startsAt && endsAt && endsAt <= startsAt)
  ) {
    return { success: false, message: "Vérifiez les dates saisies pour le tournoi." }
  }
  if (organizerStructureId) {
    const membership = await prisma.structure_members.findUnique({
      where: {
        structure_id_user_id: { structure_id: organizerStructureId, user_id: user.id },
      },
      select: { role: true },
    })
    if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
      return { success: false, message: "Vous ne pouvez pas organiser ce tournoi pour cette structure." }
    }
  }

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "") + "-" + Date.now().toString().slice(-4)

  let tournamentId: string
  try {
    const tournament = await prisma.tournaments.create({
      data: {
        name,
        slug,
        game,
        platform: platform as "PC" | "PLAYSTATION" | "XBOX" | "SWITCH" | "MOBILE" | "CROSS_PLATFORM" | "OTHER",
        description: description || null,
        rules: rules || null,
        organizer_structure_id: organizerStructureId,
        created_by: user.id,
        status: "DRAFT",
        is_public: isPublic,
        is_free: isFree,
        min_teams: minTeams,
        max_teams: maxTeams,
        team_size_min: teamSizeMin,
        team_size_max: teamSizeMax,
        prize_pool: prizePool,
        prize_currency: prizeCurrency,
        registration_opens_at: registrationOpensAt,
        registration_closes_at: registrationClosesAt,
        check_in_opens_at: checkInOpensAt,
        starts_at: startsAt,
        ends_at: endsAt,
        timezone,
      },
    })

    tournamentId = tournament.id
  } catch (error: any) {
    console.error("Erreur création tournoi:", error)
    return { success: false, message: error?.message || "Erreur lors de la création du tournoi." }
  }
  revalidatePath("/dashboard/tournaments")
  redirect(`/dashboard/tournaments/${tournamentId}`)
}

// Inscrire une équipe à un tournoi
export async function registerTeamToTournament(tournamentId: string, teamId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Non authentifié." }

  try {
    const [tournament, team] = await Promise.all([
      prisma.tournaments.findFirst({
        where: {
          id: tournamentId,
          created_by: user.id,
          deleted_at: null,
          status: { in: ["DRAFT", "REGISTRATION_OPEN"] },
        },
        select: { game: true },
      }),
      prisma.teams.findFirst({
        where: { id: teamId, deleted_at: null, is_public: true },
        select: { id: true, game: true },
      }),
    ])
    if (!tournament) {
      return { success: false, message: "Tournoi introuvable, fermé ou action non autorisée." }
    }
    if (!team) {
      return { success: false, message: "Équipe introuvable ou privée." }
    }
    if (tournament.game.toLowerCase() !== team.game.toLowerCase()) {
      return { success: false, message: "Cette équipe ne joue pas au même jeu que le tournoi." }
    }

    // Vérifier si l'équipe est déjà inscrite
    const existingRegistration = await prisma.tournament_registrations.findUnique({
      where: {
        tournament_id_team_id: {
          tournament_id: tournamentId,
          team_id: teamId,
        },
      },
    })

    if (existingRegistration) {
      return { success: false, message: "Cette équipe est déjà inscrite à ce tournoi." }
    }

    await prisma.tournament_registrations.create({
      data: {
        tournament_id: tournamentId,
        team_id: teamId,
        registered_by: user.id,
        status: "PENDING",
      },
    })

    revalidatePath(`/dashboard/tournaments/${tournamentId}`)
    return { success: true, message: "Équipe inscrite avec succès (en attente de validation)." }
  } catch (error: any) {
    console.error("Erreur inscription tournoi:", error)
    return { success: false, message: error?.message || "Erreur lors de l'inscription." }
  }
}