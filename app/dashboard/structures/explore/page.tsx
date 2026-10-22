import Link from "next/link"
import { Building2, UsersRound, Search, ArrowRight, Shield, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"

interface ExploreStructuresPageProps {
  searchParams: Promise<{
    q?: string
  }>
}

export const metadata = {
  title: "Explorer les Structures Esport · HubGamers",
  description: "Découvrez l'annuaire des clubs, associations et structures compétitives.",
}

export default async function ExploreStructuresPage({ searchParams }: ExploreStructuresPageProps) {
  const { q } = await searchParams
  const query = q || ""

  const clubs = await prisma.clubs.findMany({
    where: {
      deleted: false,
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      _count: {
        select: {
          clubs_members: true,
          rosters: true,
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
            <Building2 className="size-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              ANNUAIRE ESPORT
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Explorer les Clubs & Organisations
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Trouvez une structure à rejoindre ou découvrez les équipes qui s'affrontent sur HubGamers.
          </p>
        </div>

        <Button asChild className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs">
          <Link href="/dashboard/structures/new">
            <Plus className="size-4 mr-1.5" />
            Créer ma structure
          </Link>
        </Button>
      </div>

      {/* Barre de recherche */}
      <form className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
        <Input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Rechercher par nom de club ou mots-clés..."
          className="pl-9 h-10 text-sm bg-black/40 border-white/10 focus-visible:ring-emerald-400"
        />
      </form>

      {/* Liste des structures */}
      {clubs.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-white/10 bg-black/20">
          <Building2 className="size-12 mx-auto text-muted-foreground mb-3 opacity-40" />
          <h3 className="text-base font-bold text-white">Aucune structure trouvée</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Modifiez votre terme de recherche ou soyez le premier à enregistrer cette structure.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {clubs.map((club) => (
            <Card
              key={club.id}
              className="group border-white/10 bg-card/60 backdrop-blur-sm hover:border-white/20 hover:bg-card/90 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    {club.recruit_open ? (
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                        Recrutement ouvert
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] text-muted-foreground">
                        Effectif complet
                      </Badge>
                    )}
                  </div>
                  <h2 className="text-lg font-bold text-white tracking-tight line-clamp-1 group-hover:text-emerald-400 transition-colors">
                    {club.name}
                  </h2>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {club.description || "Aucune description fournie."}
                  </p>
                </CardHeader>

                <CardContent className="p-5 pt-0">
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-black/30 border border-white/5 text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Membres</span>
                      <span className="font-bold text-white">{club._count.clubs_members}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Rosters</span>
                      <span className="font-bold text-white">{club._count.rosters}</span>
                    </div>
                  </div>
                </CardContent>
              </div>

              <CardFooter className="p-5 border-t border-white/5 flex items-center justify-between">
                <Button asChild size="sm" variant="ghost" className="h-8 text-xs text-muted-foreground">
                  <Link href={`/clubs/${club.slug}`}>
                    Fiche publique
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="h-8 text-xs border-white/10">
                  <Link href={`/clubs/${club.slug}`}>
                    Voir le club
                    <ArrowRight className="size-3 ml-1" />
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
