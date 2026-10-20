import Link from "next/link"
import { notFound } from "next/navigation"
import { getMyTournaments } from "@/app/actions/tournament.actions"
import { getMyStudioProjects } from "@/app/actions/studio.actions"
import { CreateStudioForm } from "@/components/studio/create-studio-form"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft } from "lucide-react"

interface PageProps {
  searchParams: Promise<{ tournamentId?: string }>
}

export default async function NewStudioProjectPage({ searchParams }: PageProps) {
  const [{ tournamentId }, tournaments, projects] = await Promise.all([
    searchParams,
    getMyTournaments(),
    getMyStudioProjects(),
  ])
  const existingProject = projects.find((project) => project.tournament_id === tournamentId)
  if (existingProject) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6">
        <p>Un projet Studio existe déjà pour ce tournoi.</p>
        <Button asChild className="w-fit">
          <Link href={`/dashboard/studio/${existingProject.id}`}>Ouvrir le projet Studio</Link>
        </Button>
      </div>
    )
  }

  const availableTournaments = tournaments.filter(
    (tournament) => !projects.some((project) => project.tournament_id === tournament.id)
  )
  if (tournamentId && !tournaments.some((tournament) => tournament.id === tournamentId)) {
    notFound()
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2">
          <Link href="/dashboard/studio">
            <ArrowLeft className="mr-2 size-4" />
            Retour au Studio
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Créer un projet Studio</h1>
        <p className="text-sm text-muted-foreground">
          Chaque projet est associé à un tournoi et démarre avec quatre scènes configurables.
        </p>
      </div>
      <Separator />
      {availableTournaments.length > 0 ? (
        <CreateStudioForm
          tournaments={availableTournaments.map(({ id, name, game }) => ({ id, name, game }))}
          selectedTournamentId={tournamentId}
        />
      ) : (
        <div className="max-w-xl rounded-xl border border-dashed p-8 text-center">
          <h2 className="font-semibold">Aucun tournoi disponible</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Créez d’abord un tournoi ou utilisez un tournoi sans projet Studio.
          </p>
          <Button asChild className="mt-5">
            <Link href="/dashboard/tournaments/new">Créer un tournoi</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
