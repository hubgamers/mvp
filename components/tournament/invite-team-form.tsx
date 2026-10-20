// components/tournaments/invite-team-form.tsx
"use client"

import { useActionState, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserPlus, Send, Mail, Shield, Loader2, Search, Building2 } from "lucide-react"
import { toast } from "sonner"
import { addTeamToTournament, inviteTeamToTournament, inviteTeamByEmail } from "@/app/actions/tournament.actions"
import { searchTeamsForTournament, SearchedTeam } from "@/app/actions/team.actions"

interface Registration {
  team_id?: string
  team?: {
    id: string
  }
}

interface InviteTeamFormProps {
  tournamentId: string
  existingRegistrations?: Registration[]
}

export function InviteTeamForm({
  tournamentId,
  existingRegistrations = [],
}: InviteTeamFormProps) {
  const [selectedTeamId, setSelectedTeamId] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [searchResults, setSearchResults] = useState<SearchedTeam[]>([])
  const [isSearching, setIsSearching] = useState<boolean>(false)

  // Extraire la liste des IDs déjà inscrits ou invités
  const existingTeamIds = existingRegistrations
    .map((reg) => reg.team_id || reg.team?.id)
    .filter(Boolean) as string[]

  // Recherche dynamique déclenchée à la saisie (debounce 300ms)
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      const results = await searchTeamsForTournament(searchQuery, existingTeamIds)
      setSearchResults(results)
      setIsSearching(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Server Actions
  const [addState, addAction, isAddPending] = useActionState(addTeamToTournament, null)
  const [inviteTeamState, inviteTeamAction, isInviteTeamPending] = useActionState(inviteTeamToTournament, null)
  const [inviteEmailState, inviteEmailAction, isInviteEmailPending] = useActionState(inviteTeamByEmail, null)

  // Handlers pour réinitialiser les champs après succès
  useEffect(() => {
    if (addState) {
      if (addState.success) {
        toast.success("Équipe ajoutée", { description: addState.message })
        setSelectedTeamId("")
        setSearchQuery("")
        setSearchResults([])
      } else {
        toast.error("Erreur", { description: addState.message })
      }
    }
  }, [addState])

  useEffect(() => {
    if (inviteTeamState) {
      if (inviteTeamState.success) {
        toast.success("Invitation envoyée", { description: inviteTeamState.message })
        setSelectedTeamId("")
        setSearchQuery("")
        setSearchResults([])
      } else {
        toast.error("Erreur", { description: inviteTeamState.message })
      }
    }
  }, [inviteTeamState])

  useEffect(() => {
    if (inviteEmailState) {
      if (inviteEmailState.success) {
        toast.success("E-mail envoyé", { description: inviteEmailState.message })
      } else {
        toast.error("Erreur", { description: inviteEmailState.message })
      }
    }
  }, [inviteEmailState])

  return (
    <Tabs defaultValue="team" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="team" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Rechercher une équipe
        </TabsTrigger>
        <TabsTrigger value="email" className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Inviter par e-mail
        </TabsTrigger>
      </TabsList>

      {/* RECHERCHE ET SÉLECTION D'ÉQUIPE */}
      <TabsContent value="team" className="space-y-4">
        <div className="space-y-3">
          <Label htmlFor="team-search">
            Rechercher par nom d'équipe ou nom de structure
          </Label>

          <div className="relative">
            {isSearching ? (
              <Loader2 className="absolute left-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            )}
            <Input
              id="team-search"
              placeholder="Ex: Vitality, Solary, Structure eSports..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Liste déroulante des résultats avec structure affichée */}
          {searchQuery.trim().length >= 2 && (
            <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
              <SelectTrigger id="team-select">
                <SelectValue
                  placeholder={
                    searchResults.length > 0
                      ? "Sélectionnez l'équipe à inviter"
                      : "Aucune équipe éligible trouvée"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {searchResults.length > 0 ? (
                  searchResults.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{team.name}</span>
                        {team.structureName && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded">
                            <Building2 className="h-3 w-3" />
                            {team.structureName}
                          </span>
                        )}
                        {team.game && (
                          <span className="text-xs text-muted-foreground">
                            ({team.game})
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-3 text-xs text-muted-foreground text-center">
                    {isSearching
                      ? "Recherche en cours..."
                      : `Aucune équipe disponible pour "${searchQuery}" (soit introuvable, soit déjà inscrite).`}
                  </div>
                )}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* BOUTONS D'ACTION */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {/* Inviter (PENDING) */}
          <form action={inviteTeamAction} className="flex-1">
            <input type="hidden" name="tournamentId" value={tournamentId} />
            <input type="hidden" name="teamId" value={selectedTeamId} />
            <Button
              type="submit"
              variant="outline"
              disabled={!selectedTeamId || isInviteTeamPending || isAddPending}
              className="w-full"
            >
              {isInviteTeamPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Inviter l'équipe
            </Button>
          </form>

          {/* Ajouter directement (ACCEPTED) */}
          <form action={addAction} className="flex-1">
            <input type="hidden" name="tournamentId" value={tournamentId} />
            <input type="hidden" name="teamId" value={selectedTeamId} />
            <Button
              type="submit"
              disabled={!selectedTeamId || isAddPending || isInviteTeamPending}
              className="w-full"
            >
              {isAddPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              Ajouter directement
            </Button>
          </form>
        </div>
      </TabsContent>

      {/* INVITER PAR E-MAIL */}
      <TabsContent value="email">
        <form action={inviteEmailAction} className="flex flex-col sm:flex-row gap-3 items-end">
          <input type="hidden" name="tournamentId" value={tournamentId} />

          <div className="space-y-2 flex-1 w-full">
            <Label htmlFor="email-input">Email du capitaine / responsable</Label>
            <Input
              id="email-input"
              name="email"
              type="email"
              placeholder="capitaine@equipe.com"
              required
            />
          </div>

          <Button type="submit" disabled={isInviteEmailPending} className="w-full sm:w-auto">
            {isInviteEmailPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Mail className="mr-2 h-4 w-4" />
            )}
            Envoyer l'invitation
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  )
}