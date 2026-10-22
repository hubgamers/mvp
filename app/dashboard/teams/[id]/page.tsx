import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { prisma } from "@/lib/prisma"
import {
  UsersRound,
  Trophy,
  Gamepad2,
  ArrowLeft,
  Crown,
  UserPlus,
  Mail,
  Calendar,
  Shield,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { RosterManageClient } from "./roster-manage-client"

interface TeamDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function TeamDetailPage({ params }: TeamDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const roster = await prisma.rosters.findUnique({
    where: { id },
    include: {
      rosters_members: {
        include: {
          team_roles: true,
          users: { select: { id: true, display_name: true, email: true } },
        },
      },
      tournaments_registrations: {
        include: {
          tournament_registration_statuses: true,
          tournaments: true,
        },
      },
    },
  })

  if (!roster || roster.deleted) {
    notFound()
  }

  const myMembership = roster.rosters_members.find((m) => m.user_id === user.id)
  const isCaptain = myMembership?.role_code === "CAPTAIN"

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm" className="h-9 w-9 p-0 rounded-full border-white/10">
            <Link href="/dashboard/teams">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={isCaptain ? "default" : "outline"} className="text-[10px] font-mono uppercase">
                {myMembership?.team_roles?.label || myMembership?.role_code || "Membre"}
              </Badge>
              {roster.game && (
                <span className="text-xs text-purple-400 font-bold uppercase tracking-wider">
                  {roster.game}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              {roster.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs">
            <Link href="/dashboard/tournaments/explore">
              <Trophy className="size-3.5 mr-1.5" />
              Inscrire à un tournoi
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche (2/3) : Effectif & Compétitions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Membres de la lineup */}
          <Card className="border-white/10 bg-card/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                  <UsersRound className="size-4 text-purple-400" />
                  Roster & Joueurs ({roster.rosters_members.length})
                </CardTitle>
                <CardDescription className="text-xs">
                  Joueurs enregistrés pour disputer les matchs officiels.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-white/5">
                {roster.rosters_members.map((member) => (
                  <div key={member.user_id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold text-xs">
                        {member.users.display_name?.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          <span>{member.users.display_name}</span>
                          {member.role_code === "CAPTAIN" && (
                            <Crown className="size-3 text-amber-400" />
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">{member.users.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs font-mono uppercase">
                        {member.team_roles?.label || member.role_code}
                      </Badge>
                      {isCaptain && member.user_id !== user.id && (
                        <RosterManageClient
                          rosterId={roster.id}
                          memberUserId={member.user_id}
                          currentRole={member.role_code}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tournois disputés */}
          <Card className="border-white/10 bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <Trophy className="size-4 text-amber-400" />
                Inscriptions & Historique ({roster.tournaments_registrations.length})
              </CardTitle>
              <CardDescription className="text-xs">
                Compétitions auxquelles l'équipe est engagée.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {roster.tournaments_registrations.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  L'équipe n'est encore inscrite à aucun tournoi.
                </div>
              ) : (
                <div className="space-y-3">
                  {roster.tournaments_registrations.map((reg) => (
                    <div
                      key={reg.tournament_id}
                      className="p-3.5 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between"
                    >
                      <div>
                        <h4 className="font-bold text-sm text-white">{reg.tournaments.name}</h4>
                        <span className="text-xs text-muted-foreground">
                          Statut : {reg.tournament_registration_statuses?.label || reg.status_code}
                        </span>
                      </div>
                      <Button asChild size="sm" variant="outline" className="text-xs border-white/10">
                        <Link href={`/dashboard/tournaments/${reg.tournament_id}`}>
                          Voir le tournoi
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Colonne droite (1/3) : Inviter des joueurs */}
        <div className="space-y-6">
          <Card className="border-white/10 bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <Mail className="size-4 text-cyan-400" />
                Inviter un coéquipier
              </CardTitle>
              <CardDescription className="text-xs">
                Générez un code unique pour ajouter un joueur à votre lineup.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RosterManageClient
                rosterId={roster.id}
                isInvitationGenerator
              />
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold text-white">Spécifications Lineup</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-300 space-y-2">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-muted-foreground">Jeu :</span>
                <span className="text-white font-medium">{roster.game || "Non spécifié"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-muted-foreground">Plateforme :</span>
                <span className="text-white font-medium">{roster.platform || "PC"}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Tag unique :</span>
                <span className="font-mono text-cyan-400">{roster.slug}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
