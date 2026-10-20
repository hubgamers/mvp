// components/structures/create-team-form.tsx
'use client'

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus } from "lucide-react"
import { createTeamForStructure } from "@/app/actions/team.actions"

interface CreateTeamFormProps {
  structureId: string
}

export function CreateTeamForm({ structureId }: CreateTeamFormProps) {
  const createTeamWithId = createTeamForStructure.bind(null, structureId)
  const [state, formAction, isPending] = useActionState(createTeamWithId, null)

  return (
    <form action={formAction} className="space-y-4 max-w-lg">
      {state?.message && (
        <div className={`p-3 text-sm rounded-md ${state.success ? 'text-green-600 bg-green-50 border border-green-200' : 'text-red-500 bg-red-50 border border-red-200'}`}>
          {state.message}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Nom de l'équipe</Label>
        <Input id="name" name="name" placeholder="Ex: Vitality R6 Squad" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optionnel)</Label>
        <Textarea id="description" name="description" placeholder="Présentez votre équipe." rows={3} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="is_public">Visibilité</Label>
        <Select name="is_public" defaultValue="true">
          <SelectTrigger id="is_public">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Publique</SelectItem>
            <SelectItem value="false">Privée</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="game">Jeu principal</Label>
        <Input id="game" name="game" placeholder="Ex: Rainbow Six Siege" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="platform">Plateforme</Label>
        <Select name="platform" defaultValue="PC">
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

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        <Plus className="mr-2 h-4 w-4" /> Ajouter l'équipe à la structure
      </Button>
    </form>
  )
}