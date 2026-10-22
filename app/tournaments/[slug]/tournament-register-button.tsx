"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Users, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { saveTournamentRegistration } from "@/app/actions/tournament-registration.actions"

interface TournamentRegisterButtonProps {
  tournamentId: string
  isLoggedIn: boolean
  userRosters: any[]
  isFull: boolean
}

export function TournamentRegisterButton({
  tournamentId,
  isLoggedIn,
  userRosters,
  isFull,
}: TournamentRegisterButtonProps) {
  const router = useRouter()
  const [selectedRosterId, setSelectedRosterId] = useState(
    userRosters.length > 0 ? userRosters[0].id : ""
  )
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null)

  if (!isLoggedIn) {
    return (
      <Button asChild className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs">
        <Link href="/login">Se connecter pour inscrire son équipe</Link>
      </Button>
    )
  }

  if (isFull) {
    return (
      <Button disabled className="w-full text-xs bg-white/10 text-muted-foreground">
        Tournoi complet
      </Button>
    )
  }

  if (userRosters.length === 0) {
    return (
      <div className="space-y-2 text-center">
        <p className="text-xs text-muted-foreground">
          Vous devez être capitaine d'une lineup pour l'inscrire.
        </p>
        <Button asChild size="sm" variant="outline" className="w-full text-xs">
          <Link href="/dashboard/teams/new">Créer une lineup</Link>
        </Button>
      </div>
    )
  }

  // Vérifier si le roster sélectionné est déjà inscrit
  const currentRoster = userRosters.find((r) => r.id === selectedRosterId)
  const isAlreadyRegistered = currentRoster?.tournaments_registrations?.length > 0

  const handleRegister = async () => {
    if (!selectedRosterId) return
    setLoading(true)
    setMessage(null)

    try {
      const res = await saveTournamentRegistration({
        tournament_id: tournamentId,
        roster_id: selectedRosterId,
        status_code: "ACCEPTED",
        checked_in: false,
      })

      if (res.success) {
        setMessage({ text: "Inscription validée avec succès !", error: false })
        router.refresh()
      } else {
        setMessage({ text: res.message, error: true })
      }
    } catch (err: any) {
      setMessage({ text: err.message || "Erreur lors de l'inscription.", error: true })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <label className="text-[11px] font-semibold text-slate-400">Choisir votre équipe :</label>
        <select
          value={selectedRosterId}
          onChange={(e) => setSelectedRosterId(e.target.value)}
          className="w-full h-9 px-3 rounded-md bg-black/50 border border-white/10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
        >
          {userRosters.map((roster) => (
            <option key={roster.id} value={roster.id}>
              {roster.name} ({roster.game || "Lineup"})
            </option>
          ))}
        </select>
      </div>

      {isAlreadyRegistered ? (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>Cette équipe est déjà inscrite à la compétition.</span>
        </div>
      ) : (
        <Button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg"
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            `Inscrire ${currentRoster?.name || "mon équipe"}`
          )}
        </Button>
      )}

      {message && (
        <p className={`text-xs ${message.error ? "text-red-400" : "text-emerald-400"}`}>
          {message.text}
        </p>
      )}
    </div>
  )
}
