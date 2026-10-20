import { getMyTeams } from "@/app/actions/team.actions"
import { TeamList } from "@/components/team/team-list"
import { Separator } from "@/components/ui/separator"

export default async function TeamsPage() {
  const teams = await getMyTeams()

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mes équipes</h1>
        <p className="text-sm text-muted-foreground">
          Retrouvez les équipes que vous gérez ou que vous avez rejointes.
        </p>
      </div>
      <Separator />
      <TeamList teams={teams} />
    </div>
  )
}
