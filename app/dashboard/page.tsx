import Link from "next/link"
import { getDashboardData } from "@/app/actions/dashboard.actions"
import {
  Trophy,
  UsersRound,
  Building2,
  Mail,
  Clapperboard,
  ArrowRight,
  Plus,
  Gamepad2,
  Swords,
  UserPlus,
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

export const metadata = {
  title: "Dashboard · HubGamers",
  description: "Tableau de bord de pilotage esport, tournois et équipes.",
}


export default async function DashboardPage() {
  // Récupération des données via l'action serveur
  const {
    userProfile,
    userTournaments = [],
    userRosters = [],
    userClubs = [],
    userSquads = [],
    pendingInvitations = [],
    upcomingMatches = [],
  } = (await getDashboardData()) || {}

  const displayName = userProfile?.display_name || "Gamer"

  const stats = [
    {
      title: "Mes Compétitions",
      value: userTournaments?.length || 0,
      icon: Trophy,
      color: "text-amber-400",
      bg: "bg-amber-400/10 border-amber-400/20",
      href: "/dashboard/tournaments",
    },
    {
      title: "Rosters Actifs",
      value: userRosters?.length || 0,
      icon: UsersRound,
      color: "text-purple-400",
      bg: "bg-purple-400/10 border-purple-400/20",
      href: "/dashboard/teams",
    },
    {
      title: "Structures Esport",
      value: userClubs?.length || 0,
      icon: Building2,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10 border-emerald-400/20",
      href: "/dashboard/structures",
    },
    {
      title: "Mes Escouades LFG",
      value: userSquads?.length || 0,
      icon: UserPlus,
      color: "text-blue-400",
      bg: "bg-blue-400/10 border-blue-400/20",
      href: "/dashboard/squads",
    },
    {
      title: "Invitations Ouvertes",
      value: pendingInvitations?.length || 0,
      icon: Mail,
      color: "text-cyan-400",
      bg: "bg-cyan-400/10 border-cyan-400/20",
      href: "/dashboard/invitations",
    },
  ]

  return (
    <div className="flex flex-1 flex-col gap-8 p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Banner de bienvenue */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-cyan-950/40 via-purple-950/20 to-black/60 p-6 md:p-8 shadow-2xl backdrop-blur-md">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 -mb-10 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="flex size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                HUB ESPORT DE CONTRÔLE
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase">
              Bienvenue, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">{displayName}</span>
            </h1>
            <p className="text-sm text-slate-300">
              Gérez vos tournois en temps réel, organisez vos effectifs compétitifs et lancez vos flux de diffusion en direct.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild className="bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold hover:opacity-90 shadow-lg shadow-cyan-500/20">
              <Link href="/dashboard/tournaments/new">
                <Plus className="size-4 mr-2" />
                Créer un tournoi
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white">
              <Link href="/dashboard/teams/new">
                <UsersRound className="size-4 mr-2 text-purple-400" />
                Nouvelle lineup
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.title} href={stat.href} className="group">
              <Card className="border-white/10 bg-card/60 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-card/90 hover:scale-[1.02]">
                <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {stat.title}
                  </span>
                  <div className={`p-2 rounded-lg border ${stat.bg}`}>
                    <Icon className={`size-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-1 flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-black text-white">
                    {stat.value}
                  </span>
                  <span className="text-[11px] text-muted-foreground flex items-center group-hover:text-cyan-400 transition-colors">
                    Consulter <ArrowRight className="size-3 ml-1" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Grille principale : Matchs à venir & Tournois récents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche (2/3) : Tournois & Matchs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section Matchs programmés */}
          <Card className="border-white/10 bg-card/60 backdrop-blur-sm">
            <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between border-b border-white/5">
              <div>
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                  <Swords className="size-4 text-cyan-400" />
                  Prochains Matchs Programmés
                </CardTitle>
                <CardDescription className="text-xs">
                  Vos confrontations prévues dans les différentes compétitions actives.
                </CardDescription>
              </div>
              <Button asChild size="sm" variant="ghost" className="text-xs text-muted-foreground hover:text-white">
                <Link href="/dashboard/chats">Match Chats</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              {upcomingMatches.length === 0 ? (
                <div className="text-center py-8 rounded-xl border border-dashed border-white/10 bg-black/20">
                  <Gamepad2 className="size-8 mx-auto text-muted-foreground mb-2 opacity-50" />
                  <p className="text-sm font-medium text-white">Aucun match en cours ou programmé</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Inscrivez votre lineup à un tournoi pour commencer à disputer des matchs officiels.
                  </p>
                  <Button asChild size="sm" variant="outline" className="mt-4 text-xs">
                    <Link href="/dashboard/tournaments/explore">Explorer les tournois ouverts</Link>
                  </Button>
                </div>
              ) : (
                upcomingMatches.map((m: any) => (
                  <div
                    key={m.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-black/30 border border-white/5 gap-3 hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="text-center shrink-0">
                        <Badge variant="outline" className="text-[10px] uppercase font-mono">
                          {m.match_statuses?.label || "Statut"}
                        </Badge>
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-400 truncate">
                          {m.tournaments_stages?.tournaments?.name || "Tournoi"} · {m.tournaments_stages?.name || "Phase"}
                        </div>
                        <div className="text-sm font-bold text-white flex items-center gap-2 mt-0.5">
                          <span className="text-cyan-400">{m.rosters_tournaments_matches_roster1_idTorosters?.name || "TBD"}</span>
                          <span className="text-xs text-muted-foreground">vs</span>
                          <span className="text-purple-400">{m.rosters_tournaments_matches_roster2_idTorosters?.name || "TBD"}</span>
                        </div>
                      </div>
                    </div>
                    <Button asChild size="sm" className="shrink-0 bg-white/10 hover:bg-white/20 text-white text-xs">
                      <Link href={`/dashboard/matches/${m.id}`}>Feuille de match</Link>
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Section Mes Tournois */}
          <Card className="border-white/10 bg-card/60 backdrop-blur-sm">
            <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between border-b border-white/5">
              <div>
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                  <Trophy className="size-4 text-amber-400" />
                  Mes Compétitions & Tournois
                </CardTitle>
                <CardDescription className="text-xs">
                  Tournois que vous organisez ou auxquels vous participez en tant que staff.
                </CardDescription>
              </div>
              <Button asChild size="sm" variant="ghost" className="text-xs text-muted-foreground hover:text-white">
                <Link href="/dashboard/tournaments">Voir tous</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              {userTournaments.length === 0 ? (
                <div className="text-center py-8 rounded-xl border border-dashed border-white/10 bg-black/20">
                  <Trophy className="size-8 mx-auto text-muted-foreground mb-2 opacity-50" />
                  <p className="text-sm font-medium text-white">Vous n'avez aucun tournoi actif</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Créez votre première compétition en quelques clics avec gestion de brackets et diffusion OBS.
                  </p>
                  <Button asChild size="sm" className="mt-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs">
                    <Link href="/dashboard/tournaments/new">
                      <Plus className="size-3.5 mr-1" />
                      Créer un tournoi
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {userTournaments.map((t: any) => (
                    <Link
                      key={t.id}
                      href={`/dashboard/tournaments/${t.id}`}
                      className="group block p-4 rounded-xl bg-black/30 border border-white/5 hover:border-white/20 hover:bg-white/[0.03] transition-all"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <Badge variant="outline" className="text-[10px]">
                          {t.tournament_statuses?.label || "Inconnu"}
                        </Badge>
                        {t.game && (
                          <span className="text-[11px] text-cyan-400 font-medium">
                            {t.game}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                        {t.name}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mt-3 pt-2 border-t border-white/5">
                        <span>{t._count?.tournaments_registrations || 0} équipes</span>
                        <span className="font-semibold text-white">
                          {t.cashprize ? `${Number(t.cashprize)} €` : "Sans cashprize"}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Colonne droite (1/3) : Équipes & Invitations */}
        <div className="space-y-6">
          {/* Mes Lineups */}
          <Card className="border-white/10 bg-card/60 backdrop-blur-sm">
            <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between border-b border-white/5">
              <div>
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                  <UsersRound className="size-4 text-purple-400" />
                  Mes Lineups
                </CardTitle>
                <CardDescription className="text-xs">
                  Vos équipes compétitives enregistrées.
                </CardDescription>
              </div>
              <Button asChild size="sm" variant="ghost" className="text-xs text-muted-foreground hover:text-white">
                <Link href="/dashboard/teams">Gérer</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              {userRosters.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  <p>Aucune équipe créée.</p>
                  <Button asChild size="sm" variant="outline" className="mt-3 text-xs">
                    <Link href="/dashboard/teams/new">Créer une équipe</Link>
                  </Button>
                </div>
              ) : (
                userRosters.map((roster: any) => (
                  <Link
                    key={roster.id}
                    href={`/dashboard/teams/${roster.id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <div>
                      <div className="font-bold text-sm text-white">{roster.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {roster.game || "Multi-jeu"} · {roster.rosters_members?.length || 0} joueurs
                      </div>
                    </div>
                    <ArrowRight className="size-3.5 text-muted-foreground" />
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          {/* Raccourcis & Diffusion */}
          <Card className="border-white/10 bg-gradient-to-br from-purple-950/30 to-black/60 backdrop-blur-sm">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <Clapperboard className="size-4 text-purple-400" />
                Studio Broadcast OBS
              </CardTitle>
              <CardDescription className="text-xs">
                Intégrez vos scores, arbres et scènes directement dans votre logiciel de stream.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <Button asChild className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs">
                <Link href="/dashboard/studio">
                  Ouvrir la console OBS
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Invitations reçues */}
          <Card className="border-white/10 bg-card/60 backdrop-blur-sm">
            <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between border-b border-white/5">
              <div>
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                  <Mail className="size-4 text-cyan-400" />
                  Invitations & Recrutements
                </CardTitle>
              </div>
              <Button asChild size="sm" variant="ghost" className="text-xs text-muted-foreground hover:text-white">
                <Link href="/dashboard/invitations">Toutes ({pendingInvitations.length})</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-5">
              {pendingInvitations.length === 0 ? (
                <div className="text-center py-4 text-xs text-muted-foreground">
                  Aucune invitation en attente.
                </div>
              ) : (
                <div className="space-y-2">
                  {pendingInvitations.slice(0, 3).map((inv: any) => (
                    <div key={inv.id} className="p-2.5 rounded-lg bg-black/20 border border-white/5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-white block">Invitation {inv.invitation_target_types?.label || ""}</span>
                        <span className="font-mono text-[10px] text-cyan-400">Code: {inv.code}</span>
                      </div>
                      <Button asChild size="sm" variant="outline" className="h-7 text-[11px]">
                        <Link href="/dashboard/invitations">Répondre</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}