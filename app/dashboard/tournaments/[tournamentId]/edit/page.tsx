// app/dashboard/tournaments/[id]/edit/page.tsx
import { notFound } from "next/navigation"
import Link from "next/link"
import { getTournamentById } from "@/app/actions/tournament.actions"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft } from "lucide-react"
import { EditTournamentForm } from "@/components/edit-tournament-form"

interface PageProps {
  params: Promise<{ tournamentId: string }>
}

export default async function EditTournamentPage({ params }: PageProps) {
  const { tournamentId } = await params
  const tournament = await getTournamentById(tournamentId)

  if (!tournament) {
    notFound()
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2">
          <Link href={`/dashboard/tournaments/${tournament.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au tournoi
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Modifier le tournoi</h1>
        <p className="text-sm text-muted-foreground">
          Mettez à jour les paramètres généraux et le statut du tournoi {tournament.name}.
        </p>
      </div>

      <Separator />

      <EditTournamentForm tournament={tournament} />
    </div>
  )
}