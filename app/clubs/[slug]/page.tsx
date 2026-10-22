import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { prisma } from "@/lib/prisma"
import {
  Building2,
  UsersRound,
  Shield,
  ArrowLeft,
  Gamepad2,
  Calendar,
  Sparkles,
  Trophy,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ClubPublicPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: ClubPublicPageProps) {
  const { slug } = await params
  const club = await prisma.clubs.findUnique({
    where: { slug },
    select: { name: true, description: true },
  })

  if (!club) return { title: "Club introuvable · HubGamers" }

  return {
    title: `${club.name} · Club Esport HubGamers`,
    description: club.description || `Page officielle du club ${club.name} sur HubGamers.`,
  }
}

export default async function ClubPublicPage({ params }: ClubPublicPageProps) {
  const { slug } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const club = await prisma.clubs.findUnique({
    where: { slug },
    include: {
      clubs_members: {
        include: {
          club_roles: true,
          users: { select: { display_name: true } },
        },
      },
      rosters: {
        where: { deleted: false },
        include: {
          rosters_members: {
            include: {
              team_roles: true,
              users: { select: { display_name: true } },
            },
          },
          _count: {
            select: { tournaments_registrations: true },
          },
        },
      },
    },
  })

  if (!club || club.deleted) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100">
      {/* Header public */}
      <header className="border-b border-white/[0.08] bg-black/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground">
              <Link href="/clubs">
                <ArrowLeft className="size-4 mr-1.5" />
                Retour aux clubs
              </Link>
            </Button>
            <div className="h-4 w-px bg-white/10" />
            <span className="font-bold text-white text-sm">
              HUB<span className="text-emerald-400">GAMERS</span> ESPORT
            </span>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <Button asChild size="sm" variant="outline" className="border-white/10 text-xs">
                <Link href="/dashboard">Mon Dashboard</Link>
              </Button>
            ) : (
              <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs">
                <Link href="/login">Rejoindre HubGamers</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero du club */}
      <div className="relative border-b border-white/[0.08] bg-gradient-to-b from-emerald-950/20 via-black/40 to-transparent py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="size-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-slate-950 font-black text-3xl shadow-xl shadow-emerald-500/20 border-2 border-white/20">
                {club.name.slice(0, 2).toUpperCase()}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    STRUCTURE OFFICIELLE
                  </span>
                  {club.recruit_open && (
                    <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[10px]">
                      Recrutements ouverts
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase">
                  {club.name}
                </h1>
                <p className="text-xs text-muted-foreground">
                  Créé le {club.created_at ? new Date(club.created_at).toLocaleDateString("fr-FR") : "2024"} · {club.clubs_members.length} membres actifs
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {club.recruit_open && (
                <Button asChild className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg">
                  <Link href="/dashboard/invitations">
                    Postuler / Rejoindre
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Description */}
        <Card className="border-white/10 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-white">Présentation</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-300">
            {club.description || "Aucune description renseignée pour cette structure."}
          </CardContent>
        </Card>

        {/* Rosters compétitifs */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Gamepad2 className="size-5 text-purple-400" />
            Lineups Officielles ({club.rosters.length})
          </h2>

          {club.rosters.length === 0 ? (
            <div className="p-8 rounded-xl border border-dashed border-white/10 bg-black/20 text-center text-xs text-muted-foreground">
              Aucun roster actif n'est actuellement rattaché à ce club.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {club.rosters.map((roster) => (
                <Card key={roster.id} className="border-white/10 bg-card/60 backdrop-blur-sm">
                  <CardHeader className="p-5 pb-2">
                    <Badge variant="secondary" className="w-fit text-[11px] mb-1">
                      {roster.game || "Multi-gaming"}
                    </Badge>
                    <CardTitle className="text-base font-bold text-white">{roster.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 pt-2 space-y-3 text-xs">
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-muted-foreground">Plateforme :</span>
                      <span className="text-white font-medium">{roster.platform || "PC"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-muted-foreground">Joueurs :</span>
                      <span className="text-white font-medium">{roster.rosters_members.length} membres</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Compétitions :</span>
                      <span className="text-cyan-400 font-bold">
                        {roster._count.tournaments_registrations} tournoi(s)
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Membres / Staff */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <UsersRound className="size-5 text-emerald-400" />
            Effectif du club ({club.clubs_members.length})
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {club.clubs_members.map((m) => (
              <div key={m.user_id} className="p-3 rounded-xl bg-card/40 border border-white/5 flex items-center gap-3">
                <div className="size-9 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs text-white shrink-0">
                  {m.users.display_name?.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-xs text-white truncate">{m.users.display_name}</div>
                  <div className="text-[10px] text-muted-foreground uppercase">{m.club_roles?.label || m.role_code}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
