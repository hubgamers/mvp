import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import {
  Trophy,
  Users,
  Calendar,
  Plus,
  Search,
  Gamepad2,
  Tv,
  ArrowRight,
  Filter,
} from "lucide-react"
import { getGameListFromTournaments, getTournaments } from "@/app/actions/tournament.actions"

interface TournamentsPageProps {
  searchParams: Promise<{
    q?: string
    status?: string
    game?: string
  }>
}

export default async function TournamentsPage({ searchParams }: TournamentsPageProps) {
  const params = await searchParams
  const query = params.q || ""
  const statusFilter = params.status || ""
  const gameFilter = params.game || ""

  // Récupération sécurisée des tournois via l'action avec filtres intégrés
  const tournamentsResult = await getTournaments(false, {
    query,
    statusFilter,
    gameFilter,
  });
  
  const tournaments = tournamentsResult.success ? tournamentsResult.tournaments : [];

  // Récupération de la liste distincte des jeux pour le filtre (si besoin d'affichage dynamique)
  const gamesResult = await getGameListFromTournaments();
  const gamesList = gamesResult.success ? gamesResult.games : [];

  const getStatusBadge = (statusCode: string, label: string) => {
    switch (statusCode?.toLowerCase()) {
      case "live":
      case "ongoing":
      case "in_progress":
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">{label || "EN COURS"}</Badge>
      case "upcoming":
      case "open":
      case "registration_open":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">{label || "À VENIR"}</Badge>
      case "completed":
      case "finished":
        return <Badge className="bg-zinc-500/20 text-zinc-400 border-zinc-500/30">{label || "TERMINÉ"}</Badge>
      default:
        return <Badge variant="outline">{label || statusCode}</Badge>
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Tournois</h1>
          <p className="text-sm text-muted-foreground">
            Gérez vos compétitions, suivez les inscriptions et contrôlez vos diffusions.
          </p>
        </div>
        <Button asChild className="bg-emerald-600 hover:bg-emerald-500 text-white">
          <Link href="/dashboard/tournaments/new">
            <Plus className="size-4 mr-2" />
            Nouveau tournoi
          </Link>
        </Button>
      </div>

      {/* Barre de Filtres et Recherche */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-white/[0.08] bg-card/50 backdrop-blur-sm">
        <form className="relative w-full md:w-80 flex items-center">
          <Search className="absolute left-3 size-4 text-muted-foreground" />
          <Input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Rechercher un tournoi..."
            className="pl-9 h-9 text-xs bg-background/50 border-white/10 focus-visible:ring-emerald-500"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {/* Filtre par statut */}
          <div className="flex items-center gap-1 rounded-lg bg-background/60 p-1 border border-white/5">
            <Link
              href="/dashboard/tournaments"
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                !statusFilter ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white"
              }`}
            >
              Tous
            </Link>
            <Link
              href={`/dashboard/tournaments?status=live${gameFilter ? `&game=${gameFilter}` : ""}`}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                statusFilter === "live" ? "bg-emerald-500/20 text-emerald-400" : "text-muted-foreground hover:text-white"
              }`}
            >
              En cours
            </Link>
            <Link
              href={`/dashboard/tournaments?status=upcoming${gameFilter ? `&game=${gameFilter}` : ""}`}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                statusFilter === "upcoming" ? "bg-blue-500/20 text-blue-400" : "text-muted-foreground hover:text-white"
              }`}
            >
              À venir
            </Link>
          </div>
        </div>
      </div>

      {/* Grille de tournois */}
      {tournaments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 p-12 text-center bg-card/20">
          <div className="rounded-full bg-white/5 p-4 mb-4">
            <Trophy className="size-8 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold text-white">Aucun tournoi trouvé</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Aucun tournoi ne correspond à vos critères de recherche. Essayez de réinitialiser les filtres.
          </p>
          <Button size="sm" variant="outline" className="mt-4 text-xs" asChild>
            <Link href="/dashboard/tournaments">Réinitialiser les filtres</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tournaments.map((tournament: any) => (
            <Card
              key={tournament.id}
              className="group relative overflow-hidden border-white/[0.08] bg-card/40 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-card/70 hover:shadow-lg hover:shadow-black/40 flex flex-col justify-between"
            >
              <div>
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    {getStatusBadge(
                      tournament.status_code,
                      tournament.tournament_statuses?.label || tournament.status_code
                    )}
                    {tournament.game && (
                      <Badge variant="secondary" className="bg-white/5 border-white/10 text-[11px]">
                        <Gamepad2 className="size-3 mr-1 text-purple-400" />
                        {tournament.game}
                      </Badge>
                    )}
                  </div>
                  <h2 className="text-lg font-bold text-white tracking-tight line-clamp-1 group-hover:text-emerald-400 transition-colors">
                    {tournament.name}
                  </h2>
                </CardHeader>

                <CardContent className="p-5 pt-0 space-y-3">
                  {/* Stats du tournoi */}
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-black/20 border border-white/5 text-xs">
                    <div className="flex items-center gap-2">
                      <Trophy className="size-3.5 text-amber-400 shrink-0" />
                      <span className="text-muted-foreground">Cashprize:</span>
                      <span className="font-semibold text-white">
                        {tournament.cashprize
                          ? `${Number(tournament.cashprize).toLocaleString("fr-FR")} €`
                          : "Non spécifié"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Users className="size-3.5 text-blue-400 shrink-0" />
                      <span className="text-muted-foreground">Équipes:</span>
                      <span className="font-semibold text-white">
                        {tournament._count.tournaments_registrations}
                        {tournament.nb_rosters ? ` / ${tournament.nb_rosters}` : ""}
                      </span>
                    </div>
                  </div>

                  {/* Date de début */}
                  <div className="flex items-center text-xs text-muted-foreground gap-2 pt-1">
                    <Calendar className="size-3.5 text-emerald-400" />
                    <span>
                      {tournament.start_at
                        ? new Date(tournament.start_at).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Date non définie"}
                    </span>
                  </div>

                  {/* Streams reliés s'il y en a */}
                  {tournament._count.tournament_streams > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-purple-400">
                      <Tv className="size-3.5" />
                      <span>{tournament._count.tournament_streams} stream(s) configuré(s)</span>
                    </div>
                  )}
                </CardContent>
              </div>

              <CardFooter className="p-5 border-t border-white/5 mt-4 flex items-center justify-between">
                <span className="text-[11px] font-mono text-muted-foreground uppercase">
                  Format: {tournament.format || "Standard"}
                </span>
                <Button size="sm" variant="ghost" className="h-8 text-xs group-hover:bg-white/10" asChild>
                  <Link href={`/dashboard/tournaments/${tournament.id}`}>
                    Gérer
                    <ArrowRight className="size-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}