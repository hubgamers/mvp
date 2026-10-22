import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { prisma } from "@/lib/prisma"
import {
  UsersRound,
  Trophy,
  Gamepad2,
  Plus,
  ArrowRight,
  Shield,
  Calendar,
  Crown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export const metadata = {
  title: "Mes Équipes & Lineups · HubGamers",
  description: "Gérez vos équipes de compétition, joueurs et inscriptions aux tournois.",
}

export default async function DashboardTeamsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const rosters = await prisma.rosters.findMany({
    where: {
      deleted: false,
      rosters_members: {
        some: { user_id: user.id },
      },
    },
    include: {
      rosters_members: {
        include: {
          team_roles: true,
          users: { select: { id: true, display_name: true, email: true } },
        },
      },
      tournaments_registrations: {
        include: {
          tournaments: true,
        },
      },
      _count: {
        select: {
          rosters_members: true,
          tournaments_registrations: true,
        },
      },
    },
    orderBy: { created_at: "desc" },
  })

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <UsersRound className="size-4 text-purple-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
              EFFECTIFS COMPÉTITIFS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Mes Équipes & Lineups
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Assemblez vos effectifs, invitez vos coéquipiers et participez ensemble aux tournois majeurs.
          </p>
        </div>

        <Button asChild className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs hover:opacity-90">
          <Link href="/dashboard/teams/new">
            <Plus className="size-4 mr-1.5" />
            Créer une nouvelle lineup
          </Link>
        </Button>
      </div>

      {rosters.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-white/10 bg-black/20">
          <UsersRound className="size-12 mx-auto text-muted-foreground mb-3 opacity-40" />
          <h3 className="text-base font-bold text-white">Vous n'avez aucune lineup enregistrée</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Créez votre première équipe pour inviter des joueurs et pouvoir vous inscrire aux compétitions.
          </p>
          <Button asChild className="mt-5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs">
            <Link href="/dashboard/teams/new">
              <Plus className="size-3.5 mr-1" />
              Créer mon équipe
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rosters.map((roster) => {
            const myMembership = roster.rosters_members.find((m) => m.user_id === user.id)
            const isCaptain = myMembership?.role_code === "CAPTAIN"

            return (
              <Card
                key={roster.id}
                className="group border-white/10 bg-card/60 backdrop-blur-sm hover:border-white/20 hover:bg-card/90 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Badge
                        variant={isCaptain ? "default" : "outline"}
                        className={`text-[10px] uppercase font-mono ${
                          isCaptain ? "bg-purple-500/20 text-purple-400 border-purple-500/30" : ""
                        }`}
                      >
                        {myMembership?.team_roles?.label || myMembership?.role_code || "Joueur"}
                      </Badge>
                      {roster.game && (
                        <Badge variant="secondary" className="text-[11px] bg-white/5 border-white/10">
                          <Gamepad2 className="size-3 mr-1 text-cyan-400" />
                          {roster.game}
                        </Badge>
                      )}
                    </div>
                    <h2 className="text-lg font-bold text-white tracking-tight line-clamp-1 group-hover:text-purple-400 transition-colors">
                      {roster.name}
                    </h2>
                  </CardHeader>

                  <CardContent className="p-5 pt-0 space-y-3">
                    <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-black/30 border border-white/5 text-xs">
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase">Membres</span>
                        <span className="font-bold text-white">{roster._count.rosters_members} joueurs</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase">Tournois</span>
                        <span className="font-bold text-white">{roster._count.tournaments_registrations} tournoi(s)</span>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Plateforme : <span className="text-white font-medium">{roster.platform || "PC"}</span>
                    </div>
                  </CardContent>
                </div>

                <CardFooter className="p-5 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-muted-foreground">
                    ID: {roster.slug}
                  </span>
                  <Button asChild size="sm" className="h-8 text-xs bg-purple-600 hover:bg-purple-500 text-white font-semibold">
                    <Link href={`/dashboard/teams/${roster.id}`}>
                      Gérer l'équipe
                      <ArrowRight className="size-3 ml-1" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
