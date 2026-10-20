import Link from "next/link"
import { Clapperboard, Gamepad2, Layers3, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface StudioProject {
  id: string
  name: string
  tournaments: { name: string; game: string; starts_at?: Date | null }
  studio_scenes: Array<{ id: string; name: string; is_enabled: boolean }>
}

export function StudioProjectList({ projects }: { projects: StudioProject[] }) {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed px-6 py-14 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted">
          <Clapperboard className="size-8 text-muted-foreground" />
        </div>
        <h2 className="mt-5 text-lg font-semibold">Aucun projet Studio pour le moment</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Associez un projet à l’un de vos tournois pour préparer ses scènes de diffusion.
        </p>
        <Button asChild className="mt-5">
          <Link href="/dashboard/studio/new">
            <Plus className="mr-2 size-4" />
            Nouveau projet
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => (
        <Card key={project.id} className="transition-colors hover:border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clapperboard className="size-5 text-primary" />
              <span className="truncate">{project.name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <Gamepad2 className="size-4 text-primary" />
              {project.tournaments.name} · {project.tournaments.game}
            </p>
            <p className="flex items-center gap-2">
              <Layers3 className="size-4" />
              {project.studio_scenes.filter((scene) => scene.is_enabled).length} scènes actives
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href={`/dashboard/studio/${project.id}`}>Gérer le studio</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
