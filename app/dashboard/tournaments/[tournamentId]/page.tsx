// app/dashboard/tournaments/[id]/page.tsx
import { notFound } from "next/navigation"
import { getTournamentById } from "@/app/actions/tournament.actions"
import { getStudioProjectByTournamentId } from "@/app/actions/studio.actions"
import { TournamentDetailView } from "@/components/tournament/tournament-detail-view"

interface PageProps {
  params: Promise<{ tournamentId: string }>
}

export default async function TournamentDetailPage({ params }: PageProps) {
  const { tournamentId } = await params
  const tournament = await getTournamentById(tournamentId)

  console.log("tournament", tournamentId)

  if (!tournament) {
    notFound()
  }

  const studioProject = await getStudioProjectByTournamentId(tournament.id)

  return <TournamentDetailView tournament={{ ...tournament, studioProjectId: studioProject?.id ?? null }} />
}