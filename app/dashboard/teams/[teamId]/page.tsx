import { notFound } from "next/navigation"
import { getTeamById } from "@/app/actions/team.actions"
import { TeamDetailView } from "@/components/team/team-detail-view"

interface PageProps {
  params: Promise<{ teamId: string }>
}

export default async function TeamPage({ params }: PageProps) {
  const { teamId } = await params
  const team = await getTeamById(teamId)
  if (!team) notFound()

  return (
    <TeamDetailView
      team={team}
      structureId={team.structure?.id ?? ""}
      standalone
    />
  )
}
