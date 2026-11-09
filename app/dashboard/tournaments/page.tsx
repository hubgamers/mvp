import Link from "next/link"
import { Trophy, Users, Calendar, Gamepad2, Search, ArrowRight, Filter, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { getTournaments, getGameListFromTournaments } from "@/app/actions/tournament.actions"

interface MyTournamentsPageProps {
  searchParams: Promise<{
    q?: string
    status?: string
    game?: string
  }>
}

export const metadata = {
  title: "Explorer les tournois · HubGamers",
  description: "Découvrez tous les tournois esport ouverts et rejoignez les compétitions.",
}

export default async function MyTournamentsPage({ searchParams }: MyTournamentsPageProps) {
  const params = await searchParams
  const query = params.q || ""
  const statusFilter = params.status || ""
  const gameFilter = params.game || ""

  // Récupération de TOUS les tournois (pas uniquement les miens)
  const tournamentsResult = await getTournaments(true, {
    query,
    statusFilter,
    gameFilter,
  })

  const tournaments = tournamentsResult.success ? tournamentsResult.tournaments : []
  const gamesResult = await getGameListFromTournaments()
  const gamesList = gamesResult.success ? gamesResult.games : []

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Entête */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="size-4 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              MES COMPÉTITIONS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Tous mes tournois
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Parcourez mes compétitions.
          </p>
        </div>
        <Button asChild className="bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-bold hover:opacity-90">
          <Link href="/dashboard/tournaments/new">
            <Plus className="size-4 mr-1.5" />
            Créer mon tournoi
          </Link>
        </Button>
      </div>

      {/* Barre de filtres et recherche */}
      <div className="p-4 rounded-xl border border-white/10 bg-card/60 backdrop-blur-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <form className="relative flex-1">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Rechercher par titre, jeu ou tags..."
              className="pl-9 h-10 text-sm bg-black/40 border-white/10 focus-visible:ring-cyan-400"
            />
          </form>

          {/* Filtres par jeu */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <Link
              href="/dashboard/tournaments/explore"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${!gameFilter ? "bg-cyan-500 text-slate-950" : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
            >
              Tous les jeux
            </Link>
            {gamesList.slice(0, 6).map(({ game }) => {
              if (!game) return null; // Sécurité si game est null

              const isSelected = gameFilter.toLowerCase() === game.name.toLowerCase();

              return (
                <Link
                  key={game.id || game.name}
                  href={`/dashboard/tournaments/explore?game=${encodeURIComponent(game.name)}${statusFilter ? `&status=${statusFilter}` : ""}`}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${isSelected
                      ? "bg-cyan-500 text-slate-950"
                      : "bg-white/5 text-slate-300 hover:bg-white/10"
                    }`}
                >
                  {game.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Liste des tournois */}
      {tournaments.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-white/10 bg-black/20">
          <Trophy className="size-12 mx-auto text-muted-foreground mb-3 opacity-40" />
          <h3 className="text-base font-bold text-white">Aucun tournoi ne correspond à vos critères</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Essayez de modifier votre recherche ou lancez votre propre tournoi dès aujourd'hui.
          </p>
          <Button asChild size="sm" variant="outline" className="mt-4 text-xs">
            <Link href="/dashboard/tournaments/explore">Réinitialiser les filtres</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tournaments.map((t: any) => (
            <Card
              key={t.id}
              className="group border-white/10 bg-card/60 backdrop-blur-sm hover:border-white/20 hover:bg-card/90 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge variant="outline" className="text-[10px] uppercase font-mono">
                      {t.tournament_statuses?.label || t.status_code}
                    </Badge>
                    {t.game && (
                      <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[11px]">
                        <Gamepad2 className="size-3 mr-1" />
                        {t.game?.name}
                      </Badge>
                    )}
                  </div>
                  <h2 className="text-lg font-bold text-white tracking-tight line-clamp-1 group-hover:text-cyan-400 transition-colors">
                    {t.name}
                  </h2>
                </CardHeader>

                <CardContent className="p-5 pt-0 space-y-3">
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-black/30 border border-white/5 text-xs">
                    <div className="flex items-center gap-2">
                      <Trophy className="size-3.5 text-amber-400 shrink-0" />
                      <span className="text-muted-foreground">Cashprize:</span>
                      <span className="font-bold text-white">
                        {t.cashprize ? `${Number(t.cashprize)} €` : "0 €"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Users className="size-3.5 text-cyan-400 shrink-0" />
                      <span className="text-muted-foreground">Places:</span>
                      <span className="font-bold text-white">
                        {t._count.tournaments_registrations}{t.nb_rosters ? ` / ${t.nb_rosters}` : ""}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="size-3.5 text-emerald-400" />
                    <span>
                      {t.start_at
                        ? new Date(t.start_at).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                        : "Date à venir"}
                    </span>
                  </div>
                </CardContent>
              </div>

              <CardFooter className="p-5 border-t border-white/5 flex items-center justify-between">
                <span className="text-[11px] font-mono text-muted-foreground uppercase">
                  {t.format || "Standard"}
                </span>
                <div className="flex items-center gap-2">
                  <Button asChild size="sm" variant="ghost" className="h-8 text-xs">
                    <Link href={`/tournaments/${t.slug}`}>
                      Page publique
                    </Link>
                  </Button>
                  <Button asChild size="sm" className="h-8 text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold">
                    <Link href={`/dashboard/tournaments/${t.id}`}>
                      Détails
                      <ArrowRight className="size-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
