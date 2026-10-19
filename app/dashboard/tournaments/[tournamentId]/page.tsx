// app/dashboard/tournaments/[id]/page.tsx
import { notFound } from "next/navigation"
import { getTournamentById } from "@/app/actions/tournament.actions"
import { TournamentDetailView } from "@/components/tournament/tournament-detail-view"

interface PageProps {
  params: Promise<{ tournamentId: string }>
}

export default async function TournamentDetailPage({ params }: PageProps) {
  const { tournamentId } = await params
  const tournament = await getTournamentById(tournamentId)

  if (!tournament) {
    notFound()
  }

  return <TournamentDetailView tournament={tournament} />
}