import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { prisma } from "@/lib/prisma"
import {
  Building2,
  UsersRound,
  Plus,
  ArrowRight,
  Shield,
  Search,
  ExternalLink,
  Crown,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export const metadata = {
  title: "Mes Structures Esport · HubGamers",
  description: "Gérez vos organisations compétitives, membres et affiliations.",
}

export default async function DashboardStructuresPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Structures dont l'utilisateur est membre
  const userClubs = await prisma.clubs.findMany({
    where: {
      deleted: false,
      clubs_members: {
        some: { user_id: user.id },
      },
    },
    include: {
      clubs_members: {
        include: {
          club_roles: true,
          users: { select: { display_name: true, email: true } },
        },
      },
      rosters: true,
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
              ORGANISATIONS & CLUBS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Mes Structures Esport
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Consultez et administrez vos clubs professionnels, associations et collectifs gaming.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" className="border-white/10 text-xs">
            <Link href="/dashboard/structures/explore">
              <Search className="size-3.5 mr-1.5" />
              Explorer l'annuaire
            </Link>
          </Button>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs">
            <Link href="/dashboard/structures/new">
              <Plus className="size-4 mr-1.5" />
              Créer une structure
            </Link>
          </Button>
        </div>
      </div>

      {userClubs.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-white/10 bg-black/20">
          <Building2 className="size-12 mx-auto text-muted-foreground mb-3 opacity-40" />
          <h3 className="text-base font-bold text-white">Vous n'avez rejoint aucune structure</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Créez votre club pour regrouper vos équipes ou rejoignez une structure existante via une invitation.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <Button asChild className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs">
              <Link href="/dashboard/structures/new">
                <Plus className="size-3.5 mr-1" />
                Fonder mon club
              </Link>
            </Button>
            <Button asChild variant="outline" className="text-xs">
              <Link href="/dashboard/invitations">Mes invitations reçues</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {userClubs.map((club) => {
            const myMembership = club.clubs_members.find((m) => m.user_id === user.id)
            const isAdmin = myMembership?.role_code === "ADMIN"

            return (
              <Card
                key={club.id}
                className="group border-white/10 bg-card/60 backdrop-blur-sm hover:border-white/20 hover:bg-card/90 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Badge
                        variant={isAdmin ? "default" : "outline"}
                        className={`text-[10px] uppercase font-mono ${
                          isAdmin ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : ""
                        }`}
                      >
                        {myMembership?.club_roles?.label || myMembership?.role_code || "Membre"}
                      </Badge>
                      {club.recruit_open && (
                        <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[10px]">
                          Recrutement ouvert
                        </Badge>
                      )}
                    </div>
                    <h2 className="text-lg font-bold text-white tracking-tight line-clamp-1 group-hover:text-emerald-400 transition-colors">
                      {club.name}
                    </h2>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {club.description || "Aucune description renseignée."}
                    </p>
                  </CardHeader>

                  <CardContent className="p-5 pt-0 space-y-3">
                    <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-black/30 border border-white/5 text-xs">
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase">Membres</span>
                        <span className="font-bold text-white">{club._count.clubs_members} personnes</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase">Rosters</span>
                        <span className="font-bold text-white">{club._count.rosters} équipes</span>
                      </div>
                    </div>
                  </CardContent>
                </div>

                <CardFooter className="p-5 border-t border-white/5 flex items-center justify-between">
                  <Button asChild size="sm" variant="ghost" className="h-8 text-xs text-muted-foreground">
                    <Link href={`/clubs/${club.slug}`}>
                      Page publique
                    </Link>
                  </Button>
                  <Button asChild size="sm" className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold">
                    <Link href={`/dashboard/structures/${club.id}`}>
                      Gérer
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
