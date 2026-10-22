import Link from "next/link"
import { Clapperboard, Gamepad2, Layers3, Plus, ArrowRight, Tv, Radio } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface StudioProject {
  id: string
  name: string
  tournaments: { name: string; game: string; starts_at?: Date | null }
  studio_scenes: Array<{ id: string; name: string; is_enabled: boolean }>
}

export function StudioProjectList({ projects }: { projects: StudioProject[] }) {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-white/10 bg-black/20 px-6 py-14 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
          <Clapperboard className="size-8" />
        </div>
        <h2 className="mt-5 text-xl font-black text-white uppercase tracking-tight">
          Aucun projet Studio configuré
        </h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">
          Associez un projet de régie à l’un de vos tournois pour générer automatiquement les scènes OBS synchronisées avec les scores en direct.
        </p>
        <Button asChild size="lg" className="mt-6 shadow-[0_0_20px_rgba(0,242,254,0.35)]">
          <Link href="/dashboard/studio/new">
            <Plus className="mr-2 size-4" />
            Créer un projet Studio
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => (
        <Card
          key={project.id}
          className="group flex flex-col justify-between border-white/[0.08] bg-card/75 backdrop-blur-md transition-all duration-300 hover:border-purple-500/40 hover:-translate-y-1 hover:shadow-[0_12px_35px_rgba(0,0,0,0.6)]"
        >
          <div className="h-1.5 w-full bg-gradient-to-r from-purple-500/30 via-pink-500/20 to-transparent" />

          <CardHeader className="pb-3 pt-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center font-bold text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.2)]">
                  <Tv className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base font-black text-white truncate">
                    {project.name}
                  </CardTitle>
                  <p className="text-[11px] text-muted-foreground truncate">
                    OBS Browser Source Ready
                  </p>
                </div>
              </div>
              <Badge variant="violet" className="shrink-0 text-[10px]">
                1080P60
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-3 text-xs text-muted-foreground pt-1 pb-4">
            <div className="rounded-lg bg-black/40 p-3 border border-white/[0.05] space-y-2">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5 font-medium">
                  <Gamepad2 className="size-3.5 text-brand-cyan" />
                  {project.tournaments.game}
                </span>
                <span className="truncate max-w-[130px] text-muted-foreground font-mono text-[11px]">
                  {project.tournaments.name}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Layers3 className="size-3.5 text-purple-400" />
                  Scènes activées
                </span>
                <span className="font-mono text-emerald-400 font-bold">
                  {project.studio_scenes.filter((scene) => scene.is_enabled).length} actives
                </span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="pt-2 pb-4">
            <Button
              asChild
              variant="outline"
              className="w-full text-xs font-bold uppercase tracking-wider group-hover:border-purple-500/40 group-hover:text-purple-300 transition-colors"
            >
              <Link href={`/dashboard/studio/${project.id}`}>
                Ouvrir la régie
                <ArrowRight className="size-3.5 ml-1.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
