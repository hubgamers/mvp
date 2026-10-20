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
} from "lucide-react"
import { updateMatchScore, updateMatchStream } from "@/app/actions/match.actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

const statusLabels: Record<string, string> = {
  PENDING: "À venir",
  READY: "Prêt",
  LIVE: "En direct",
  AWAITING_RESULT_CONFIRMATION: "Résultat à confirmer",
  COMPLETED: "Terminé",
  DISPUTED: "Contesté",
  CANCELLED: "Annulé",
  BYE: "Exempt",
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

function TeamRoster({ team, color }: { team: MatchDetailTeam | null; color: "amber" | "blue" }) {
  const colors =
    color === "amber"
      ? { border: "border-amber-500/20", background: "bg-amber-500/5", text: "text-amber-500" }
      : { border: "border-blue-500/20", background: "bg-blue-500/5", text: "text-blue-500" }

  return (
    <Card className={colors.border}>
      <CardHeader className={`${colors.background} pb-3`}>
        <CardTitle className={`flex items-center gap-2 text-base ${colors.text}`}>
          {team?.logoUrl ? (
            <Avatar className="h-8 w-8">
              <AvatarImage src={team.logoUrl} alt="" />
              <AvatarFallback>{team.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          ) : (
            <Shield className="h-4 w-4" />
          )}
          {team?.name ?? "Équipe à déterminer"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pt-4">
        {!team?.players.length ? (
          <p className="text-sm text-muted-foreground">Aucun joueur communiqué.</p>
        ) : (
          team.players.map((player) => (
            <div key={player.id} className="flex items-center justify-between rounded-lg border bg-muted/30 p-2.5">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={player.avatarUrl ?? undefined} alt="" />
                  <AvatarFallback>{player.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{player.name}</p>
                  <p className="text-xs text-muted-foreground">{roleLabels[player.role]}</p>
                </div>
              </div>
              {player.role === "CAPTAIN" && <Crown className="h-4 w-4 text-amber-500" aria-label="Capitaine" />}
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
    <div className="space-y-3 rounded-xl border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-semibold">Manche {game.gameNumber}</p>
          <p className="text-sm text-muted-foreground">{game.mapName || "Carte non renseignée"}</p>
        </div>
        {winner ? (
          <Badge variant="secondary" className="flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {winner === "A" ? match.teamAlpha?.name : match.teamBeta?.name} remporte la manche
          </Badge>
        ) : (
          <Badge variant="outline">En attente du résultat</Badge>
        )}
      </div>

      <form onSubmit={submitScore} className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
        <label className="space-y-1 text-sm">
          <span className="block truncate text-muted-foreground">{match.teamAlpha?.name ?? "Équipe A"}</span>
          <Input
            aria-label={`Score de ${match.teamAlpha?.name ?? "l'équipe A"} pour la manche ${game.gameNumber}`}
            type="number"
            min="0"
            max="1000"
            inputMode="numeric"
            value={scoreA}
            onChange={(event) => setScoreA(event.target.value)}
            disabled={!canManage || isPending}
          />
        </label>
        <span className="pb-2 font-mono text-muted-foreground">:</span>
        <label className="space-y-1 text-sm">
          <span className="block truncate text-muted-foreground">{match.teamBeta?.name ?? "Équipe B"}</span>
          <Input
            aria-label={`Score de ${match.teamBeta?.name ?? "l'équipe B"} pour la manche ${game.gameNumber}`}
            type="number"
            min="0"
            max="1000"
            inputMode="numeric"
            value={scoreB}
            onChange={(event) => setScoreB(event.target.value)}
            disabled={!canManage || isPending}
          />
        </label>
        {canManage && (
          <Button type="submit" disabled={isPending} className="col-span-3 sm:col-span-1 sm:col-start-3">
            {isPending ? "Enregistrement…" : "Enregistrer le score"}
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
  const label = statusLabels[match.status] ?? match.status
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
    <main className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <Link
          href={`/dashboard/tournaments/${match.tournamentId}`}
          className="inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au tournoi
        </Link>
      </div>

      <section className="rounded-2xl border bg-linear-to-b from-card via-card/90 to-background p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            <Link className="font-semibold text-foreground hover:underline" href={`/dashboard/tournaments/${match.tournamentId}`}>
              {match.tournamentName}
            </Link>
            <span aria-hidden="true">·</span>
            <span>{match.stageName}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Gamepad2 className="h-3 w-3" />
              {match.game} ({match.platform})
            </Badge>
            <Badge variant={match.status === "LIVE" ? "destructive" : "secondary"}>{label}</Badge>
            <Badge variant="outline">BO{match.bestOf}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 items-center gap-6 py-6 md:grid-cols-7">
          <div className="flex items-center justify-between gap-4 text-left md:col-span-3 md:justify-end md:text-right">
            <div className="order-2 md:order-1">
              <h1 className="text-2xl font-black tracking-tight">{teamAlpha?.name ?? "À déterminer"}</h1>
              <p className="text-xs font-semibold text-amber-500">Équipe A</p>
            </div>
            {teamAlpha?.logoUrl ? (
              <Avatar className="order-1 h-16 w-16 rounded-2xl md:order-2">
                <AvatarImage src={teamAlpha.logoUrl} alt="" />
                <AvatarFallback>{teamAlpha.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            ) : (
              <div className="order-1 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-500 md:order-2">
                <Shield className="h-8 w-8" />
              </div>
            )}
          </div>

          <div className="flex flex-col items-center justify-center md:col-span-1">
            <div className="flex items-center gap-3 rounded-2xl border bg-muted/60 px-5 py-2.5 shadow-inner">
              <span className="font-mono text-3xl font-black text-amber-500">{alphaWins}</span>
              <span className="text-xl font-light text-muted-foreground">:</span>
              <span className="font-mono text-3xl font-black text-blue-500">{betaWins}</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Manches gagnées</p>
          </div>

          <div className="flex items-center justify-between gap-4 md:col-span-3 md:justify-start">
            {teamBeta?.logoUrl ? (
              <Avatar className="h-16 w-16 rounded-2xl">
                <AvatarImage src={teamBeta.logoUrl} alt="" />
                <AvatarFallback>{teamBeta.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-blue-500">
                <Shield className="h-8 w-8" />
              </div>
            )}
            <div>
              <h2 className="text-2xl font-black tracking-tight">{teamBeta?.name ?? "À déterminer"}</h2>
              <p className="text-xs font-semibold text-blue-500">Équipe B</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="space-y-4 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-semibold">Résultats des manches</h2>
              <p className="text-sm text-muted-foreground">Scores officiels enregistrés pour cette rencontre.</p>
            </div>
            {match.canManageMatch && <Badge variant="outline">Gestion du match</Badge>}
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
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                Aucun résultat n’a encore été communiqué.
              </CardContent>
            </Card>
          )}
          {!canEditScores && !match.canManageMatch && (
            <p className="text-xs text-muted-foreground">
              Les scores sont modifiables par l’organisateur, les capitaines et les managers des équipes.
            </p>
          )}
          {!canEditScores && match.canManageMatch && (
            <p className="text-xs text-muted-foreground">Les scores sont verrouillés pour ce match.</p>
          )}
          <div className="pt-4">
            <h3 className="mb-3 flex items-center gap-2 font-semibold">
              <MessageSquare className="h-4 w-4 text-primary" />
              Discussion entre participants
            </h3>
            <MatchChat
              matchId={match.id}
              currentUserId={match.currentUserId}
              canUseChat={match.canUseMatchChat}
            />
          </div>
        </section>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Video className="h-4 w-4 text-rose-500" />
                Diffusion du match
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {match.streamUrl ? (
                <a
                  href={match.streamUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-8 w-full items-center justify-center rounded-lg border border-border bg-background px-2.5 text-sm font-medium transition-colors hover:bg-muted"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Ouvrir la diffusion
                </a>
              ) : (
                <p className="text-sm text-muted-foreground">Aucune diffusion n’est renseignée.</p>
              )}
              {match.canManageBroadcast && (
                <form onSubmit={saveStream} className="space-y-2 border-t pt-3">
                  <label htmlFor="match-stream-url" className="text-sm font-medium">
                    Lien HTTPS de diffusion
                  </label>
                  <Input
                    id="match-stream-url"
                    type="url"
                    inputMode="url"
                    placeholder="https://www.twitch.tv/..."
                    value={streamUrl}
                    onChange={(event) => setStreamUrl(event.target.value)}
                    maxLength={2048}
                    disabled={isSavingStream}
                  />
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" disabled={isSavingStream}>
                      {isSavingStream ? "Enregistrement…" : "Enregistrer"}
                    </Button>
                    {match.streamUrl && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isSavingStream || !streamUrl}
                        onClick={clearStream}
                      >
                        Retirer le lien
                      </Button>
                    )}
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4 text-primary" />
                Informations du match
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                {match.scheduledAt
                  ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(match.scheduledAt))
                  : "Horaire à définir"}
              </p>
              {match.rules ? (
                <div className="border-t pt-3">
                  <p className="mb-1 font-medium">Règlement du tournoi</p>
                  <p className="whitespace-pre-wrap text-muted-foreground">{match.rules}</p>
                </div>
              ) : (
                <p className="border-t pt-3 text-muted-foreground">Aucun règlement de match renseigné.</p>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Compositions des équipes</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <TeamRoster team={teamAlpha} color="amber" />
          <TeamRoster team={teamBeta} color="blue" />
        </div>
      </section>
    </main>
  )
}
