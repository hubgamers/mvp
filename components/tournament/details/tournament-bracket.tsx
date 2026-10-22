"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
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
  Swords,
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
      return "À confirmer"
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
          name: sortedMatches[0]?.stage_name || "Phase principale",
          order: sortedMatches[0]?.stage_order || 1,
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
      <Card className="border-dashed border-white/10 bg-black/20">
        <CardContent className="py-16 text-center">
          <Swords className="size-10 text-muted-foreground mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-bold text-white mb-1">Arbre de compétition non généré</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            L'arbre se construira automatiquement dès la clôture des inscriptions ou lors du tirage au sort par l'organisateur.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Champion Banner */}
      {tournamentWinner && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/40 p-6 shadow-[0_0_40px_rgba(245,158,11,0.2)]">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              <Trophy className="h-8 w-8 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-amber-500 text-black font-black uppercase text-[10px] tracking-wider hover:bg-amber-400">
                  CHAMPION DU TOURNOI
                </Badge>
                <Sparkles className="h-4 w-4 text-amber-400" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase mt-1 tracking-tight">
                {tournamentWinner.name}
              </h2>
              <p className="text-xs text-amber-300/80 mt-0.5">Vainqueur de la Grande Finale</p>
            </div>
          </div>
        </div>
      )}

      {/* Bracket Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-black/40 p-3 rounded-xl border border-white/[0.08] backdrop-blur-md">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Trophy className="h-4 w-4 text-brand-cyan" />
          <span className="font-bold text-white uppercase tracking-wider">
            {stages.reduce((total, stage) => total + stage.rounds.length, 0)} Tours
          </span>
          <span>•</span>
          <span className="font-mono">{matches.length} Matchs</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-xs"
            onClick={() => setZoomLevel((z) => Math.max(z - 0.1, 0.6))}
            title="Dézoomer"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <span className="text-xs font-mono w-12 text-center text-slate-300">
            {Math.round(zoomLevel * 100)}%
          </span>
          <Button
            variant="outline"
            size="icon-xs"
            onClick={() => setZoomLevel((z) => Math.min(z + 0.1, 1.3))}
            title="Zoomer"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon-xs"
            onClick={() => setZoomLevel(1)}
            title="Réinitialiser"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Interactive Bracket Rendering */}
      <div className="relative overflow-x-auto rounded-2xl border border-white/[0.08] bg-black/50 p-6 min-h-[500px] esport-dots-bg">
        <div
          className="flex gap-14 transition-transform duration-200 origin-top-left"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {stages.map((stage) => (
            <section key={stage.id} className="flex flex-col gap-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-center text-brand-cyan">
                {stage.name}
              </h3>
              <div className="flex gap-14">
                {stage.rounds.map((round, roundIndex) => (
                  <div key={`${stage.id}-${round.roundNumber}`} className="flex flex-col min-w-[270px] max-w-[290px]">
                    <div className="mb-6 text-center">
                      <Badge variant="outline" className="mb-1 text-xs font-bold uppercase tracking-wider px-3 py-1 bg-white/[0.03] border-white/10">
                        {round.title}
                      </Badge>
                      <p className="text-[10px] font-mono uppercase text-muted-foreground">
                        {round.matches.length} {round.matches.length > 1 ? "matchs" : "match"}
                      </p>
                    </div>

                    <div className="flex flex-1 flex-col justify-around gap-8">
                      {round.matches.map((match) => {
                        const isAlphaWinner = match.winner_id === match.alpha_team_id && !!match.winner_id
                        const isBetaWinner = match.winner_id === match.beta_team_id && !!match.winner_id
                        const isCompleted = match.status === "COMPLETED" || match.status === "BYE"

                        return (
                          <div key={match.id} className="relative flex flex-col group">
                            <Link
                              href={`/dashboard/matches/${match.id}`}
                              aria-label={`Voir le match entre ${match.alpha_team?.name || "équipe A"} et ${match.beta_team?.name || "équipe B"}`}
                              className="relative z-10 block overflow-hidden rounded-xl border border-white/[0.08] bg-card/90 shadow-md backdrop-blur-md transition-all duration-300 hover:border-brand-cyan/60 hover:shadow-[0_0_25px_rgba(0,242,254,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan"
                            >
                              {/* Match Header */}
                              <div className="flex items-center justify-between bg-black/40 px-3 py-1.5 text-[10px] font-mono text-muted-foreground border-b border-white/[0.06]">
                                <span>MATCH #{match.match_order}</span>
                                {isCompleted ? (
                                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                    <Check className="h-3 w-3" /> {getMatchStatusLabel(match.status)}
                                  </span>
                                ) : match.status === "LIVE" ? (
                                  <span className="text-red-400 font-semibold flex items-center gap-1 animate-pulse">
                                    <PlayCircle className="h-3 w-3" /> {getMatchStatusLabel(match.status)}
                                  </span>
                                ) : (
                                  <span className="text-amber-400 font-semibold">
                                    {getMatchStatusLabel(match.status)}
                                  </span>
                                )}
                              </div>

                              {/* Team Alpha Row */}
                              <div
                                className={`flex items-center justify-between px-3 py-2.5 border-b border-white/[0.06] transition-colors ${
                                  isAlphaWinner
                                    ? "bg-emerald-500/15 font-bold text-white"
                                    : "text-slate-300 hover:bg-white/[0.02]"
                                }`}
                              >
                                <div className="flex items-center gap-2 overflow-hidden mr-2">
                                  {isAlphaWinner ? (
                                    <Crown className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                                  ) : (
                                    <span className="size-2 rounded-full bg-slate-600 shrink-0" />
                                  )}
                                  <span className="truncate text-xs font-semibold">
                                    {match.alpha_team?.name || "À déterminer"}
                                  </span>
                                </div>
                                <span
                                  className={`font-mono text-xs px-2 py-0.5 rounded font-bold ${
                                    isAlphaWinner
                                      ? "bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                                      : "bg-black/40 text-muted-foreground border border-white/[0.06]"
                                  }`}
                                >
                                  {["PENDING", "READY"].includes(match.status) && match.score_alpha === 0
                                    ? "-"
                                    : match.score_alpha}
                                </span>
                              </div>

                              {/* Team Beta Row */}
                              <div
                                className={`flex items-center justify-between px-3 py-2.5 transition-colors ${
                                  isBetaWinner
                                    ? "bg-emerald-500/15 font-bold text-white"
                                    : "text-slate-300 hover:bg-white/[0.02]"
                                }`}
                              >
                                <div className="flex items-center gap-2 overflow-hidden mr-2">
                                  {isBetaWinner ? (
                                    <Crown className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                                  ) : (
                                    <span className="size-2 rounded-full bg-slate-600 shrink-0" />
                                  )}
                                  <span className="truncate text-xs font-semibold">
                                    {match.beta_team?.name || "À déterminer"}
                                  </span>
                                </div>
                                <span
                                  className={`font-mono text-xs px-2 py-0.5 rounded font-bold ${
                                    isBetaWinner
                                      ? "bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                                      : "bg-black/40 text-muted-foreground border border-white/[0.06]"
                                  }`}
                                >
                                  {["PENDING", "READY"].includes(match.status) && match.score_beta === 0
                                    ? "-"
                                    : match.score_beta}
                                </span>
                              </div>
                            </Link>

                            {/* Connector Line to next round */}
                            {roundIndex < stage.rounds.length - 1 && (
                              <div className="absolute top-1/2 -right-14 h-0.5 w-14 bg-white/10 z-0 -translate-y-1/2 group-hover:bg-brand-cyan/60 transition-colors" />
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
