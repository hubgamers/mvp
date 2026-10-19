// components/structures/add-structure-member-form.tsx
'use client'

import { useActionState } from "react"
import { inviteMemberToStructure } from "@/app/actions/structure.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserPlus } from "lucide-react"

interface AddStructureMemberFormProps {
  structureId: string
}

export function AddStructureMemberForm({ structureId }: AddStructureMemberFormProps) {
  const inviteAction = inviteMemberToStructure.bind(null, structureId)
  const [state, formAction, isPending] = useActionState(inviteAction, null)

  return (
    <form action={formAction} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          type="email"
          name="email"
          placeholder="email@exemple.com"
          required
          className="flex-1"
        />
        <select
          name="role"
          defaultValue="USER"
          className="h-10 border rounded-md px-3 text-sm bg-background"
        >
          <option value="USER">Membre</option>
          <option value="ADMIN">Administrateur</option>
        </select>
        <Button type="submit" disabled={isPending}>
          <UserPlus className="mr-2 h-4 w-4" />
          {isPending ? "Envoi..." : "Inviter"}
        </Button>
      </div>

      {state?.message && (
        <p className={`text-sm ${state.success ? 'text-green-600' : 'text-red-500'}`}>
          {state.message}
        </p>
      )}
    </form>
  )
}