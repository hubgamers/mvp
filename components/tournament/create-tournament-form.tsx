// components/tournaments/create-tournament-form.tsx
'use client'

import { useActionState } from "react"
import { createTournament } from "@/app/actions/tournament.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface CreateTournamentFormProps {
  structures?: { id: string; name: string }[]
}

export function CreateTournamentForm({ structures = [] }: CreateTournamentFormProps) {
  const [state, formAction, isPending] = useActionState(createTournament, null)

  return (
    <form action={formAction} className="space-y-8 max-w-2xl bg-card p-6 rounded-xl border shadow-sm">
      {state?.message && !state.success && (
        <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-md">
          {state.message}
        </div>
      )}

      {/* SECTION 1 : INFORMATIONS GÉNÉRALES */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">1. Informations Générales</h3>

        <div className="space-y-2">
          <Label htmlFor="name">Nom du tournoi *</Label>
          <Input id="name" name="name" placeholder="Ex: HubGamers Cup #1" required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="game">Jeu *</Label>
            <Input id="game" name="game" placeholder="Ex: Valorant / Rocket League" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="platform">Plateforme *</Label>
            <Select name="platform" defaultValue="PC">
              <SelectTrigger id="platform">
                <SelectValue placeholder="Sélectionner" />
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
        </div>

        {structures.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="organizer_structure_id">Structure Organisatrice (Optionnel)</Label>
            <Select name="organizer_structure_id">
              <SelectTrigger id="organizer_structure_id">
                <SelectValue placeholder="Sélectionner une de vos structures" />
              </SelectTrigger>
              <SelectContent>
                {structures.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" placeholder="Présentation générale du tournoi..." rows={3} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rules">Règlement du tournoi</Label>
          <Textarea id="rules" name="rules" placeholder="Format de carte, banlist, comportement..." rows={3} />
        </div>
      </div>

      {/* SECTION 2 : FORMAT & ÉQUIPES */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">2. Format & Équipes</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="min_teams">Équipes Min</Label>
            <Input id="min_teams" name="min_teams" type="number" defaultValue={2} min={2} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_teams">Équipes Max</Label>
            <Input id="max_teams" name="max_teams" type="number" placeholder="Ex: 16" min={2} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="team_size_min">Joueurs/Eq Min</Label>
            <Input id="team_size_min" name="team_size_min" type="number" placeholder="Ex: 5" min={1} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="team_size_max">Joueurs/Eq Max</Label>
            <Input id="team_size_max" name="team_size_max" type="number" placeholder="Ex: 7" min={1} />
          </div>
        </div>
      </div>

      {/* SECTION 3 : CALENDRIER & DATES */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">3. Dates & Calendrier</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="registration_opens_at">Ouverture Inscriptions</Label>
            <Input id="registration_opens_at" name="registration_opens_at" type="datetime-local" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="registration_closes_at">Fermeture Inscriptions</Label>
            <Input id="registration_closes_at" name="registration_closes_at" type="datetime-local" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="starts_at">Début du Tournoi</Label>
            <Input id="starts_at" name="starts_at" type="datetime-local" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ends_at">Fin du tournoi</Label>
            <Input id="ends_at" name="ends_at" type="datetime-local" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="check_in_opens_at">Ouverture du check-in</Label>
            <Input id="check_in_opens_at" name="check_in_opens_at" type="datetime-local" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timezone">Fuseau horaire</Label>
            <Input id="timezone" name="timezone" defaultValue="Europe/Paris" />
          </div>
        </div>
      </div>

      {/* SECTION 4 : CASHPOOL & VISIBILITÉ */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">4. Cashpool & Accès</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="prize_pool">Cashpool / Récompenses</Label>
            <Input id="prize_pool" name="prize_pool" type="number" step="0.01" placeholder="Ex: 500" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prize_currency">Devise</Label>
            <Select name="prize_currency" defaultValue="EUR">
              <SelectTrigger id="prize_currency">
                <SelectValue placeholder="Devise" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="is_public">Visibilité</Label>
            <Select name="is_public" defaultValue="true">
              <SelectTrigger id="is_public">
                <SelectValue placeholder="Visibilité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Public</SelectItem>
                <SelectItem value="false">Privé (sur invitation)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="is_free">Inscription</Label>
            <Select name="is_free" defaultValue="true">
              <SelectTrigger id="is_free">
                <SelectValue placeholder="Type d'inscription" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Gratuite</SelectItem>
                <SelectItem value="false">Payante</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="w-full size-lg">
        {isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
        Créer le tournoi
      </Button>
    </form>
  )
}