"use client"

import { useActionState } from "react"
import { UserPlus } from "lucide-react"
import { inviteTournamentStaff } from "@/app/actions/invitation.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function InviteTournamentStaffForm({ tournamentId }: { tournamentId: string }) {
  const inviteAction = inviteTournamentStaff.bind(null, tournamentId)
  const [state, formAction, isPending] = useActionState(inviteAction, null)

  return (
    <form action={formAction} className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          type="email"
          name="email"
          placeholder="email@exemple.com"
          aria-label="Adresse e-mail du membre à inviter"
          required
          className="flex-1"
        />
        <select
          name="role"
          defaultValue="ARBITRE"
          aria-label="Rôle du membre"
          className="h-10 rounded-md border bg-background px-3 text-sm"
        >
          <option value="ADMIN">Administrateur</option>
          <option value="ARBITRE">Arbitre</option>
        </select>
        <Button type="submit" disabled={isPending}>
          <UserPlus className="mr-2 h-4 w-4" />
          {isPending ? "Envoi…" : "Inviter"}
        </Button>
      </div>
      {state?.message && (
        <p className={`text-sm ${state.success ? "text-green-600" : "text-red-500"}`} role="status">
          {state.message}
        </p>
      )}
    </form>
  )
}
