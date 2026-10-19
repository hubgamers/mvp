// components/teams/add-member-form.tsx
'use client'

import { useActionState } from "react"
import { addMemberToTeam } from "@/app/actions/team.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, UserPlus } from "lucide-react"

interface AddMemberFormProps {
  teamId: string
  structureId: string
}

export function AddMemberForm({ teamId, structureId }: AddMemberFormProps) {
  const addMemberWithId = addMemberToTeam.bind(null, teamId, structureId)
  const [state, formAction, isPending] = useActionState(addMemberWithId, null)

  return (
    <form action={formAction} className="space-y-4 max-w-lg">
      {state?.message && (
        <div className={`p-3 text-sm rounded-md ${state.success ? 'text-green-600 bg-green-50 border border-green-200' : 'text-red-500 bg-red-50 border border-red-200'}`}>
          {state.message}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email du membre</Label>
        <Input id="email" name="email" type="email" placeholder="joueur@exemple.com" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Rôle dans l'équipe</Label>
        <Select name="role" defaultValue="PLAYER">
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CAPTAIN">Capitaine</SelectItem>
            <SelectItem value="MANAGER">Manager</SelectItem>
            <SelectItem value="PLAYER">Joueur</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        <UserPlus className="mr-2 h-4 w-4" /> Ajouter à l'équipe
      </Button>
    </form>
  )
}