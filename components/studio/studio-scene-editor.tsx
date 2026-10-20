'use client'

import { useState, useTransition } from "react"
import { updateStudioSceneLayout } from "@/app/actions/studio.actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Save } from "lucide-react"

interface StudioScene {
  id: string
  name: string
  scene_type: string
  is_enabled: boolean
  is_default: boolean
  layout: unknown
}

export function StudioSceneEditor({ scenes }: { scenes: StudioScene[] }) {
  const [layouts, setLayouts] = useState<Record<string, string>>(() =>
    Object.fromEntries(scenes.map((scene) => [scene.id, JSON.stringify(scene.layout, null, 2)]))
  )
  const [pendingScene, setPendingScene] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function saveScene(sceneId: string) {
    let layout: unknown
    try {
      layout = JSON.parse(layouts[sceneId] ?? "")
    } catch {
      toast.error("Le JSON de cette scène est invalide.")
      return
    }

    if (!layout || typeof layout !== "object" || Array.isArray(layout)) {
      toast.error("La configuration doit être un objet JSON.")
      return
    }

    setPendingScene(sceneId)
    startTransition(async () => {
      try {
        const result = await updateStudioSceneLayout(sceneId, layout)
        if (result.success) toast.success(result.message)
        else toast.error(result.message)
      } catch {
        toast.error("Impossible d'enregistrer cette scène pour le moment.")
      } finally {
        setPendingScene(null)
      }
    })
  }

  if (scenes.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Ce projet ne contient encore aucune scène.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      {scenes.map((scene) => (
        <Card key={scene.id}>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <CardTitle>{scene.name}</CardTitle>
                <CardDescription>{scene.scene_type.replaceAll("_", " ")}</CardDescription>
              </div>
              <div className="flex gap-2">
                {scene.is_default && <Badge>Par défaut</Badge>}
                <Badge variant={scene.is_enabled ? "secondary" : "outline"}>
                  {scene.is_enabled ? "Active" : "Désactivée"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              aria-label={`Configuration JSON de ${scene.name}`}
              className="min-h-48 resize-y font-mono text-xs"
              spellCheck={false}
              value={layouts[scene.id] ?? ""}
              onChange={(event) => setLayouts((current) => ({
                ...current,
                [scene.id]: event.target.value,
              }))}
            />
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => saveScene(scene.id)}
            >
              <Save className="mr-2 size-4" />
              {isPending && pendingScene === scene.id ? "Enregistrement…" : "Enregistrer la scène"}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
