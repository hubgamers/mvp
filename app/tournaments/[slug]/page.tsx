import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { prisma } from "@/lib/prisma"
import {
  Trophy,
  Users,
  Calendar,
  Gamepad2,
  Tv,
  Coins,
  Shield,
  Clock,
  Swords,
  Layers,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TournamentRegisterButton } from "./tournament-register-button"

interface TournamentPublicPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: TournamentPublicPageProps) {
  const { slug } = await params
  const tournament = await prisma.tournaments.findUnique({
    where: { slug },
    select: { name: true, game: true },
  })

  if (!tournament) return { title: "Tournoi introuvable · HubGamers" }

  return {
    title: `${tournament.name} (${tournament.game || "Esport"}) · HubGamers`,
    description: `Rejoignez le tournoi officiel ${tournament.name} sur HubGamers.`,
  }
}

export default async function TournamentPublicPage({ params }: TournamentPublicPageProps) {
  const { slug } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const tournament = await prisma.tournaments.findUnique({
    where: { slug },
    include: {
      tournament_statuses: true,
      tournaments_registrations: {
        where: { status_code: "ACCEPTED" },
        include: {
          rosters: {
            include: {
              rosters_members: {
                include: {
                  users: { select: { display_name: true } },
                  team_roles: true,
                },
              },
            },
          },
        },
      },
      tournaments_stages: {
        include: {
          bo_options: true,
          tournaments_matches: {
            include: {
              match_statuses: true,
              rosters_tournaments_matches_roster1_idTorosters: true,
              rosters_tournaments_matches_roster2_idTorosters: true,
              rosters_tournaments_matches_winner_roster_idTorosters: true,
            },
          },
        },
      },
      tournament_prizes: {
        orderBy: { position: "asc" },
      },
      tournament_sponsors: {
        include: { sponsors: true },
      },
    },
  })

  if (!tournament) {
    notFound()
  }

  // Si l'utilisateur est connecté, récupérer ses rosters éligibles pour l'inscription
  let userRosters: any[] = []
  if (user) {
    userRosters = await prisma.rosters.findMany({
      where: {
        deleted: false,
        rosters_members: {
          some: {
            user_id: user.id,
            role_code: "CAPTAIN", // Seuls les capitaines peuvent inscrire
          },
        },
      },
      include: {
        tournaments_registrations: {
          where: { tournament_id: tournament.id },
        },
      },
    })
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100">
      {/* Header public */}
      <header className="border-b border-white/[0.08] bg-black/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground">
              <Link href="/tournaments">
                <ArrowLeft className="size-4 mr-1.5" />
                Retour aux tournois
              </Link>
            </Button>
            <div className="h-4 w-px bg-white/10" />
            <span className="font-bold text-white text-sm">
              HUB<span className="text-cyan-400">GAMERS</span> ARENA
            </span>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <Button asChild size="sm" variant="outline" className="border-white/10 text-xs">
                <Link href="/dashboard">Mon Dashboard</Link>
              </Button>
            ) : (
              <Button asChild size="sm" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs">
                <Link href="/login">Se connecter pour participer</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero section */}
      <div className="relative border-b border-white/[0.08] bg-gradient-to-b from-cyan-950/20 via-black/40 to-transparent py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-xs uppercase font-mono">
                  {tournament.tournament_statuses?.label || tournament.status_code}
                </Badge>
                {tournament.game && (
                  <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs font-semibold">
                    <Gamepad2 className="size-3.5 mr-1" />
                    {tournament.game}
                  </Badge>
                )}
                {tournament.platform && (
                  <Badge variant="secondary" className="text-xs">
                    {tournament.platform}
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
                {tournament.name}
              </h1>

              <p className="text-sm sm:text-base text-slate-300">
                Format officiel : <strong className="text-white">{tournament.format || "Standard"}</strong>.
                {tournament.checkin_enabled && " Période de check-in obligatoire requise."}
              </p>
            </div>

            {/* Inscription Action */}
            <div className="p-5 rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md shrink-0 w-full md:w-80 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Dotation :</span>
                <span className="text-2xl font-black text-amber-400">
                  {tournament.cashprize ? `${Number(tournament.cashprize)} €` : "Gratuit"}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Places confirmées :</span>
                <span className="font-bold text-white">
                  {tournament.tournaments_registrations.length} / {tournament.nb_rosters || "Illimité"}
                </span>
              </div>

              <TournamentRegisterButton
                tournamentId={tournament.id}
                isLoggedIn={!!user}
                userRosters={userRosters}
                isFull={
                  tournament.nb_rosters
                    ? tournament.tournaments_registrations.length >= tournament.nb_rosters
                    : false
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Détails du tournoi & Horaires */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-white/10 bg-card/50 backdrop-blur-sm">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="size-4 text-cyan-400" />
                Planning officiel
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-2 text-xs space-y-3">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-muted-foreground">Inscriptions :</span>
                <span className="text-white font-medium">
                  {tournament.registration_end_at
                    ? `Jusqu'au ${new Date(tournament.registration_end_at).toLocaleDateString("fr-FR")}`
                    : "Ouvertes"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-muted-foreground">Lancement :</span>
                <span className="text-white font-medium">
                  {tournament.start_at
                    ? new Date(tournament.start_at).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "À définir"}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Frais d'entrée :</span>
                <span className="text-emerald-400 font-bold">
                  {tournament.prix_entree || "Gratuit"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-card/50 backdrop-blur-sm">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <Trophy className="size-4 text-amber-400" />
                Répartition des prix
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-2 text-xs space-y-2">
              {tournament.tournament_prizes.length === 0 ? (
                <div className="text-muted-foreground py-2">
                  1er : 100% du Cashprize ({tournament.cashprize || 0} €)
                </div>
              ) : (
                tournament.tournament_prizes.map((p) => (
                  <div key={p.id} className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-white font-medium">Top {p.position}</span>
                    <span className="text-amber-400 font-bold">{Number(p.amount)} €</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-card/50 backdrop-blur-sm">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="size-4 text-emerald-400" />
                Règles & Fair-play
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-2 text-xs text-muted-foreground space-y-2">
              <p>• Comportement anti-sportif interdit (sanction disqualification).</p>
              <p>• Chaque joueur doit renseigner son pseudo en jeu vérifié sur son profil.</p>
              <p>• Retard maximum autorisé : 10 minutes après l'heure programmée.</p>
            </CardContent>
          </Card>
        </div>

        {/* Équipes participantes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="size-5 text-cyan-400" />
              Équipes inscrites ({tournament.tournaments_registrations.length})
            </h2>
          </div>

          {tournament.tournaments_registrations.length === 0 ? (
            <div className="p-8 rounded-xl border border-dashed border-white/10 bg-black/20 text-center text-xs text-muted-foreground">
              Aucune équipe inscrite pour l'instant. Soyez les premiers à vous inscrire !
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {tournament.tournaments_registrations.map((reg) => (
                <div
                  key={reg.roster_id}
                  className="p-4 rounded-xl bg-card/40 border border-white/10 hover:border-white/20 transition-colors"
                >
                  <div className="font-bold text-white text-sm mb-1">{reg.rosters.name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {reg.rosters.rosters_members.length} joueurs inscrits
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Arbre / Bracket si disponible */}
        {tournament.tournaments_stages.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Swords className="size-5 text-purple-400" />
              Arbre de compétition
            </h2>

            <div className="p-6 rounded-2xl border border-white/10 bg-black/40 space-y-4 overflow-x-auto">
              {tournament.tournaments_stages.map((stage) => (
                <div key={stage.id} className="space-y-3 min-w-[600px]">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">
                      {stage.name || "Phase Principale"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Format : {stage.bo_options.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stage.tournaments_matches.map((m) => (
                      <div
                        key={m.id}
                        className="p-3 rounded-lg bg-black/60 border border-white/5 text-xs space-y-2"
                      >
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase font-mono">
                          <span>Round {m.round_number || 1}</span>
                          <span className={m.status_code === "LIVE" ? "text-emerald-400 font-bold" : ""}>
                            {m.match_statuses.label}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className={`flex justify-between font-bold ${m.winner_roster_id === m.roster1_id ? "text-emerald-400" : "text-white"}`}>
                            <span className="truncate">{m.rosters_tournaments_matches_roster1_idTorosters?.name || "TBD"}</span>
                          </div>
                          <div className={`flex justify-between font-bold ${m.winner_roster_id === m.roster2_id ? "text-emerald-400" : "text-white"}`}>
                            <span className="truncate">{m.rosters_tournaments_matches_roster2_idTorosters?.name || "TBD"}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
