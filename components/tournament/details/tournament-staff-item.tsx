// components/tournament-staff-item.tsx
"use client"

import { useState, useTransition } from "react"
import { Badge } from "@/components/ui/badge"
import { updateTournamentStaffRole } from "@/app/actions/tournament.actions"

export function TournamentStaffItem({
  tournamentId,
  member,
  canManageStaff,
}: {
  tournamentId: string
  member: { userId: string; name: string; role: string }
  canManageStaff: boolean
}) {
  const [role, setRole] = useState(member.role)
  const [isPending, startTransition] = useTransition()

  const handleRoleChange = (newRole: string) => {
    startTransition(async () => {
      const result = await updateTournamentStaffRole(tournamentId, member.userId, newRole as "ADMIN" | "ARBITRE")
      if (result.success) {
        setRole(newRole)
      } else {
        alert(result.message)
      }
    })
  }

  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <span className="font-medium">{member.name}</span>
      {canManageStaff ? (
        <select
          value={role}
          onChange={(e) => handleRoleChange(e.target.value)}
          disabled={isPending}
          aria-label={`Rôle de ${member.name}`}
          className="h-8 rounded-md border bg-background px-2 text-xs font-medium disabled:opacity-50"
        >
          <option value="ADMIN">Administrateur</option>
          <option value="ARBITRE">Arbitre</option>
        </select>
      ) : (
        <Badge variant="outline">{role === "ADMIN" ? "Administrateur" : "Arbitre"}</Badge>
      )}
    </div>
  )
}