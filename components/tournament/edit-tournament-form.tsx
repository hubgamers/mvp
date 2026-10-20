// components/tournaments/edit-tournament-form.tsx
'use client'

import { useActionState } from "react"
import { updateTournament, TournamentDetail } from "@/app/actions/tournament.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface EditTournamentFormProps {
  tournament: TournamentDetail
}

export function EditTournamentForm({ tournament }: EditTournamentFormProps) {
  const updateTournamentWithId = updateTournament.bind(null, tournament.id)
  const [state, formAction, isPending] = useActionState(updateTournamentWithId, null)

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
          defaultValue={tournament.name}
          placeholder="Ex: HubGamers Cup #1"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="game">Jeu</Label>
        <Input
          id="game"
          name="game"
          defaultValue={tournament.game}
          placeholder="Ex: Rainbow Six Siege"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="platform">Plateforme</Label>
        <Select name="platform" defaultValue={tournament.platform}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner une plateforme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PC">PC</SelectItem>
            <SelectItem value="PLAYSTATION">PlayStation</SelectItem>
            <SelectItem value="XBOX">Xbox</SelectItem>
            <SelectItem value="SWITCH">Nintendo Switch</SelectItem>
            <SelectItem value="MOBILE">Mobile</SelectItem>
            <SelectItem value="CROSS_PLATFORM">Cross-Platform</SelectItem>
            <SelectItem value="OTHER">Autre</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Statut du tournoi</Label>
        <Select name="status" defaultValue={tournament.status}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner le statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DRAFT">Brouillon (DRAFT)</SelectItem>
            <SelectItem value="REGISTRATION_OPEN">Inscriptions ouvertes</SelectItem>
            <SelectItem value="REGISTRATION_CLOSED">Inscriptions closes</SelectItem>
            <SelectItem value="CHECK_IN">Check-in</SelectItem>
            <SelectItem value="IN_PROGRESS">En cours</SelectItem>
            <SelectItem value="COMPLETED">Terminé</SelectItem>
            <SelectItem value="CANCELLED">Annulé</SelectItem>
            <SelectItem value="ARCHIVED">Archivé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Enregistrer les modifications
      </Button>
    </form>
  )
}