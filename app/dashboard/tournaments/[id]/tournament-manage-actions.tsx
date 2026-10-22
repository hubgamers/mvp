"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { saveTournamentRegistration } from "@/app/actions/tournament-registration.actions"

interface TournamentManageActionsProps {
  tournamentId: string
  rosterId: string
  currentStatus: string
  checkedIn: boolean
}

export function TournamentManageActions({
  tournamentId,
  rosterId,
  currentStatus,
  checkedIn,
}: TournamentManageActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleUpdateStatus = async (statusCode: string) => {
    setLoading(true)
    try {
      await saveTournamentRegistration({
        tournament_id: tournamentId,
        roster_id: rosterId,
        status_code: statusCode,
        checked_in: checkedIn,
      })
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {currentStatus !== "ACCEPTED" && (
        <Button
          size="sm"
          disabled={loading}
          onClick={() => handleUpdateStatus("ACCEPTED")}
          className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
        >
          {loading ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3 mr-1" />}
          Valider
        </Button>
      )}

      {currentStatus !== "REFUSED" && (
        <Button
          size="sm"
          variant="outline"
          disabled={loading}
          onClick={() => handleUpdateStatus("REFUSED")}
          className="h-8 text-xs border-red-500/20 text-red-400 hover:bg-red-500/10"
        >
          {loading ? <Loader2 className="size-3 animate-spin" /> : <X className="size-3 mr-1" />}
          Refuser
        </Button>
      )}
    </div>
  )
}
