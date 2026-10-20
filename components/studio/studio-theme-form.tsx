'use client'

import { useActionState } from "react"
import { updateStudioProjectTheme } from "@/app/actions/studio.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Palette } from "lucide-react"

interface StudioTheme {
  primary: string
  secondary: string
  background: string
}

export function StudioThemeForm({
  projectId,
  theme,
}: {
  projectId: string
  theme: StudioTheme
}) {
  const updateTheme = updateStudioProjectTheme.bind(null, projectId)
  const [state, formAction, isPending] = useActionState(updateTheme, null)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="size-5 text-primary" />
          Identité visuelle
        </CardTitle>
        <CardDescription>Définissez les couleurs de base du projet Studio.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            {([
              ["primary", "Couleur principale"],
              ["secondary", "Couleur secondaire"],
              ["background", "Arrière-plan"],
            ] as const).map(([name, label]) => (
              <div key={name} className="space-y-2">
                <Label htmlFor={`${name}-${projectId}`}>{label}</Label>
                <Input
                  id={`${name}-${projectId}`}
                  name={name}
                  type="color"
                  defaultValue={theme[name]}
                  className="h-10 cursor-pointer p-1"
                  required
                />
              </div>
            ))}
          </div>
          {state?.message && (
            <p role="status" className={`text-sm ${state.success ? "text-green-600" : "text-destructive"}`}>
              {state.message}
            </p>
          )}
          <Button type="submit" variant="outline" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Enregistrer le thème
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
