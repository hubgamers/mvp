import Link from "next/link"
import { getMyStructures } from "@/app/actions/structure.actions"
import { getMyTeams } from "@/app/actions/team.actions"
import { getMyTournaments } from "@/app/actions/tournament.actions"
import { getMyStudioProjects } from "@/app/actions/studio.actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Building2, Clapperboard, Plus, Trophy, UsersRound } from "lucide-react"

export default async function DashboardPage() {
  const [structures, teams, tournaments, studioProjects] = await Promise.all([
    getMyStructures(),
    getMyTeams(),
    getMyTournaments(),
    getMyStudioProjects(),
  ])

  const stats = [
    { title: "Structures", count: structures.length, href: "/dashboard/structures", icon: Building2 },
    { title: "Équipes", count: teams.length, href: "/dashboard/teams", icon: UsersRound },
    { title: "Tournois", count: tournaments.length, href: "/dashboard/tournaments", icon: Trophy },
    { title: "Projets Studio", count: studioProjects.length, href: "/dashboard/studio", icon: Clapperboard },
  ]

  return (
    <div className="flex flex-1 flex-col gap-8 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Votre espace HubGamers</h1>
          <p className="mt-2 text-muted-foreground">
            Gérez vos structures, équipes, compétitions et diffusions depuis un seul endroit.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/tournaments/new">
            <Plus className="mr-2 size-4" />
            Créer un tournoi
          </Link>
        </Button>
      </div>

      <Separator />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ title, count, href, icon: Icon }) => (
          <Link key={title} href={href}>
            <Card className="h-full transition-colors hover:border-primary/50">
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <Icon className="size-5 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">{count}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Accès rapides</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link href="/dashboard/structures/new">Créer une structure</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/teams">Voir mes équipes</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/studio">Ouvrir le Studio</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prochain tournoi</CardTitle>
          </CardHeader>
          <CardContent>
            {tournaments.length ? (
              <Link
                href={`/dashboard/tournaments/${tournaments[0].id}`}
                className="block rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                <p className="font-semibold">{tournaments[0].name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {tournaments[0].game}
                  {tournaments[0].starts_at
                    ? ` · ${new Date(tournaments[0].starts_at).toLocaleDateString("fr-FR")}`
                    : " · Date à définir"}
                </p>
              </Link>
            ) : (
              <p className="text-sm text-muted-foreground">
                Aucun tournoi créé. Lancez votre première compétition.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
