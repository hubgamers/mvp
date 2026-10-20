import Link from "next/link"
import { notFound } from "next/navigation"
import { getStudioProjectById } from "@/app/actions/studio.actions"
import { StudioSceneEditor } from "@/components/studio/studio-scene-editor"
import { StudioThemeForm } from "@/components/studio/studio-theme-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Gamepad2 } from "lucide-react"

interface PageProps {
  params: Promise<{ projectId: string }>
}

export default async function StudioProjectPage({ params }: PageProps) {
  const { projectId } = await params
  const project = await getStudioProjectById(projectId)
  if (!project) notFound()

  const rawTheme = project.theme
  const themeObject: Record<string, unknown> = rawTheme && typeof rawTheme === "object" && !Array.isArray(rawTheme)
    ? rawTheme as Record<string, unknown>
    : {}
  const theme = {
    primary: typeof themeObject.primary === "string" ? themeObject.primary : "#CCFF00",
    secondary: typeof themeObject.secondary === "string" ? themeObject.secondary : "#1E293B",
    background: typeof themeObject.background === "string" ? themeObject.background : "#0F172A",
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2">
          <Link href="/dashboard/studio">
            <ArrowLeft className="mr-2 size-4" />
            Retour aux projets Studio
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
          <Badge variant="secondary">Studio de tournoi</Badge>
        </div>
        <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Gamepad2 className="size-4" />
          {project.tournaments.name} · {project.tournaments.game}
        </p>
      </div>
      <Separator />
      <StudioThemeForm projectId={project.id} theme={theme} />
      <div>
        <h2 className="mb-4 text-lg font-semibold">Scènes de diffusion</h2>
        <StudioSceneEditor scenes={project.studio_scenes} />
      </div>
    </div>
  )
}
