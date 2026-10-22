import Link from "next/link"
import { TournamentDetail } from "@/app/actions/tournament.actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Gamepad2, Monitor, Calendar, Plus, Trophy, Users, ArrowRight, Flame } from "lucide-react"

interface TournamentListProps {
  tournaments: TournamentDetail[]
}

const statusMap: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" | "live" | "cyber" | "warning" | "success" }
> = {
  DRAFT: { label: "Brouillon", variant: "outline" },
  REGISTRATION_OPEN: { label: "Inscriptions ouvertes", variant: "cyber" },
  REGISTRATION_CLOSED: { label: "Inscriptions closes", variant: "secondary" },
  CHECK_IN: { label: "Check-in en cours", variant: "warning" },
  IN_PROGRESS: { label: "En direct", variant: "live" },
  COMPLETED: { label: "Terminé", variant: "outline" },
  CANCELLED: { label: "Annulé", variant: "destructive" },
  ARCHIVED: { label: "Archivé", variant: "outline" },
}

const gameAccents: Record<string, { gradient: string; border: string; text: string }> = {
  valorant: {
    gradient: "from-red-500/20 via-pink-500/10 to-transparent",
    border: "group-hover:border-red-500/40",
    text: "text-red-400",
  },
  "league of legends": {
    gradient: "from-blue-500/20 via-cyan-500/10 to-transparent",
    border: "group-hover:border-blue-500/40",
    text: "text-blue-400",
  },
  cs2: {
    gradient: "from-amber-500/20 via-orange-500/10 to-transparent",
    border: "group-hover:border-amber-500/40",
    text: "text-amber-400",
  },
  "counter-strike": {
    gradient: "from-amber-500/20 via-orange-500/10 to-transparent",
    border: "group-hover:border-amber-500/40",
    text: "text-amber-400",
  },
  "rocket league": {
    gradient: "from-cyan-500/20 via-blue-500/10 to-transparent",
    border: "group-hover:border-cyan-500/40",
    text: "text-cyan-400",
  },
}

function getGameStyle(game: string) {
  const normalized = game.toLowerCase()
  for (const key of Object.keys(gameAccents)) {
    if (normalized.includes(key)) {
      return gameAccents[key]
    }
  }
  return {
    gradient: "from-brand-cyan/15 via-blue-500/10 to-transparent",
    border: "group-hover:border-brand-cyan/40",
    text: "text-brand-cyan",
  }
}

export function TournamentList({ tournaments }: TournamentListProps) {
  if (tournaments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/20 p-12 text-center animate-in fade-in-50">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-cyan/20 to-blue-600/20 border border-brand-cyan/30 text-brand-cyan shadow-[0_0_25px_rgba(0,242,254,0.2)]">
          <Trophy className="h-10 w-10" />
        </div>
        <h3 className="mt-5 text-xl font-black text-white uppercase tracking-tight">
          Aucun tournoi actif
        </h3>
        <p className="mb-6 mt-2 max-w-sm text-sm text-muted-foreground leading-relaxed">
          Vous n'avez pas encore créé de compétition esport. Lancez votre premier bracket en quelques clics.
        </p>
        <Button size="lg" className="shadow-[0_0_20px_rgba(0,242,254,0.35)]" asChild>
          <Link href="/dashboard/tournaments/new">
            <Plus className="mr-2 h-4 w-4" />
            Créer un tournoi
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {tournaments.map((tournament) => {
        const statusConfig = statusMap[tournament.status] || {
          label: tournament.status,
          variant: "outline" as const,
        }
        const gameStyle = getGameStyle(tournament.game)

        return (
          <Card
            key={tournament.id}
            className={`group flex flex-col justify-between border-white/[0.08] bg-card/75 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_35px_rgba(0,0,0,0.6)] ${gameStyle.border}`}
          >
            {/* Top decorative gradient bar */}
            <div className={`h-1.5 w-full bg-gradient-to-r ${gameStyle.gradient} to-transparent`} />

            <CardHeader className="pb-3 pt-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    <Gamepad2 className={`h-3.5 w-3.5 ${gameStyle.text}`} />
                    <span className="truncate">{tournament.game}</span>
                  </div>
                  <CardTitle className="text-lg font-black tracking-tight text-white truncate">
                    {tournament.name}
                  </CardTitle>
                </div>
                <Badge variant={statusConfig.variant} className="shrink-0 text-[10px]">
                  {statusConfig.label}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 text-xs text-muted-foreground pt-1 pb-4">
              <div className="flex items-center justify-between rounded-lg bg-black/40 px-3 py-2 border border-white/[0.05]">
                <div className="flex items-center gap-2">
                  <Monitor className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-slate-300 font-medium">{tournament.platform}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    {tournament.starts_at
                      ? new Date(tournament.starts_at).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                        })
                      : "Date TBD"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] px-1 text-muted-foreground">
                <span>Créé le {new Date(tournament.created_at).toLocaleDateString("fr-FR")}</span>
                <span className="text-brand-cyan font-semibold flex items-center gap-1">
                  <Flame className="size-3" /> Arbre auto
                </span>
              </div>
            </CardContent>

            <CardFooter className="pt-2 pb-4">
              <Button
                variant="outline"
                className="w-full text-xs font-bold uppercase tracking-wider group-hover:border-brand-cyan/40 group-hover:text-brand-cyan transition-colors"
                asChild
              >
                <Link href={`/dashboard/tournaments/${tournament.id}`}>
                  Gérer la compétition
                  <ArrowRight className="size-3.5 ml-1.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
