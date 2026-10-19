// components/structures/create-structure-form.tsx
'use client'

import { useActionState } from "react"
import { createStructure } from "@/app/actions/structure.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

export function CreateStructureForm() {
  const [state, formAction, isPending] = useActionState(createStructure, null)

  return (
    <form action={formAction} className="space-y-6 max-w-xl">
      {state?.message && !state.success && (
        <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
          {state.message}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Nom de la structure / Club</Label>
        <Input
          id="name"
          name="name"
          placeholder="Ex: Team Vitality Fanbase"
          required
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Créer la structure
      </Button>
    </form>
  )
}