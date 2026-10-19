// components/tournaments/tournament-list.tsx
import Link from "next/link"
import { Tournament } from "@/app/actions/tournament.actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Gamepad2, Monitor, Calendar, Plus } from "lucide-react"

interface TournamentListProps {
  tournaments: Tournament[]
}

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  DRAFT: { label: "Brouillon", variant: "secondary" },
  PUBLISHED: { label: "Publié", variant: "default" },
  IN_PROGRESS: { label: "En cours", variant: "default" },
  COMPLETED: { label: "Terminé", variant: "outline" },
  CANCELLED: { label: "Annulé", variant: "destructive" },
}

export function TournamentList({ tournaments }: TournamentListProps) {
  if (tournaments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center animate-in fade-in-50">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <Gamepad2 className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">Aucun tournoi trouvé</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          Vous n'avez pas encore créé de tournoi. Lancez votre première compétition dès maintenant.
        </p>
        <Button asChild>
          <Link href="/dashboard/tournaments/new">
            <Plus className="mr-2 h-4 w-4" />
            Créer un tournoi
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {tournaments.map((tournament) => {
        const statusConfig = statusMap[tournament.status] || { label: tournament.status, variant: "outline" }

        return (
          <Card key={tournament.id} className="flex flex-col justify-between hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg font-bold truncate">{tournament.name}</CardTitle>
                <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Gamepad2 className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">{tournament.game}</span>
              </div>
              <div className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                <span>Plateforme : {tournament.platform}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Calendar className="h-3.5 w-3.5" />
                <span>Créé le {new Date(tournament.created_at).toLocaleDateString("fr-FR")}</span>
              </div>
            </CardContent>

            <CardFooter className="pt-2">
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/dashboard/tournaments/${tournament.id}`}>
                  Gérer le tournoi
                </Link>
              </Button>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}