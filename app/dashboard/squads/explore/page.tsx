import Link from "next/link"
import { Users, UserPlus, Gamepad2, Mic, Search, ArrowRight, Plus, Filter, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"

interface ExploreSquadsPageProps {
  searchParams: Promise<{
    q?: string
    game?: string
    type?: string
  }>
}

export const metadata = {
  title: "Explorer les Escouades & LFG · HubGamers",
  description: "Trouvez des coéquipiers pour vos sessions ranked, casual ou scrims esport.",
}

export default async function ExploreSquadsPage({ searchParams }: ExploreSquadsPageProps) {
  const { q, game, type } = await searchParams
  const query = q || ""
  const gameFilter = game || ""
  const typeFilter = type || ""

  const where: any = {}

  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { game: { contains: query, mode: "insensitive" } },
      { role_searched: { contains: query, mode: "insensitive" } },
    ]
  }

  if (gameFilter) {
    where.game = { equals: gameFilter, mode: "insensitive" }
  }

  if (typeFilter) {
    where.type_code = typeFilter
  }

  const squads = await prisma.squads.findMany({
    where,
    include: {
      squad_types: true,
      squads_members: {
        include: {
          users: { select: { display_name: true } },
          squad_member_roles: true,
        },
      },
    },
    orderBy: { created_at: "desc" },
  })

  // Jeux distincts pour les filtres rapides
  const gamesList = await prisma.squads.findMany({
    select: { game: true },
    distinct: ["game"],
    where: { game: { not: null } },
  })
  const distinctGames = gamesList.map((g) => g.game).filter(Boolean) as string[]

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <UserPlus className="size-4 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              LFG · LOOKING FOR GROUP
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Explorer les Escouades Publiques
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Rejoignez des joueurs passionnés prêts à lancer une partie immédiatement.
          </p>
        </div>

        <Button asChild className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs">
          <Link href="/dashboard/squads/new">
            <Plus className="size-4 mr-1.5" />
            Créer une annonce
          </Link>
        </Button>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="p-4 rounded-xl border border-white/10 bg-card/60 backdrop-blur-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <form className="relative flex-1">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Rechercher par jeu, niveau ou rôle..."
              className="pl-9 h-10 text-sm bg-black/40 border-white/10 focus-visible:ring-cyan-400"
            />
          </form>

          {/* Filtres rapides par type */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <Link
              href="/dashboard/squads/explore"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                !typeFilter && !gameFilter ? "bg-cyan-500 text-slate-950" : "bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              Tous
            </Link>
            <Link
              href="/dashboard/squads/explore?type=RANKED"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                typeFilter === "RANKED" ? "bg-cyan-500 text-slate-950" : "bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              Ranked / Compétitif
            </Link>
            <Link
              href="/dashboard/squads/explore?type=CASUAL"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                typeFilter === "CASUAL" ? "bg-cyan-500 text-slate-950" : "bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              Casual / Chill
            </Link>
            <Link
              href="/dashboard/squads/explore?type=SCRIM"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                typeFilter === "SCRIM" ? "bg-cyan-500 text-slate-950" : "bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              Scrim / Entraînement
            </Link>
          </div>
        </div>
      </div>

      {/* Grille des escouades */}
      {squads.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-white/10 bg-black/20">
          <Users className="size-12 mx-auto text-muted-foreground mb-3 opacity-40" />
          <h3 className="text-base font-bold text-white">Aucune escouade trouvée</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Soyez le premier à créer un groupe pour ce jeu et commencez à recruter.
          </p>
          <Button asChild size="sm" variant="outline" className="mt-4 text-xs">
            <Link href="/dashboard/squads/explore">Réinitialiser les filtres</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {squads.map((squad) => {
            const joinedCount = squad.squads_members.filter((m) => m.status === "JOINED").length
            const isFull = squad.nb_places ? joinedCount >= squad.nb_places : false

            return (
              <Card
                key={squad.id}
                className="group border-white/10 bg-card/60 backdrop-blur-sm hover:border-white/20 hover:bg-card/90 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Badge variant="outline" className="text-[10px] uppercase font-mono">
                        {squad.squad_types?.label || squad.type_code}
                      </Badge>
                      {squad.game && (
                        <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[10px]">
                          {squad.game}
                        </Badge>
                      )}
                    </div>
                    <h2 className="text-lg font-bold text-white tracking-tight line-clamp-1 group-hover:text-cyan-400 transition-colors">
                      {squad.name}
                    </h2>
                  </CardHeader>

                  <CardContent className="p-5 pt-0 space-y-3">
                    <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-black/30 border border-white/5 text-xs">
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase">Places</span>
                        <span className={`font-bold ${isFull ? "text-amber-400" : "text-emerald-400"}`}>
                          {joinedCount} / {squad.nb_places || "Illimité"}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase">Niveau</span>
                        <span className="font-bold text-white truncate block">
                          {squad.level || "Tous niveaux"}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1">
                      {squad.role_searched && (
                        <div className="truncate">
                          Profil : <strong className="text-white">{squad.role_searched}</strong>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span>Plateforme : {squad.platform || "PC"}</span>
                        {squad.micro_required && (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <Mic className="size-3" /> Micro
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </div>

                <CardFooter className="p-5 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">
                    {joinedCount} joueur(s) connecté(s)
                  </span>
                  <Button asChild size="sm" className="h-8 text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold">
                    <Link href={`/dashboard/squads/${squad.id}`}>
                      Voir l'escouade
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
