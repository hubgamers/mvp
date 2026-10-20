import { getPublicStudioProjects } from "@/app/actions/studio.actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Clapperboard, Gamepad2, Layers3 } from "lucide-react"

export default async function ExploreStudioPage() {
  const projects = await getPublicStudioProjects()

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Studios partagés</h1>
        <p className="text-sm text-muted-foreground">
          Découvrez les projets Studio qui proposent des scènes publiques.
        </p>
      </div>
      <Separator />
      {projects.length ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clapperboard className="size-5 text-primary" />
                  {project.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Gamepad2 className="size-4 text-primary" />
                  {project.tournaments.name} · {project.tournaments.game}
                </p>
                <p className="flex items-center gap-2">
                  <Layers3 className="size-4" />
                  {project.studio_scenes.length} scènes
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.studio_scenes.map((scene) => (
                    <Badge key={scene.id} variant="outline">{scene.scene_type}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed p-12 text-center text-sm text-muted-foreground">
          Aucun studio public pour le moment.
        </div>
      )}
    </div>
  )
}
