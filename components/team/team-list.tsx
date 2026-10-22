import Link from "next/link"
import { TeamDetail } from "@/app/actions/team.actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gamepad2, Monitor, Users, Plus, ArrowRight, Shield } from "lucide-react"

interface TeamListProps {
  teams: TeamDetail[]
  structureId?: string
}

export function TeamList({ teams, structureId }: TeamListProps) {
  if (teams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/20 p-12 text-center animate-in fade-in-50">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
          <Users className="h-10 w-10" />
        </div>
        <h3 className="mt-5 text-xl font-black text-white uppercase tracking-tight">
          {structureId ? "Aucune équipe rattachée" : "Aucun roster actif"}
        </h3>
        <p className="mb-6 mt-2 max-w-sm text-sm text-muted-foreground leading-relaxed">
          {structureId
            ? "Créez une équipe au sein de cette structure pour inscrire vos joueurs aux tournois."
            : "Rejoignez ou composez vos rosters compétitifs pour démarrer la compétition."}
        </p>
        <Button size="lg" className="shadow-[0_0_20px_rgba(0,242,254,0.35)]" asChild>
          <Link href={structureId ? `/dashboard/structures/${structureId}` : "/dashboard/structures"}>
            {structureId ? "Retour à la structure" : "Gérer les structures"}
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {teams.map((team) => (
        <Card
          key={team.id}
          className="group flex flex-col justify-between border-white/[0.08] bg-card/75 backdrop-blur-md transition-all duration-300 hover:border-purple-500/40 hover:-translate-y-1 hover:shadow-[0_12px_35px_rgba(0,0,0,0.6)]"
        >
          <div className="h-1.5 w-full bg-gradient-to-r from-purple-500/30 via-indigo-500/20 to-transparent" />

          <CardHeader className="pb-3 pt-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-11 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center font-black text-purple-300 text-sm shadow-[0_0_12px_rgba(168,85,247,0.2)]">
                  {team.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base font-black text-white truncate">
                    {team.name}
                  </CardTitle>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {team.structure ? team.structure.name : "Roster indépendant"}
                  </p>
                </div>
              </div>
              {team.role && (
                <Badge variant="violet" className="shrink-0 text-[10px]">
                  {team.role}
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-3 text-xs text-muted-foreground pt-1 pb-4">
            <div className="flex items-center justify-between rounded-lg bg-black/40 px-3 py-2 border border-white/[0.05]">
              <div className="flex items-center gap-2">
                <Gamepad2 className="h-3.5 w-3.5 text-purple-400" />
                <span className="text-slate-300 font-semibold">{team.game}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Monitor className="h-3.5 w-3.5" />
                <span>{team.platform}</span>
              </div>
            </div>

            <div className="flex items-center justify-between px-1 text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Users className="size-3 text-brand-cyan" />
                {typeof team.memberCount === "number" ? `${team.memberCount} membre${team.memberCount > 1 ? "s" : ""}` : "Membres actifs"}
              </span>
              <span className="text-emerald-400 font-mono font-semibold">ÉLIGIBLE TOURNOIS</span>
            </div>
          </CardContent>

          <CardFooter className="pt-2 pb-4">
            <Button
              variant="outline"
              className="w-full text-xs font-bold uppercase tracking-wider group-hover:border-purple-500/40 group-hover:text-purple-300 transition-colors"
              asChild
            >
              <Link
                href={
                  structureId
                    ? `/dashboard/structures/${structureId}/teams/${team.id}`
                    : `/dashboard/teams/${team.id}`
                }
              >
                Gérer le Roster
                <ArrowRight className="size-3.5 ml-1.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
