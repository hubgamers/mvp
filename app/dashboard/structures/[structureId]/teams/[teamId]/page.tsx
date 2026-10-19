// app/dashboard/structures/[structureId]/teams/[teamId]/page.tsx
import { notFound } from "next/navigation"
import { getTeamById } from "@/app/actions/team.actions"
import { TeamDetailView } from "@/components/team/team-detail-view";

interface PageProps {
  params: Promise<{ structureId: string; teamId: string }>
}

export default async function TeamDetailPage({ params }: PageProps) {
  const { structureId, teamId } = await params
  const team = await getTeamById(teamId, structureId)

  if (!team) {
    notFound()
  }

  return <TeamDetailView team={team} structureId={structureId} />
}