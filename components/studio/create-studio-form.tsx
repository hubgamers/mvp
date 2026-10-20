'use client'

import { useActionState } from "react"
import { createStudioProject } from "@/app/actions/studio.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface CreateStudioFormProps {
  tournaments: Array<{ id: string; name: string; game: string }>
  selectedTournamentId?: string
}

export function CreateStudioForm({ tournaments, selectedTournamentId }: CreateStudioFormProps) {
  const [state, formAction, isPending] = useActionState(createStudioProject, null)

  return (
    <form action={formAction} className="max-w-xl space-y-6 rounded-xl border bg-card p-6">
      {state?.message && (
        <div
          role="status"
          className={`rounded-md border p-3 text-sm ${
            state.success
              ? "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          {state.message}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="studio-name">Nom du projet</Label>
        <Input id="studio-name" name="name" placeholder="Ex. Arena Broadcast" maxLength={120} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="studio-tournament">Tournoi associé</Label>
        <Select name="tournament_id" defaultValue={selectedTournamentId}>
          <SelectTrigger id="studio-tournament" className="w-full">
            <SelectValue placeholder="Sélectionner un de vos tournois" />
          </SelectTrigger>
          <SelectContent>
            {tournaments.map((tournament) => (
              <SelectItem key={tournament.id} value={tournament.id}>
                {tournament.name} · {tournament.game}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground">
        Quatre scènes de départ seront créées : match, arbre, classement et compte à rebours.
      </p>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Créer le projet Studio
      </Button>
    </form>
  )
}
