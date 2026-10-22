import Link from "next/link"
import { getMyTeams } from "@/app/actions/team.actions"
import { TeamList } from "@/components/team/team-list"
import { Button } from "@/components/ui/button"
import { UsersRound, Building2, Plus } from "lucide-react"

export default async function TeamsPage() {
  const teams = await getMyTeams()

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <UsersRound className="size-5 text-purple-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-purple-400">
              ROSTERS & COMPÉTITEURS
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase">
            Mes Équipes
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Retrouvez les équipes dont vous êtes manager, capitaine ou joueur titulaire.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/structures">
              <Building2 className="mr-2 size-4 text-emerald-400" />
              Mes structures
            </Link>
          </Button>
        </div>
      </div>

      <TeamList teams={teams} />
    </div>
  )
}
