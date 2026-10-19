// components/tournaments/create-tournament-form.tsx
'use client'

import { useActionState } from "react"
import { createTournament } from "@/app/actions/tournament.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

export function CreateTournamentForm() {
  const [state, formAction, isPending] = useActionState(createTournament, null)

  return (
    <form action={formAction} className="space-y-6 max-w-xl">
      {state?.message && !state.success && (
        <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
          {state.message}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Nom du tournoi</Label>
        <Input
          id="name"
          name="name"
          placeholder="Ex: HubGamers Cup #1"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="game">Jeu</Label>
        <Input
          id="game"
          name="game"
          placeholder="Ex: Rainbow Six Siege"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="platform">Plateforme</Label>
        <Select name="platform" defaultValue="PC">
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner une plateforme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PC">PC</SelectItem>
            <SelectItem value="PLAYSTATION">PlayStation 5</SelectItem>
            <SelectItem value="XBOX">Xbox Series X/S</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Créer le tournoi
      </Button>
    </form>
  )
}