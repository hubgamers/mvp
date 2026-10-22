import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { prisma } from "@/lib/prisma"
import {
  Trophy,
  Users,
  Calendar,
  Gamepad2,
  Tv,
  Swords,
  Shield,
  Layers,
  Sparkles,
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Plus,
  Clock,
  Radio,
  Coins,
  Building,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TournamentManageActions } from "./tournament-manage-actions"

interface TournamentDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function TournamentDetailPage({ params }: TournamentDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const tournament = await prisma.tournaments.findUnique({
    where: { id },
    include: {
      tournament_statuses: true,
      tournaments_members: {
        include: {
          tournament_member_roles: true,
          users: { select: { id: true, display_name: true, email: true } },
        },
      },
      tournaments_registrations: {
        include: {
          tournament_registration_statuses: true,
          rosters: {
            include: {
              rosters_members: {
                include: {
                  team_roles: true,
                  users: { select: { display_name: true } },
                },
              },
            },
          },
        },
        orderBy: { created_at: "asc" },
      },
      tournaments_stages: {
        include: {
          tournament_stage_types: true,
          tournament_stage_statuses: true,
          bo_options: true,
          tournaments_matches: {
            include: {
              match_statuses: true,
              rosters_tournaments_matches_roster1_idTorosters: true,
              rosters_tournaments_matches_roster2_idTorosters: true,
              rosters_tournaments_matches_winner_roster_idTorosters: true,
              tournaments_match_games: true,
            },
            orderBy: { round_number: "asc" },
          },
        },
        orderBy: { created_at: "asc" },
      },
      tournament_sponsors: {
        include: { sponsors: true },
      },
      tournament_streams: true,
      tournament_prizes: {
        orderBy: { position: "asc" },
      },
    },
  })

  if (!tournament) {
    notFound()
  }

  // Vérifier si l'utilisateur est membre du staff
  const userMembership = tournament.tournaments_members.find((m) => m.user_id === user.id)
  const isStaff = !!userMembership

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Barre supérieure avec retour et actions rapides */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm" className="h-9 w-9 p-0 rounded-full border-white/10">
            <Link href="/dashboard/tournaments">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-[10px] font-mono uppercase">
                {tournament.tournament_statuses?.label || tournament.status_code}
              </Badge>
              {tournament.game && (
                <span className="text-xs text-cyan-400 font-bold uppercase tracking-wider">
                  {tournament.game}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
              {tournament.name}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="sm" className="border-white/10 text-xs">
            <Link href={`/tournaments/${tournament.slug}`} target="_blank">
              <ExternalLink className="size-3.5 mr-1.5" />
              Page publique
            </Link>
          </Button>
          <Button asChild size="sm" className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold">
            <Link href={`/dashboard/studio?tournament_id=${tournament.id}`}>
              <Tv className="size-3.5 mr-1.5" />
              Studio OBS
            </Link>
          </Button>
        </div>
      </div>

      {/* Résumé des métriques du tournoi */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-white/10 bg-card/60 backdrop-blur-sm p-4">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1">
            <Coins className="size-3.5 text-amber-400" />
            Cashprize
          </span>
          <span className="text-xl sm:text-2xl font-black text-white">
            {tournament.cashprize ? `${Number(tournament.cashprize)} €` : "0 €"}
          </span>
        </Card>

        <Card className="border-white/10 bg-card/60 backdrop-blur-sm p-4">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1">
            <Users className="size-3.5 text-cyan-400" />
            Équipes inscrites
          </span>
          <span className="text-xl sm:text-2xl font-black text-white">
            {tournament.tournaments_registrations.length}
            {tournament.nb_rosters ? ` / ${tournament.nb_rosters}` : ""}
          </span>
        </Card>

        <Card className="border-white/10 bg-card/60 backdrop-blur-sm p-4">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1">
            <Layers className="size-3.5 text-purple-400" />
            Étapes & Arbres
          </span>
          <span className="text-xl sm:text-2xl font-black text-white">
            {tournament.tournaments_stages.length} phase(s)
          </span>
        </Card>

        <Card className="border-white/10 bg-card/60 backdrop-blur-sm p-4">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1">
            <Shield className="size-3.5 text-emerald-400" />
            Votre Rôle
          </span>
          <span className="text-base sm:text-lg font-bold text-emerald-400 uppercase">
            {userMembership?.tournament_member_roles?.label || (isStaff ? "Staff" : "Participant")}
          </span>
        </Card>
      </div>

      {/* Contenu avec onglets */}
      <Tabs defaultValue="registrations" className="w-full space-y-6">
        <TabsList className="bg-black/40 border border-white/10 p-1 rounded-xl">
          <TabsTrigger value="registrations" className="text-xs">
            Inscriptions & Équipes ({tournament.tournaments_registrations.length})
          </TabsTrigger>
          <TabsTrigger value="stages" className="text-xs">
            Étapes & Brackets ({tournament.tournaments_stages.length})
          </TabsTrigger>
          <TabsTrigger value="matches" className="text-xs">
            Matchs & Scores
          </TabsTrigger>
          <TabsTrigger value="sponsors" className="text-xs">
            Sponsors & Partenaires ({tournament.tournament_sponsors.length})
          </TabsTrigger>
          <TabsTrigger value="staff" className="text-xs">
            Staff & Arbitres ({tournament.tournaments_members.length})
          </TabsTrigger>
        </TabsList>

        {/* 1. Onglet Inscriptions */}
        <TabsContent value="registrations" className="space-y-4">
          <Card className="border-white/10 bg-card/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-white">
                  Équipes enregistrées au tournoi
                </CardTitle>
                <CardDescription className="text-xs">
                  Validez ou refusez les inscriptions d'équipes et vérifiez leur check-in.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {tournament.tournaments_registrations.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-xs">
                  Aucune équipe inscrite pour l'instant. Les inscriptions sont visibles sur la page publique.
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {tournament.tournaments_registrations.map((reg) => (
                    <div
                      key={reg.roster_id}
                      className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{reg.rosters.name}</span>
                          <Badge
                            variant={reg.status_code === "ACCEPTED" ? "default" : "outline"}
                            className="text-[10px]"
                          >
                            {reg.tournament_registration_statuses?.label || reg.status_code}
                          </Badge>
                          {reg.checked_in && (
                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                              Check-in OK
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {reg.rosters.rosters_members.length} joueurs inscrits dans la lineup
                        </div>
                      </div>

                      {isStaff && (
                        <TournamentManageActions
                          tournamentId={tournament.id}
                          rosterId={reg.roster_id}
                          currentStatus={reg.status_code}
                          checkedIn={!!reg.checked_in}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. Onglet Étapes & Brackets */}
        <TabsContent value="stages" className="space-y-4">
          <Card className="border-white/10 bg-card/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-white">Phases de compétition</CardTitle>
                <CardDescription className="text-xs">
                  Arbres d'élimination et formats de match définis pour ce tournoi.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {tournament.tournaments_stages.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-xs">
                  Aucune étape configurée. Ajoutez un arbre d'élimination directe ou double élimination.
                </div>
              ) : (
                <div className="space-y-4">
                  {tournament.tournaments_stages.map((stage) => (
                    <div
                      key={stage.id}
                      className="p-4 rounded-xl bg-black/30 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-[10px]">
                            {stage.tournament_stage_types?.label || stage.type_code}
                          </Badge>
                          <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[10px]">
                            {stage.bo_options?.label || stage.bo_code}
                          </Badge>
                        </div>
                        <h3 className="font-bold text-white text-sm">{stage.name || "Phase Principale"}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {stage.tournaments_matches.length} matchs générés dans cette étape
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {stage.tournament_stage_statuses?.label || stage.status_code}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. Onglet Matchs */}
        <TabsContent value="matches" className="space-y-4">
          <Card className="border-white/10 bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold text-white">Matchs du tournoi</CardTitle>
              <CardDescription className="text-xs">
                Accédez à la feuille de chaque confrontation pour saisir les scores ou résoudre les litiges.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tournament.tournaments_stages.flatMap((s) => s.tournaments_matches).length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-xs">
                  Aucun match n'a encore été programmé.
                </div>
              ) : (
                <div className="space-y-3">
                  {tournament.tournaments_stages.flatMap((stage) =>
                    stage.tournaments_matches.map((m) => (
                      <div
                        key={m.id}
                        className="p-4 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-[10px] uppercase font-mono">
                            {m.match_statuses.label}
                          </Badge>
                          <div className="text-sm font-bold text-white">
                            <span className="text-cyan-400">
                              {m.rosters_tournaments_matches_roster1_idTorosters?.name || "TBD"}
                            </span>
                            <span className="text-xs text-muted-foreground mx-2">vs</span>
                            <span className="text-purple-400">
                              {m.rosters_tournaments_matches_roster2_idTorosters?.name || "TBD"}
                            </span>
                          </div>
                        </div>

                        <Button asChild size="sm" variant="outline" className="text-xs">
                          <Link href={`/dashboard/matches/${m.id}`}>
                            Gérer le match
                          </Link>
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. Onglet Sponsors */}
        <TabsContent value="sponsors" className="space-y-4">
          <Card className="border-white/10 bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold text-white">Sponsors et partenaires</CardTitle>
              <CardDescription className="text-xs">
                Logos et marques affichés sur vos pages et overlays OBS.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tournament.tournament_sponsors.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-xs">
                  Aucun sponsor rattaché à ce tournoi.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {tournament.tournament_sponsors.map((ts) => (
                    <div
                      key={ts.sponsor_id}
                      className="p-4 rounded-xl bg-black/30 border border-white/5 flex items-center gap-3"
                    >
                      <Building className="size-6 text-amber-400 shrink-0" />
                      <div>
                        <div className="font-bold text-sm text-white">{ts.sponsors.name}</div>
                        <div className="text-[11px] text-muted-foreground">{ts.tier || "Partenaire"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. Onglet Staff */}
        <TabsContent value="staff" className="space-y-4">
          <Card className="border-white/10 bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold text-white">Équipe d'organisation</CardTitle>
              <CardDescription className="text-xs">
                Administrateurs, arbitres officiels et commentateurs autorisés.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-white/5">
                {tournament.tournaments_members.map((member) => (
                  <div key={member.user_id} className="py-3 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-sm text-white">
                        {member.users.display_name}
                      </span>
                      <span className="text-xs text-muted-foreground block">
                        {member.users.email}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs font-mono uppercase">
                      {member.tournament_member_roles?.label || member.role_code}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
