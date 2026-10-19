// components/structures/edit-structure-form.tsx
'use client'

import { useActionState } from "react"
import { updateStructure, Structure } from "@/app/actions/structure.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Enregistrer les modifications
      </Button>
    </form>
  )
}