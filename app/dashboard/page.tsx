import Link from "next/link"
import { getMyStructures } from "@/app/actions/structure.actions"
import { getMyTeams } from "@/app/actions/team.actions"
import { getMyTournaments } from "@/app/actions/tournament.actions"
import { getMyStudioProjects } from "@/app/actions/studio.actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Building2,
  Clapperboard,
  Plus,
  Trophy,
  UsersRound,
  Tv,
  ArrowRight,
  Flame,
  Swords,
  Calendar,
  Layers,
  Sparkles,
  Gamepad2,
  ExternalLink,
} from "lucide-react"

export default async function DashboardPage() {
  const [structures, teams, tournaments, studioProjects] = await Promise.all([
    getMyStructures(),
    getMyTeams(),
    getMyTournaments(),
    getMyStudioProjects(),
  ])

  const stats = [
    {
      title: "Tournois",
      count: tournaments.length,
      href: "/dashboard/tournaments",
      icon: Trophy,
      accent: "from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400",
      description: "Compétitions actives ou archivées",
    },
    {
      title: "Équipes & Rosters",
      count: teams.length,
      href: "/dashboard/teams",
      icon: UsersRound,
      accent: "from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-400",
      description: "Lineups enregistrées",
    },
    {
      title: "Structures",
      count: structures.length,
      href: "/dashboard/structures",
      icon: Building2,
      accent: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400",
      description: "Clubs & organisations esport",
    },
    {
      title: "Studio Broadcast",
      count: studioProjects.length,
      href: "/dashboard/studio",
      icon: Clapperboard,
      accent: "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400",
      description: "Scènes & overlays stream",
    },
  ]

  const nextTournament = tournaments[0]

  return (
    <div className="flex flex-1 flex-col gap-8 p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Cockpit Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.1] bg-gradient-to-r from-card via-[#0e1626] to-card p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-brand-cyan/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-brand-violet/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-cyan/30 bg-brand-cyan/10 px-3 py-1 text-xs font-semibold text-brand-cyan">
              <span className="size-1.5 rounded-full bg-brand-cyan animate-pulse" />
              QG OPÉRATIONNEL ESPORT
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase">
              Centre de Contrôle HubGamers
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl font-normal">
              Pilotez l'ensemble de votre écosystème compétitif : validation des matchs, génération d'arbres et diffusion en direct sur Twitch/OBS.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg" className="shadow-[0_0_20px_rgba(0,242,254,0.35)]" asChild>
              <Link href="/dashboard/tournaments/new">
                <Plus className="mr-2 size-4" />
                Créer un tournoi
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/dashboard/studio">
                <Tv className="mr-2 size-4 text-purple-400" />
                Ouvrir le Studio
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ title, count, href, icon: Icon, accent, description }) => (
          <Link key={title} href={href} className="group">
            <Card className="h-full border-white/[0.08] bg-card/70 backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                  {title}
                </CardTitle>
                <div className={`size-9 rounded-lg border flex items-center justify-center bg-gradient-to-br ${accent} group-hover:scale-110 transition-transform`}>
                  <Icon className="size-4" />
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="flex items-baseline justify-between">
                  <p className="text-3xl font-black text-white tracking-tight">{count}</p>
                  <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-brand-cyan transition-all" />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Main Content Split: Featured Tournament + Live Studio Status */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Next / Active Tournament Highlight */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Flame className="size-5 text-brand-cyan" />
                  Compétition en vedette
                </CardTitle>
                <CardDescription>
                  Tournoi le plus actif ou récemment programmé
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/tournaments">
                  Voir tout ({tournaments.length})
                  <ArrowRight className="size-3.5 ml-1" />
                </Link>
              </Button>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col justify-center">
              {nextTournament ? (
                <div className="rounded-xl border border-white/[0.08] bg-black/40 p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="size-12 rounded-xl bg-gradient-to-br from-brand-cyan/20 to-blue-600/20 border border-brand-cyan/40 flex items-center justify-center font-black text-brand-cyan">
                        <Gamepad2 className="size-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-white">{nextTournament.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {nextTournament.game} · {nextTournament.platform}
                        </p>
                      </div>
                    </div>
                    <Badge variant="cyber">{nextTournament.status}</Badge>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-white/[0.06] text-xs">
                    <div>
                      <span className="text-muted-foreground block">Format</span>
                      <span className="font-semibold text-white">Élimination Directe</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Date de début</span>
                      <span className="font-semibold text-white">
                        {nextTournament.starts_at
                          ? new Date(nextTournament.starts_at).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Non programmée"}
                      </span>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-muted-foreground block">Action rapide</span>
                      <Link
                        href={`/dashboard/tournaments/${nextTournament.id}`}
                        className="text-brand-cyan font-bold hover:underline inline-flex items-center gap-1"
                      >
                        Gérer l'arbre <ArrowRight className="size-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 px-4 rounded-xl border border-dashed border-white/10 bg-black/20">
                  <Trophy className="size-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <h4 className="text-base font-bold text-white mb-1">Aucune compétition programmée</h4>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4">
                    Lancez votre premier tournoi pour inviter des équipes, générer l'arbre et diffuser les matchs.
                  </p>
                  <Button size="sm" asChild>
                    <Link href="/dashboard/tournaments/new">
                      <Plus className="size-4 mr-1.5" />
                      Créer un tournoi
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>

            <div className="p-4 border-t border-white/[0.06] bg-black/20 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-brand-cyan" />
                Génération automatique des brackets et scores certifiés
              </span>
              <Link
                href="/dashboard/tournaments/explore"
                className="text-white hover:text-brand-cyan font-medium transition-colors"
              >
                Explorer les compétitions publiques →
              </Link>
            </div>
          </Card>
        </div>

        {/* Studio & Broadcast Radar */}
        <div>
          <Card className="h-full flex flex-col justify-between">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Tv className="size-4 text-purple-400" />
                  Régie & Overlays OBS
                </CardTitle>
                <Badge variant="violet">LIVE SYNC</Badge>
              </div>
              <CardDescription>
                Synchronisation de vos diffusions en direct
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">Scènes configurées</span>
                  <span className="font-mono font-bold text-purple-300">{studioProjects.length} projets</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">Résolution Stream</span>
                  <span className="font-mono text-slate-400">1080p60 Full HD</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">Délai API Overlay</span>
                  <span className="font-mono text-emerald-400 font-bold">&lt; 100ms</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                  Accès rapides
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="w-full text-xs" asChild>
                    <Link href="/dashboard/structures/new">
                      + Structure
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="w-full text-xs" asChild>
                    <Link href="/dashboard/teams">
                      Mes Équipes
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="w-full text-xs" asChild>
                    <Link href="/dashboard/chats">
                      Chats Matchs
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="w-full text-xs" asChild>
                    <Link href="/dashboard/studio">
                      Studio Scenes
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>

            <div className="p-4 border-t border-white/[0.06] bg-black/20">
              <Button size="sm" variant="cyber" className="w-full text-xs" asChild>
                <Link href="/dashboard/studio">
                  Ouvrir la régie de stream
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
