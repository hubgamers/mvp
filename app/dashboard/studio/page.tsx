import Link from "next/link"
import { getMyStudioProjects } from "@/app/actions/studio.actions"
import { StudioProjectList } from "@/components/studio/studio-project-list"
import { Button } from "@/components/ui/button"
import { Clapperboard, Plus, Tv, Globe } from "lucide-react"

export default async function StudioPage() {
  const projects = await getMyStudioProjects()

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Tv className="size-5 text-purple-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-purple-400">
              RÉGIE BROADCAST & OVERLAYS OBS
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase">
            Studio Live
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configurez les overlays graphiques temps réel pour vos streams Twitch et diffusions de tournois.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button size="sm" variant="cyber" className="shadow-[0_0_20px_rgba(168,85,247,0.35)]" asChild>
            <Link href="/dashboard/studio/new">
              <Plus className="mr-2 size-4" />
              Nouveau projet Studio
            </Link>
          </Button>
        </div>
      </div>

      <StudioProjectList projects={projects} />
    </div>
  )
}
