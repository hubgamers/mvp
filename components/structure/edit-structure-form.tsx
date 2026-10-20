// components/structures/edit-structure-form.tsx
'use client'

import { useActionState } from "react"
import { updateStructure, Structure } from "@/app/actions/structure.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface EditStructureFormProps {
  structure: Structure
}

export function EditStructureForm({ structure }: EditStructureFormProps) {
  const updateStructureWithId = updateStructure.bind(null, structure.id)
  const [state, formAction, isPending] = useActionState(updateStructureWithId, null)

  return (
    <form action={formAction} className="space-y-6 max-w-xl">
      {state?.message && !state.success && (
        <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
          {state.message}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Nom de la structure</Label>
        <Input
          id="name"
          name="name"
          defaultValue={structure.name}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={structure.description ?? ""} rows={4} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="logo_url">URL du logo</Label>
          <Input id="logo_url" name="logo_url" type="url" defaultValue={structure.logo_url ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="banner_url">URL de la bannière</Label>
          <Input id="banner_url" name="banner_url" type="url" defaultValue={structure.banner_url ?? ""} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="website_url">Site web</Label>
          <Input id="website_url" name="website_url" type="url" defaultValue={structure.website_url ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="is_public">Visibilité</Label>
          <Select name="is_public" defaultValue={structure.is_public === false ? "false" : "true"}>
            <SelectTrigger id="is_public" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Publique</SelectItem>
              <SelectItem value="false">Privée</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Enregistrer les modifications
      </Button>
    </form>
  )
}