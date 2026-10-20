// components/teams/team-list.tsx
import Link from "next/link"
import { TeamDetail } from "@/app/actions/team.actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gamepad2, Monitor, Users, Plus } from "lucide-react"

interface TeamListProps {
  teams: TeamDetail[]
  structureId?: string
}

export function TeamList({ teams, structureId }: TeamListProps) {
  if (teams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center animate-in fade-in-50">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <Users className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">{structureId ? "Aucune équipe rattachée" : "Aucune équipe"}</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          {structureId
            ? "Créez une équipe depuis la page principale de la structure pour commencer."
            : "Vous rejoindrez vos équipes dès qu'une structure vous aura invité."}
        </p>
        <Button asChild>
          <Link href={structureId ? `/dashboard/structures/${structureId}` : "/dashboard/structures"}>
            {structureId ? "Retour à la structure" : "Voir mes structures"}
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {teams.map((team) => (
        <Card key={team.id} className="flex flex-col justify-between hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-lg font-bold truncate">{team.name}</CardTitle>
              {team.role && <Badge variant="secondary">{team.role}</Badge>}
            </div>
          </CardHeader>

          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Gamepad2 className="h-4 w-4 text-primary" />
              <span>Jeu : {team.game}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Monitor className="h-3.5 w-3.5" />
              <span>Plateforme : {team.platform}</span>
            </div>
            {typeof team.memberCount === "number" && (
              <div className="flex items-center gap-2 text-xs">
                <Users className="h-3.5 w-3.5" />
                <span>{team.memberCount} membre{team.memberCount === 1 ? "" : "s"}</span>
              </div>
            )}
            {team.structure && (
              <div className="text-xs">Structure : {team.structure.name}</div>
            )}
          </CardContent>

          <CardFooter className="pt-2">
            <Button variant="outline" className="w-full" asChild>
              <Link href={structureId
                ? `/dashboard/structures/${structureId}/teams/${team.id}`
                : `/dashboard/teams/${team.id}`}>
                Voir l'équipe
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}