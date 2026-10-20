"use client"

import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Trophy,
  Crown,
  Check,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  PlayCircle,
} from "lucide-react"

export type MatchStatus =
  | "PENDING"
  | "READY"
  | "LIVE"
  | "AWAITING_RESULT_CONFIRMATION"
  | "COMPLETED"
  | "DISPUTED"
  | "CANCELLED"
  | "BYE"

export interface Team {
  id: string
  name: string
}

export interface DbMatch {
  id: string
  alpha_team_id?: string | null
  beta_team_id?: string | null
  score_alpha: number
  score_beta: number
  winner_id?: string | null
  round_number: number
  match_order: number
  status: MatchStatus
  stage_id: string
  stage_name: string
  stage_order: number
  alpha_team?: Team
  beta_team?: Team
}

interface BracketStage {
  id: string
  name: string
  order: number
  rounds: Array<{
    roundNumber: number
    title: string
    matches: DbMatch[]
  }>
}

function getMatchStatusLabel(status: MatchStatus) {
  switch (status) {
    case "READY":
      return "Prêt"
    case "LIVE":
      return "EN DIRECT"
    case "AWAITING_RESULT_CONFIRMATION":
      return "Résultat à confirmer"
    case "COMPLETED":
      return "Terminé"
    case "DISPUTED":
      return "Contesté"
    case "CANCELLED":
      return "Annulé"
    case "BYE":
      return "Exempt"
    default:
      return "En attente"
  }
}

export function TournamentBracket({ initialMatches = [] }: { initialMatches?: DbMatch[] }) {
  const matches = initialMatches
  const [zoomLevel, setZoomLevel] = useState<number>(1)

  const stages = useMemo<BracketStage[]>(() => {
    const groupedMatches = new Map<string, DbMatch[]>()
    matches.forEach((match) => {
      const stageMatches = groupedMatches.get(match.stage_id) ?? []
      stageMatches.push(match)
      groupedMatches.set(match.stage_id, stageMatches)
    })

    return Array.from(groupedMatches.entries())
      .map(([stageId, stageMatches]) => {
        const sortedMatches = [...stageMatches].sort(
          (a, b) => a.round_number - b.round_number || a.match_order - b.match_order,
        )
        const maxRound = Math.max(...sortedMatches.map((match) => match.round_number))

        return {
          id: stageId,
          name: sortedMatches[0].stage_name,
          order: sortedMatches[0].stage_order,
          rounds: Array.from({ length: maxRound }, (_, index) => {
            const roundNumber = index + 1
            let title = `Tour ${roundNumber}`
            if (roundNumber === maxRound) title = "Grande Finale"
            else if (roundNumber === maxRound - 1) title = "Demi-finales"
            else if (roundNumber === maxRound - 2) title = "Quarts de finale"
            else if (roundNumber === maxRound - 3) title = "Huitièmes de finale"

            return {
              roundNumber,
              title,
              matches: sortedMatches.filter((match) => match.round_number === roundNumber),
            }
          }).filter((round) => round.matches.length > 0),
        }
      })
      .sort((a, b) => a.order - b.order)
  }, [matches])

  const tournamentWinner = useMemo(() => {
    const finalStage = stages.at(-1)
    const finalRound = finalStage?.rounds.at(-1)
    const finalMatch = finalRound?.matches.find(
      (match) => match.status === "COMPLETED" || match.status === "BYE",
    )
    if (finalMatch && finalMatch.winner_id) {
      if (finalMatch.alpha_team_id === finalMatch.winner_id) return finalMatch.alpha_team
      if (finalMatch.beta_team_id === finalMatch.winner_id) return finalMatch.beta_team
    }
    return null
  }, [stages])

  if (!matches || matches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Arbre de la compétition (Matchs)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground py-12 text-center">
            La gestion des matchs et de l'arbre s'affichera ici dès le lancement du tournoi.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Champion Banner */}
      {tournamentWinner && (
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/30 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/40 shadow-inner">
              <Trophy className="h-8 w-8 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-amber-500 text-black font-bold hover:bg-amber-400">CHAMPION DU TOURNOI</Badge>
                <Sparkles className="h-4 w-4 text-amber-500" />
              </div>
              <h2 className="text-2xl font-black text-foreground mt-1">{tournamentWinner.name}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Victoire éclatante dans la grande finale</p>
            </div>
          </div>
        </div>
      )}

      {/* Bracket Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/40 p-3 rounded-lg border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Trophy className="h-4 w-4 text-primary" />
          <span className="font-semibold text-foreground">
            {stages.reduce((total, stage) => total + stage.rounds.length, 0)} Tours de compétition
          </span>
          <span>•</span>
          <span>{matches.length} Matchs configurés</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setZoomLevel((z) => Math.max(z - 0.1, 0.6))}
            title="Dézoomer"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <span className="text-xs font-mono w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setZoomLevel((z) => Math.min(z + 0.1, 1.3))}
            title="Zoomer"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setZoomLevel(1)}
            title="Réinitialiser"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Interactive Bracket Rendering */}
      <div className="relative overflow-x-auto rounded-xl border bg-card/50 p-6 min-h-[500px]">
        <div
          className="flex gap-12 transition-transform duration-200 origin-top-left"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {stages.map((stage) => (
            <section key={stage.id} className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-center text-muted-foreground">{stage.name}</h3>
              <div className="flex gap-12">
                {stage.rounds.map((round, roundIndex) => (
                  <div key={`${stage.id}-${round.roundNumber}`} className="flex flex-col min-w-[260px] max-w-[280px]">
                    <div className="mb-6 text-center">
                      <Badge variant="outline" className="mb-1 font-semibold px-3 py-1">
                        {round.title}
                      </Badge>
                      <p className="text-[11px] text-muted-foreground">
                        {round.matches.length} {round.matches.length > 1 ? "matchs" : "match"}
                      </p>
                    </div>

                    <div className="flex flex-1 flex-col justify-around gap-6">
                      {round.matches.map((match) => {
                        const isAlphaWinner = match.winner_id === match.alpha_team_id && !!match.winner_id
                        const isBetaWinner = match.winner_id === match.beta_team_id && !!match.winner_id
                        const isCompleted = match.status === "COMPLETED" || match.status === "BYE"

                        return (
                          <div key={match.id} className="relative flex flex-col group">
                            <div className="relative z-10 overflow-hidden rounded-lg border bg-card shadow-sm transition-all duration-200 hover:border-primary hover:shadow-md">
                              <div className="flex items-center justify-between bg-muted/60 px-3 py-1.5 text-[10px] font-medium text-muted-foreground border-b">
                                <span>Match #{match.match_order}</span>
                                {isCompleted ? (
                                  <span className="text-emerald-500 font-semibold flex items-center gap-1">
                                    <Check className="h-3 w-3" /> {getMatchStatusLabel(match.status)}
                                  </span>
                                ) : match.status === "LIVE" ? (
                                  <span className="text-rose-500 font-semibold flex items-center gap-1 animate-pulse">
                                    <PlayCircle className="h-3 w-3" /> {getMatchStatusLabel(match.status)}
                                  </span>
                                ) : (
                                  <span className="text-amber-500 font-semibold">{getMatchStatusLabel(match.status)}</span>
                                )}
                              </div>

                              <div
                                className={`flex items-center justify-between px-3 py-2.5 border-b transition-colors ${
                                  isAlphaWinner
                                    ? "bg-emerald-500/10 font-bold text-foreground"
                                    : "text-muted-foreground"
                                }`}
                              >
                                <div className="flex items-center gap-2 overflow-hidden mr-2">
                                  {isAlphaWinner && <Crown className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                                  <span className="truncate text-xs">
                                    {match.alpha_team?.name || "À déterminer"}
                                  </span>
                                </div>
                                <span
                                  className={`font-mono text-xs px-2 py-0.5 rounded ${
                                    isAlphaWinner
                                      ? "bg-emerald-500 text-white font-bold"
                                      : "bg-muted text-muted-foreground"
                                  }`}
                                >
                                  {["PENDING", "READY"].includes(match.status) && match.score_alpha === 0 ? "-" : match.score_alpha}
                                </span>
                              </div>

                              <div
                                className={`flex items-center justify-between px-3 py-2.5 transition-colors ${
                                  isBetaWinner
                                    ? "bg-emerald-500/10 font-bold text-foreground"
                                    : "text-muted-foreground"
                                }`}
                              >
                                <div className="flex items-center gap-2 overflow-hidden mr-2">
                                  {isBetaWinner && <Crown className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                                  <span className="truncate text-xs">
                                    {match.beta_team?.name || "À déterminer"}
                                  </span>
                                </div>
                                <span
                                  className={`font-mono text-xs px-2 py-0.5 rounded ${
                                    isBetaWinner
                                      ? "bg-emerald-500 text-white font-bold"
                                      : "bg-muted text-muted-foreground"
                                  }`}
                                >
                                  {["PENDING", "READY"].includes(match.status) && match.score_beta === 0 ? "-" : match.score_beta}
                                </span>
                              </div>
                            </div>

                            {roundIndex < stage.rounds.length - 1 && (
                              <div className="absolute top-1/2 -right-12 h-0.5 w-12 bg-border z-0 -translate-y-1/2 group-hover:bg-primary/50 transition-colors" />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}