"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Search, Filter, Swords, Trophy, Layers } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

interface TournamentMatchesTabProps {
  tournament: any
}

export function TournamentMatchesTab({ tournament }: TournamentMatchesTabProps) {
  const [selectedStageId, setSelectedStageId] = useState<string>("ALL")
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL")
  const [searchQuery, setSearchQuery] = useState<string>("")

  // 1. Extraire la liste à plat de tous les matchs avec les infos de leur étape
  const allMatches = useMemo(() => {
    if (!tournament?.tournaments_stages) return []

    return tournament.tournaments_stages.flatMap((stage: any) =>
      (stage.tournaments_matches || []).map((match: any) => ({
        ...match,
        stageName: stage.name,
        stageTypeCode: stage.type_code,
        stageId: stage.id,
      }))
    )
  }, [tournament])

  // 2. Extraire la liste unique des statuts existants pour alimenter le filtre
  const availableStatuses = useMemo(() => {
    const statusesMap = new Map<string, string>()
    allMatches.forEach((m: any) => {
      if (m.match_statuses) {
        statusesMap.set(m.status_code || m.match_statuses.code, m.match_statuses.label)
      }
    })
    return Array.from(statusesMap.entries()).map(([code, label]) => ({ code, label }))
  }, [allMatches])

  // 3. Filtrage dynamique selon l'étape, le statut et la recherche d'équipe
  const filteredMatches = useMemo(() => {
    return allMatches.filter((match: any) => {
      // Filtre Étape
      if (selectedStageId !== "ALL" && match.stageId !== selectedStageId) {
        return false
      }

      // Filtre Statut
      if (selectedStatus !== "ALL" && match.status_code !== selectedStatus && match.match_statuses?.code !== selectedStatus) {
        return false
      }

      // Filtre Recherche Équipe
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase()
        const roster1Name = match.rosters_tournaments_matches_roster1_idTorosters?.name?.toLowerCase() || ""
        const roster2Name = match.rosters_tournaments_matches_roster2_idTorosters?.name?.toLowerCase() || ""
        
        if (!roster1Name.includes(query) && !roster2Name.includes(query)) {
          return false
        }
      }

      return true
    })
  }, [allMatches, selectedStageId, selectedStatus, searchQuery])

  return (
    <Card className="border-white/10 bg-card/60 backdrop-blur-sm">
      <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
        <div>
          <CardTitle className="text-base font-bold text-white flex items-center gap-2">
            <Swords className="size-4 text-cyan-400" />
            Matchs du tournoi ({filteredMatches.length} / {allMatches.length})
          </CardTitle>
          <CardDescription className="text-xs">
            Accédez à la feuille de chaque confrontation pour saisir les scores ou résoudre les litiges.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Barre de Filtres et Recherche */}
        {allMatches.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-black/30 border border-white/5">
            {/* Recherche textuelle par nom d'équipe */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Rechercher une équipe..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 bg-black/40 border-white/10 text-xs h-9 text-white placeholder:text-muted-foreground"
              />
            </div>

            {/* Filtre par Étape / Stage */}
            <select
              value={selectedStageId}
              onChange={(e) => setSelectedStageId(e.target.value)}
              className="h-9 rounded-md bg-black/40 border border-white/10 px-3 text-xs text-white outline-none focus:border-cyan-500"
            >
              <option value="ALL">Toutes les étapes ({tournament.tournaments_stages?.length || 0})</option>
              {tournament.tournaments_stages?.map((stage: any) => (
                <option key={stage.id} value={stage.id} className="bg-slate-900">
                  {stage.name} ({stage.tournaments_matches?.length || 0} matchs)
                </option>
              ))}
            </select>

            {/* Filtre par Statut */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-9 rounded-md bg-black/40 border border-white/10 px-3 text-xs text-white outline-none focus:border-cyan-500"
            >
              <option value="ALL">Tous les statuts</option>
              {availableStatuses.map((status) => (
                <option key={status.code} value={status.code} className="bg-slate-900">
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Liste des matchs */}
        {allMatches.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-xs">
            Aucun match n'a encore été programmé.
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-xs">
            Aucun match ne correspond à vos critères de recherche.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMatches.map((m: any) => (
              <div
                key={m.id}
                className="p-4 rounded-xl bg-black/30 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/10 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] uppercase font-mono">
                      {m.match_statuses?.label || m.status_code}
                    </Badge>
                    <Badge className="bg-white/5 border-white/10 text-slate-300 text-[10px] flex items-center gap-1">
                      <Layers className="size-3 text-purple-400" />
                      {m.stageName}
                    </Badge>
                  </div>

                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="text-cyan-400">
                      {m.rosters_tournaments_matches_roster1_idTorosters?.name || "TBD"}
                    </span>
                    <span className="text-xs text-muted-foreground">vs</span>
                    <span className="text-purple-400">
                      {m.rosters_tournaments_matches_roster2_idTorosters?.name || "TBD"}
                    </span>
                  </div>
                </div>

                <Button asChild size="sm" variant="outline" className="text-xs border-white/10 hover:bg-white/10">
                  <Link href={`/dashboard/matches/${m.id}`}>
                    Gérer le match
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}