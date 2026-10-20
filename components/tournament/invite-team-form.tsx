'use client'

import { useState, useTransition, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { inviteTeamToTournament } from "@/app/actions/invitation.actions"
import { searchTeamsForTournament, type SearchedTeam } from "@/app/actions/team.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, Search, UserPlus } from "lucide-react"

interface InviteTeamFormProps {
  tournamentId: string
  existingRegistrations: Array<{ team: { id: string } }>
}

export default function InviteTeamForm({ tournamentId, existingRegistrations }: InviteTeamFormProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [teams, setTeams] = useState<SearchedTeam[]>([])
  const [selectedTeamId, setSelectedTeamId] = useState("")
  const [hasSearched, setHasSearched] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isSearching, startSearch] = useTransition()
  const excludedIds = existingRegistrations.map((registration) => registration.team.id)

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setTeams([])
    setSelectedTeamId("")
    setHasSearched(false)
    startSearch(async () => {
      try {
        const results = await searchTeamsForTournament(query, excludedIds, tournamentId)
        setTeams(results)
        setHasSearched(true)
      } catch {
        toast.error("La recherche d'équipes a échoué.")
      }
    })
  }

  function registerTeam() {
    if (!selectedTeamId) {
      toast.error("Sélectionnez une équipe avant de continuer.")
      return
    }
    startTransition(async () => {
      try {
        const result = await inviteTeamToTournament(tournamentId, selectedTeamId)
        if (!result.success) {
          toast.error(result.message)
          return
        }
        toast.success(result.message)
        setTeams((current) => current.filter((team) => team.id !== selectedTeamId))
        setSelectedTeamId("")
        router.refresh()
      } catch {
        toast.error("Impossible d'envoyer l'invitation pour le moment.")
      }
    })
  }

  return (
    <div className="space-y-4">
      <form onSubmit={search} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-2">
          <Label htmlFor="team-search">Rechercher une équipe publique</Label>
          <Input
            id="team-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nom d'équipe ou de structure"
            minLength={2}
          />
        </div>
        <Button type="submit" variant="outline" disabled={isSearching || query.trim().length < 2}>
          {isSearching ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Search className="mr-2 size-4" />}
          Rechercher
        </Button>
      </form>

      {teams.length > 0 && (
        <div className="space-y-3">
          <div className="space-y-2">
            {teams.map((team) => (
              <label
                key={team.id}
                className={`flex cursor-pointer items-center justify-between gap-4 rounded-lg border p-3 transition-colors ${
                  selectedTeamId === team.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                }`}
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">{team.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {[team.game, team.structureName].filter(Boolean).join(" · ")}
                  </span>
                </span>
                <input
                  type="radio"
                  name="team"
                  value={team.id}
                  checked={selectedTeamId === team.id}
                  onChange={() => setSelectedTeamId(team.id)}
                  className="size-4 accent-primary"
                />
              </label>
            ))}
          </div>
          <Button type="button" onClick={registerTeam} disabled={isPending || !selectedTeamId}>
            {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <UserPlus className="mr-2 size-4" />}
            Inviter le propriétaire de l’équipe
          </Button>
        </div>
      )}

      {hasSearched && teams.length === 0 && !isSearching && (
        <p className="text-sm text-muted-foreground">Aucune équipe correspondante trouvée.</p>
      )}
    </div>
  )
}
