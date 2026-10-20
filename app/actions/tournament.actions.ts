// app/actions/tournament.actions.ts
'use server'

import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export interface TournamentDetail {
  id: string
  name: string
  slug: string
  description?: string | null
  game: string
  platform: any
  status: any
  starts_at?: Date | null
  ends_at?: Date | null
  is_public: boolean
  is_free: boolean
  prize_pool?: any
  prize_currency?: string | null
  created_by: string
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

    return tournaments as TournamentDetail[]
  } catch (error) {
    console.error("Erreur getTournaments:", error)
    return []
  }
}

// Récupérer un tournoi par son ID ou son Slug
export async function getTournamentById(idOrSlug: string) {
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
              },
            },
          },
        },
      },
    })

    return tournament
  } catch (error) {
    console.error("Erreur getTournamentById:", error)
    return null
  }
}

// Créer un tournoi
export async function createTournament(prevState: any, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Non authentifié." }

  const name = formData.get("name") as string
  const game = formData.get("game") as string
  const platform = (formData.get("platform") as string) || "PC"
  const description = formData.get("description") as string
  const isFree = formData.get("is_free") === "true"

  if (!name || !game) {
    return { success: false, message: "Le nom du tournoi et le jeu sont obligatoires." }
  }

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "") + "-" + Date.now().toString().slice(-4)

  try {
    const tournament = await prisma.tournaments.create({
      data: {
        name,
        slug,
        game,
        platform: platform as any,
        description,
        is_free: isFree,
        created_by: user.id,
        status: "DRAFT",
      },
    })

    revalidatePath("/dashboard/tournaments")
    redirect(`/dashboard/tournaments/${tournament.id}`)
  } catch (error: any) {
    console.error("Erreur création tournoi:", error)
    return { success: false, message: error?.message || "Erreur lors de la création du tournoi." }
  }
}

// Inscrire une équipe à un tournoi
export async function registerTeamToTournament(tournamentId: string, teamId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Non authentifié." }

  try {
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