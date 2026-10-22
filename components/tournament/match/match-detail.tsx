"use client"

import { useEffect, useState, useTransition, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Crown,
  Gamepad2,
  ExternalLink,
  MessageSquare,
  Shield,
  Trophy,
  Video,
  Swords,
  Tv,
  Check,
  Flame,
} from "lucide-react"
import { updateMatchScore, updateMatchStream } from "@/app/actions/match.actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MatchChat } from "@/components/tournament/match/match-chat"

export interface MatchDetailPlayer {
  id: string
  name: string
  avatarUrl: string | null
  role: "CAPTAIN" | "MANAGER" | "PLAYER"
}

export interface MatchDetailTeam {
  id: string
  name: string
  logoUrl: string | null
  players: MatchDetailPlayer[]
}

export interface MatchDetailGame {
  gameNumber: number
  mapName: string | null
  scoreA: number
  scoreB: number
  winnerSide: "A" | "B" | null
}

export interface MatchDetailData {
  id: string
  tournamentId: string
  tournamentName: string
  stageName: string
  game: string
  platform: string
  status: string
  scheduledAt: string | null
  bestOf: number
  rules: string | null
  teamAlpha: MatchDetailTeam | null
  teamBeta: MatchDetailTeam | null
  games: MatchDetailGame[]
  canManageMatch: boolean
  canManageBroadcast: boolean
  canUseMatchChat: boolean
  currentUserId: string
  streamUrl: string | null
}

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" | "live" | "cyber" | "warning" }> = {
  PENDING: { label: "À venir", variant: "outline" },
  READY: { label: "Prêt", variant: "warning" },
  LIVE: { label: "En direct", variant: "live" },
  AWAITING_RESULT_CONFIRMATION: { label: "Résultat à confirmer", variant: "warning" },
  COMPLETED: { label: "Terminé", variant: "outline" },
  DISPUTED: { label: "Litige / Contesté", variant: "destructive" },
  CANCELLED: { label: "Annulé", variant: "destructive" },
  BYE: { label: "Exempt", variant: "secondary" },
}

const roleLabels: Record<MatchDetailPlayer["role"], string> = {
  CAPTAIN: "Capitaine",
  MANAGER: "Manager",
  PLAYER: "Joueur",
}

function countWins(games: MatchDetailGame[], side: "A" | "B") {
  return games.filter((game) => {
    const winner = game.winnerSide ?? (game.scoreA === game.scoreB ? null : game.scoreA > game.scoreB ? "A" : "B")
    return winner === side
  }).length
}

function TeamRoster({ team, side }: { team: MatchDetailTeam | null; side: "alpha" | "beta" }) {
  const isAlpha = side === "alpha"
  const theme = isAlpha
    ? {
        border: "border-cyan-500/30",
        badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
        avatarBg: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
        name: "text-cyan-400",
        label: "Équipe Alpha",
      }
    : {
        border: "border-purple-500/30",
        badge: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        avatarBg: "bg-purple-500/20 text-purple-400 border-purple-500/30",
        name: "text-purple-400",
        label: "Équipe Beta",
      }

  return (
    <Card className={`border-white/[0.08] bg-card/75 backdrop-blur-md hover:${theme.border} transition-colors`}>
      <CardHeader className="pb-3 border-b border-white/[0.06] bg-black/30">
        <div className="flex items-center justify-between">
          <CardTitle className={`flex items-center gap-2.5 text-base font-bold`}>
            {team?.logoUrl ? (
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={team.logoUrl} alt="" />
                <AvatarFallback>{team.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            ) : (
              <div className={`size-8 rounded-lg flex items-center justify-center font-bold text-xs border ${theme.avatarBg}`}>
                {team?.name ? team.name.slice(0, 2).toUpperCase() : "TBD"}
              </div>
            )}
            <span className="text-white font-black">{team?.name ?? "Équipe à déterminer"}</span>
          </CardTitle>
          <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${theme.badge}`}>
            {theme.label}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pt-4">
        {!team?.players.length ? (
          <p className="text-xs text-muted-foreground py-4 text-center">Aucun joueur communiqué pour le moment.</p>
        ) : (
          team.players.map((player) => (
            <div key={player.id} className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-black/40 p-2.5">
              <div className="flex items-center gap-3">
                <Avatar className="h-7 w-7 rounded-md">
                  <AvatarImage src={player.avatarUrl ?? undefined} alt="" />
                  <AvatarFallback className="text-[10px] bg-white/10 font-bold">{player.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs font-bold text-white">{player.name}</p>
                  <p className="text-[10px] text-muted-foreground">{roleLabels[player.role]}</p>
                </div>
              </div>
              {player.role === "CAPTAIN" && <Crown className="h-3.5 w-3.5 text-amber-400" aria-label="Capitaine" />}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

function GameScore({
  match,
  game,
  canManage,
}: {
  match: MatchDetailData
  game: MatchDetailGame
  canManage: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [scoreA, setScoreA] = useState(String(game.scoreA))
  const [scoreB, setScoreB] = useState(String(game.scoreB))
  const winner = game.winnerSide ?? (game.scoreA === game.scoreB ? null : game.scoreA > game.scoreB ? "A" : "B")

  function submitScore(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsedA = Number(scoreA)
    const parsedB = Number(scoreB)
    if (!Number.isInteger(parsedA) || !Number.isInteger(parsedB) || parsedA < 0 || parsedB < 0) {
      toast.error("Saisissez deux scores entiers positifs.")
      return
    }

    startTransition(async () => {
      const result = await updateMatchScore(match.id, game.gameNumber, parsedA, parsedB)
      if (!result.success) {
        toast.error(result.message)
        return
      }
      toast.success(result.message)
      router.refresh()
    })
  }

  return (
    <div className="space-y-3 rounded-xl border border-white/[0.08] bg-black/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/[0.05]">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white text-sm">Manche {game.gameNumber}</span>
          <span className="text-xs text-muted-foreground">({game.mapName || "Carte officielle"})</span>
        </div>
        {winner ? (
          <Badge variant="success" className="flex items-center gap-1 text-[10px]">
            <CheckCircle2 className="h-3 w-3" />
            {winner === "A" ? match.teamAlpha?.name : match.teamBeta?.name} remporte le round
          </Badge>
        ) : (
          <Badge variant="outline" className="text-[10px]">En attente de saisie</Badge>
        )}
      </div>

      <form onSubmit={submitScore} className="grid grid-cols-[1fr_auto_1fr] items-end gap-3 pt-1">
        <label className="space-y-1 text-xs">
          <span className="block truncate font-semibold text-cyan-400">{match.teamAlpha?.name ?? "Alpha"}</span>
          <Input
            aria-label={`Score de ${match.teamAlpha?.name ?? "l'équipe A"} pour la manche ${game.gameNumber}`}
            type="number"
            min="0"
            max="1000"
            inputMode="numeric"
            value={scoreA}
            onChange={(event) => setScoreA(event.target.value)}
            disabled={!canManage || isPending}
            className="h-9 bg-black/60 border-white/10 font-mono font-bold text-base text-center"
          />
        </label>
        <span className="pb-2 font-mono text-lg font-bold text-muted-foreground">:</span>
        <label className="space-y-1 text-xs">
          <span className="block truncate font-semibold text-purple-400">{match.teamBeta?.name ?? "Beta"}</span>
          <Input
            aria-label={`Score de ${match.teamBeta?.name ?? "l'équipe B"} pour la manche ${game.gameNumber}`}
            type="number"
            min="0"
            max="1000"
            inputMode="numeric"
            value={scoreB}
            onChange={(event) => setScoreB(event.target.value)}
            disabled={!canManage || isPending}
            className="h-9 bg-black/60 border-white/10 font-mono font-bold text-base text-center"
          />
        </label>
        {canManage && (
          <Button type="submit" size="sm" disabled={isPending} className="col-span-3 sm:col-span-1 sm:col-start-3 text-xs font-bold uppercase tracking-wider">
            {isPending ? "Validation..." : "Valider le score"}
          </Button>
        )}
      </form>
    </div>
  )
}

export default function MatchDetail({ match }: { match: MatchDetailData }) {
  const router = useRouter()
  const [streamUrl, setStreamUrl] = useState(match.streamUrl ?? "")
  const [isSavingStream, startSavingStream] = useTransition()
  useEffect(() => setStreamUrl(match.streamUrl ?? ""), [match.id, match.streamUrl])
  
  const statusInfo = statusLabels[match.status] ?? { label: match.status, variant: "outline" as const }
  const teamAlpha = match.teamAlpha
  const teamBeta = match.teamBeta
  const alphaWins = countWins(match.games, "A")
  const betaWins = countWins(match.games, "B")
  const canEditScores =
    match.canManageMatch && !["COMPLETED", "CANCELLED", "BYE"].includes(match.status)

  function saveStream(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    startSavingStream(async () => {
      const result = await updateMatchStream(match.id, streamUrl)
      if (!result.success) {
        toast.error(result.message)
        return
      }
      toast.success(result.message)
      router.refresh()
    })
  }

  function clearStream() {
    startSavingStream(async () => {
      const result = await updateMatchStream(match.id, "")
      if (!result.success) {
        toast.error(result.message)
        return
      }
      setStreamUrl("")
      toast.success(result.message)
      router.refresh()
    })
  }

  return (
    <main className="flex flex-1 flex-col gap-6 p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <div>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-muted-foreground hover:text-white -ml-2"
        >
          <Link href={`/dashboard/tournaments/${match.tournamentId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au tournoi
          </Link>
        </Button>
      </div>

      {/* Esports Match Cockpit / Arena Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-white/[0.12] bg-gradient-to-r from-card via-[#0a101d] to-card p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 left-1/4 w-80 h-80 bg-brand-cyan/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-brand-violet/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-brand-cyan" />
            <Link className="font-bold text-white hover:underline uppercase tracking-wider" href={`/dashboard/tournaments/${match.tournamentId}`}>
              {match.tournamentName}
            </Link>
            <span>·</span>
            <span className="text-slate-300 font-semibold">{match.stageName}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-brand-cyan bg-brand-cyan/10 px-2.5 py-1 rounded-full border border-brand-cyan/20">
              <Gamepad2 className="h-3.5 w-3.5" />
              {match.game} ({match.platform})
            </span>
            <Badge variant={statusInfo.variant} className="text-[10px] uppercase font-bold">
              {statusInfo.label}
            </Badge>
            <Badge variant="outline" className="font-mono text-[10px] bg-white/[0.04]">
              BO{match.bestOf}
            </Badge>
          </div>
        </div>

        {/* Central Face-Off Arena */}
        <div className="relative z-10 grid grid-cols-1 items-center gap-6 py-8 md:grid-cols-7">
          {/* Team Alpha */}
          <div className="flex items-center justify-between gap-4 text-left md:col-span-3 md:justify-end md:text-right">
            <div className="order-2 md:order-1">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">{teamAlpha?.name ?? "À déterminer"}</h1>
              <p className="text-xs font-bold uppercase tracking-wider text-cyan-400 mt-1">Équipe Alpha</p>
            </div>
            {teamAlpha?.logoUrl ? (
              <Avatar className="order-1 h-16 w-16 rounded-2xl md:order-2 border-2 border-cyan-500/40 shadow-[0_0_20px_rgba(0,242,254,0.3)]">
                <AvatarImage src={teamAlpha.logoUrl} alt="" />
                <AvatarFallback className="font-black text-cyan-400">{teamAlpha.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            ) : (
              <div className="order-1 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-cyan-500/40 bg-cyan-500/10 text-cyan-400 shadow-[0_0_20px_rgba(0,242,254,0.25)] font-black text-xl md:order-2">
                {teamAlpha?.name ? teamAlpha.name.slice(0, 2).toUpperCase() : "A"}
              </div>
            )}
          </div>

          {/* Score Counter */}
          <div className="flex flex-col items-center justify-center md:col-span-1">
            <div className="flex items-center gap-3 rounded-2xl border border-white/[0.12] bg-black/60 px-6 py-3 shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-xl">
              <span className="font-mono text-3xl sm:text-4xl font-black text-cyan-400 drop-shadow-[0_0_12px_rgba(0,242,254,0.4)]">{alphaWins}</span>
              <span className="text-xl font-light text-muted-foreground">:</span>
              <span className="font-mono text-3xl sm:text-4xl font-black text-purple-400 drop-shadow-[0_0_12px_rgba(168,85,247,0.4)]">{betaWins}</span>
            </div>
            <p className="mt-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Manches Gagnées
            </p>
          </div>

          {/* Team Beta */}
          <div className="flex items-center justify-between gap-4 md:col-span-3 md:justify-start">
            {teamBeta?.logoUrl ? (
              <Avatar className="h-16 w-16 rounded-2xl border-2 border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                <AvatarImage src={teamBeta.logoUrl} alt="" />
                <AvatarFallback className="font-black text-purple-400">{teamBeta.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-purple-500/40 bg-purple-500/10 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.25)] font-black text-xl">
                {teamBeta?.name ? teamBeta.name.slice(0, 2).toUpperCase() : "B"}
              </div>
            )}
            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">{teamBeta?.name ?? "À déterminer"}</h2>
              <p className="text-xs font-bold uppercase tracking-wider text-purple-400 mt-1">Équipe Beta</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid: Match Games + Match Chat + Broadcast Info */}
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="space-y-5 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Swords className="size-5 text-brand-cyan" />
                Détail des manches
              </h2>
              <p className="text-xs text-muted-foreground">Feuille de match officielle validée par l'arbitrage.</p>
            </div>
            {match.canManageMatch && (
              <Badge variant="cyber" className="text-[10px]">
                ARBITRE / GESTIONNAIRE
              </Badge>
            )}
          </div>

          {canEditScores ? (
            <div className="space-y-3">
              {Array.from({ length: match.bestOf }, (_, index) => {
                const gameNumber = index + 1
                const game = match.games.find((item) => item.gameNumber === gameNumber) ?? {
                  gameNumber,
                  mapName: null,
                  scoreA: 0,
                  scoreB: 0,
                  winnerSide: null,
                }
                return <GameScore key={gameNumber} match={match} game={game} canManage />
              })}
            </div>
          ) : match.games.length ? (
            <div className="space-y-3">
              {match.games.map((game) => (
                <GameScore key={game.gameNumber} match={match} game={game} canManage={false} />
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-white/10 bg-black/20">
              <CardContent className="py-8 text-center text-xs text-muted-foreground">
                Aucun résultat n’a encore été saisi pour cette rencontre.
              </CardContent>
            </Card>
          )}

          {/* Match Chat Box */}
          <div className="pt-2">
            <h3 className="mb-3 flex items-center gap-2 font-bold text-sm text-white uppercase tracking-wider">
              <MessageSquare className="h-4 w-4 text-brand-cyan" />
              Canal de communication match
            </h3>
            <MatchChat
              matchId={match.id}
              currentUserId={match.currentUserId}
              canUseChat={match.canUseMatchChat}
            />
          </div>
        </section>

        {/* Aside: Broadcast & Match Rules */}
        <aside className="space-y-5">
          {/* Stream Broadcast */}
          <Card className="border-white/[0.08]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
                  <Video className="h-4 w-4 text-red-500" />
                  Diffusion Live
                </CardTitle>
                {match.streamUrl && (
                  <span className="flex size-2 rounded-full bg-red-500 animate-pulse" />
                )}
              </div>
              <CardDescription>
                Lien Twitch, YouTube ou Kick du caster
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {match.streamUrl ? (
                <a
                  href={match.streamUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 w-full items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 px-3 text-xs font-bold text-red-400 transition-colors hover:bg-red-500/20"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Regarder le Stream officiel
                </a>
              ) : (
                <p className="text-xs text-muted-foreground py-2 text-center rounded bg-black/30">
                  Aucun flux de stream actif.
                </p>
              )}
              {match.canManageBroadcast && (
                <form onSubmit={saveStream} className="space-y-2 border-t border-white/[0.06] pt-3">
                  <label htmlFor="match-stream-url" className="text-xs font-semibold text-slate-300">
                    URL du Stream OBS / Caster
                  </label>
                  <Input
                    id="match-stream-url"
                    type="url"
                    inputMode="url"
                    placeholder="https://www.twitch.tv/mon_stream"
                    value={streamUrl}
                    onChange={(event) => setStreamUrl(event.target.value)}
                    maxLength={2048}
                    disabled={isSavingStream}
                    className="h-8 text-xs bg-black/40 border-white/10"
                  />
                  <div className="flex gap-2">
                    <Button type="submit" size="xs" disabled={isSavingStream}>
                      {isSavingStream ? "Sauvegarde..." : "Enregistrer flux"}
                    </Button>
                    {match.streamUrl && (
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        disabled={isSavingStream || !streamUrl}
                        onClick={clearStream}
                      >
                        Retirer
                      </Button>
                    )}
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Match Schedule & Rules */}
          <Card className="border-white/[0.08]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
                <Calendar className="h-4 w-4 text-brand-cyan" />
                Planning & Arbitrage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2 rounded-lg bg-black/40 p-2.5 border border-white/[0.05]">
                <Clock className="h-4 w-4 text-brand-cyan shrink-0" />
                <span className="text-slate-300 font-semibold">
                  {match.scheduledAt
                    ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(match.scheduledAt))
                    : "Horaire officiel à définir"}
                </span>
              </div>
              {match.rules && (
                <div className="border-t border-white/[0.06] pt-3">
                  <p className="font-bold text-white mb-1 uppercase text-[10px] tracking-wider">Règles du match</p>
                  <p className="whitespace-pre-wrap text-[11px] leading-relaxed">{match.rules}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* Roster lineups */}
      <section className="space-y-4 pt-4">
        <h2 className="text-lg font-black text-white uppercase tracking-tight">Lineups des deux équipes</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <TeamRoster team={teamAlpha} side="alpha" />
          <TeamRoster team={teamBeta} side="beta" />
        </div>
      </section>
    </main>
  )
}
