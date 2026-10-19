import Link from "next/link"
import { getMyTournaments } from "@/app/actions/tournament.actions"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Plus } from "lucide-react"
import { TournamentList } from "@/components/tournament-list"

export default async function TournamentsPage() {
  const tournaments = await getMyTournaments()

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tournois</h1>
          <p className="text-sm text-muted-foreground">
            Gérez et organisez vos compétitions esport.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/tournaments/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau tournoi
          </Link>
        </Button>
      </div>

      <Separator />

      <TournamentList tournaments={tournaments} />
    </div>
  )
}