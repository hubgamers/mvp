"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, AlertTriangle, Shield, Trophy, Loader2, Sparkles, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  updateMatchScore,
  matchCheckIn,
  openMatchDispute,
  resolveMatchDispute,
} from "@/app/actions/match.actions"

interface MatchDetailClientProps {
  match: any
  canManageScore: boolean
  isRoster1Captain: boolean
  isRoster2Captain: boolean
  isArbiter: boolean
}

export function MatchDetailClient({
  match,
  canManageScore,
  isRoster1Captain,
  isRoster2Captain,
  isArbiter,
}: MatchDetailClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [disputeReason, setDisputeReason] = useState("")
  const [showDisputeForm, setShowDisputeForm] = useState(false)

  // Scores de manche
  const initialGames = match.tournaments_match_games?.length > 0
    ? match.tournaments_match_games
    : [
        { game_number: 1, roster1_score: 0, roster2_score: 0, map_name: "Map 1", winner_roster_id: "" },
      ]

  const [games, setGames] = useState<any[]>(initialGames)
  const [selectedWinnerId, setSelectedWinnerId] = useState(match.winner_roster_id || "")

  // Check-in
  const handleCheckIn = async (rosterNum: 1 | 2) => {
    setLoading(true)
    try {
      await matchCheckIn(match.id, rosterNum)
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Enregistrer le score
  const handleSaveScore = async () => {
    setLoading(true)
    try {
      await updateMatchScore({
        match_id: match.id,
        winner_roster_id: selectedWinnerId || undefined,
        status_code: selectedWinnerId ? "COMPLETED" : "LIVE",
        games: games.map((g, idx) => ({
          game_number: idx + 1,
          roster1_score: Number(g.roster1_score) || 0,
          roster2_score: Number(g.roster2_score) || 0,
          winner_roster_id: g.winner_roster_id || undefined,
          map_name: g.map_name || `Map ${idx + 1}`,
        })),
      })
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Ouvrir un litige
  const handleOpenDispute = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!disputeReason.trim()) return
    setLoading(true)
    try {
      await openMatchDispute({
        match_id: match.id,
        reason: disputeReason.trim(),
      })
      setShowDisputeForm(false)
      setDisputeReason("")
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const addGame = () => {
    setGames([
      ...games,
      {
        game_number: games.length + 1,
        roster1_score: 0,
        roster2_score: 0,
        map_name: `Map ${games.length + 1}`,
        winner_roster_id: "",
      },
    ])
  }

  const updateGameScore = (index: number, field: string, value: any) => {
    const updated = [...games]
    updated[index] = { ...updated[index], [field]: value }
    setGames(updated)
  }

  const roster1 = match.rosters_tournaments_matches_roster1_idTorosters
  const roster2 = match.rosters_tournaments_matches_roster2_idTorosters

  return (
    <div className="space-y-6">
      {/* Barre d'action Check-in si pas encore validé */}
      {(isRoster1Captain && !match.roster1_checked_in) || (isRoster2Captain && !match.roster2_checked_in) ? (
        <Card className="border-cyan-400/30 bg-cyan-950/20 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-bold text-white text-sm block">Action requise : Check-in de présence</span>
              <span className="text-xs text-slate-300">Confirmez que votre effectif est connecté et prêt à jouer.</span>
            </div>
            {isRoster1Captain && !match.roster1_checked_in && (
              <Button
                onClick={() => handleCheckIn(1)}
                disabled={loading}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
              >
                Confirmer le Check-in de {roster1?.name}
              </Button>
            )}
            {isRoster2Captain && !match.roster2_checked_in && (
              <Button
                onClick={() => handleCheckIn(2)}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
              >
                Confirmer le Check-in de {roster2?.name}
              </Button>
            )}
          </div>
        </Card>
      ) : null}

      {/* Litiges ouverts */}
      {match.match_disputes?.length > 0 && (
        <Card className="border-red-500/30 bg-red-950/20 p-5 space-y-3">
          <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
            <AlertTriangle className="size-4 shrink-0" />
            <span>Litige déclaré sur ce match</span>
          </div>
          {match.match_disputes.map((dispute: any) => (
            <div key={dispute.id} className="p-3 rounded-lg bg-black/40 border border-red-500/20 text-xs space-y-1">
              <div className="flex justify-between font-semibold text-white">
                <span>Signalé par : {dispute.users_match_disputes_opened_by_user_idTousers?.display_name || "Un joueur"}</span>
                <Badge variant="outline" className="text-[10px] uppercase text-red-400 border-red-500/30">
                  {dispute.dispute_statuses?.label || dispute.status_code}
                </Badge>
              </div>
              <p className="text-slate-300">{dispute.reason}</p>
            </div>
          ))}
        </Card>
      )}

      {/* Grille des manches et scores */}
      <Card className="border-white/10 bg-card/60 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <Trophy className="size-4 text-amber-400" />
              Saisie des Scores & Manches
            </CardTitle>
            <CardDescription className="text-xs">
              Déclarez les scores de chaque carte. Les résultats sont vérifiés par l'adversaire ou l'arbitre officiel.
            </CardDescription>
          </div>
          {canManageScore && (
            <Button size="sm" variant="outline" onClick={addGame} className="text-xs border-white/10">
              <Plus className="size-3 mr-1" />
              Ajouter une manche
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {games.map((game, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-black/30 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-xs font-mono">
                    Manche {idx + 1}
                  </Badge>
                  <Input
                    disabled={!canManageScore}
                    value={game.map_name || ""}
                    onChange={(e) => updateGameScore(idx, "map_name", e.target.value)}
                    placeholder="Nom de la carte (ex: Ascent)"
                    className="w-40 bg-black/40 border-white/10 text-xs h-8"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-cyan-400 truncate max-w-[100px]">
                      {roster1?.name || "R1"} :
                    </span>
                    <Input
                      type="number"
                      min="0"
                      disabled={!canManageScore}
                      value={game.roster1_score}
                      onChange={(e) => updateGameScore(idx, "roster1_score", e.target.value)}
                      className="w-16 h-8 text-center bg-black/40 border-white/10 font-bold"
                    />
                  </div>

                  <span className="text-xs text-muted-foreground font-mono">-</span>

                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      disabled={!canManageScore}
                      value={game.roster2_score}
                      onChange={(e) => updateGameScore(idx, "roster2_score", e.target.value)}
                      className="w-16 h-8 text-center bg-black/40 border-white/10 font-bold"
                    />
                    <span className="text-xs font-bold text-purple-400 truncate max-w-[100px]">
                      : {roster2?.name || "R2"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {canManageScore && (
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Label className="text-xs font-semibold text-slate-300">Désigner l'équipe gagnante :</Label>
                <select
                  value={selectedWinnerId}
                  onChange={(e) => setSelectedWinnerId(e.target.value)}
                  className="h-8 px-2 rounded bg-black/40 border border-white/10 text-xs text-white"
                >
                  <option value="">Sélectionner le vainqueur</option>
                  {roster1 && <option value={roster1.id}>{roster1.name}</option>}
                  {roster2 && <option value={roster2.id}>{roster2.name}</option>}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleSaveScore}
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  {loading ? <Loader2 className="size-3.5 animate-spin mr-1" /> : <Check className="size-3.5 mr-1" />}
                  Valider les scores
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Litige & Contestation */}
      <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-black/20 text-xs">
        <div>
          <span className="font-bold text-white block">Un litige sur ce match ?</span>
          <span className="text-muted-foreground">En cas de problème technique, score erroné ou comportement illégal.</span>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowDisputeForm(!showDisputeForm)}
          className="text-xs border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
        >
          <AlertTriangle className="size-3.5 mr-1" />
          Ouvrir un litige
        </Button>
      </div>

      {showDisputeForm && (
        <form onSubmit={handleOpenDispute} className="p-4 rounded-xl border border-amber-500/30 bg-black/60 space-y-3">
          <Label htmlFor="disputeReason" className="text-xs font-semibold text-white">
            Motif précis de la contestation :
          </Label>
          <Input
            id="disputeReason"
            placeholder="Expliquez la situation, la manche concernée ou le problème rencontré..."
            value={disputeReason}
            onChange={(e) => setDisputeReason(e.target.value)}
            className="bg-black/40 border-white/10 text-xs"
            required
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowDisputeForm(false)}
              className="text-xs"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
            >
              Transmettre à l'arbitre
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
