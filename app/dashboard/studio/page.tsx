import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { prisma } from "@/lib/prisma"
import { Clapperboard, Tv, Sliders, Shield, Sparkles, Layers } from "lucide-react"
import { StudioClient } from "./studio-client"

export const metadata = {
  title: "Studio Broadcast OBS · HubGamers",
  description: "Console de diffusion esport et overlays dynamiques pour OBS Studio et vMix.",
}

interface StudioPageProps {
  searchParams: Promise<{
    tournament_id?: string
  }>
}

export default async function StudioPage({ searchParams }: StudioPageProps) {
  const { tournament_id } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // 1. Récupérer ou initialiser le studio de l'utilisateur
  let userStudio = await prisma.studios.findFirst({
    where: {
      owner_user_id: user.id,
      ...(tournament_id ? { tournament_id } : {}),
    },
    include: {
      studio_overlays: {
        include: { overlay_types: true },
      },
      studio_scenes_config: true,
      tournaments: true,
      tournaments_matches: {
        include: {
          rosters_tournaments_matches_roster1_idTorosters: true,
          rosters_tournaments_matches_roster2_idTorosters: true,
        },
      },
    },
  })

  // S'il n'en a pas, en créer un automatiquement
  if (!userStudio) {
    userStudio = await prisma.$transaction(async (tx) => {
      const createdStudio = await tx.studios.create({
        data: {
          owner_user_id: user.id,
          name: "Mon Studio HubGamers Broadcast",
          tournament_id: tournament_id || null,
        },
      })

      // Créer la configuration de thème par défaut
      await tx.studio_scenes_config.create({
        data: {
          studio_id: createdStudio.id,
          primary_color: "#00F0FF",
          secondary_color: "#A855F7",
          font_family: "Inter",
          show_sponsors: true,
          show_casters: true,
        },
      })

      // Créer les overlays essentiels avec tokens uniques
      const overlayTypes = ["SCOREBOARD", "MATCH_INFO", "BRACKET", "STARTING_SOON"]
      for (const type_code of overlayTypes) {
        await tx.studio_overlays.create({
          data: {
            studio_id: createdStudio.id,
            type_code,
            access_token: `${type_code.toLowerCase()}_${Math.random().toString(36).substring(2, 12)}`,
            is_enabled: true,
          },
        })
      }

      return tx.studios.findUnique({
        where: { id: createdStudio.id },
        include: {
          studio_overlays: {
            include: { overlay_types: true },
          },
          studio_scenes_config: true,
          tournaments: true,
          tournaments_matches: {
            include: {
              rosters_tournaments_matches_roster1_idTorosters: true,
              rosters_tournaments_matches_roster2_idTorosters: true,
            },
          },
        },
      })
    })
  }

  // Tournois disponibles pour l'utilisateur
  const availableTournaments = await prisma.tournaments.findMany({
    where: {
      tournaments_members: {
        some: { user_id: user.id },
      },
    },
    include: {
      tournaments_stages: {
        include: {
          tournaments_matches: {
            include: {
              rosters_tournaments_matches_roster1_idTorosters: true,
              rosters_tournaments_matches_roster2_idTorosters: true,
            },
          },
        },
      },
    },
  })

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Clapperboard className="size-4 text-purple-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
            OBS & STREAM ENGINE
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
          Studio Broadcast & Overlays Live
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Générez des sources de navigateur (Browser Source) temps réel pour afficher l'arbre, les scores et les matchs sur votre live Twitch / YouTube.
        </p>
      </div>

      <StudioClient
        studio={userStudio!}
        availableTournaments={availableTournaments}
      />
    </div>
  )
}
