"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Gamepad2, Plus, Trash2, CheckCircle2, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { saveGameAccount, removeGameAccount } from "@/app/actions/game-account.actions"

interface UserGameAccountsClientProps {
  accounts: any[]
}

const COMMON_GAMES = [
  "Valorant",
  "League of Legends",
  "Counter-Strike 2",
  "Rocket League",
  "EA Sports FC 25",
  "Apex Legends",
  "Overwatch 2",
]

export function UserGameAccountsClient({ accounts }: UserGameAccountsClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [game, setGame] = useState("Valorant")
  const [inGameName, setInGameName] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!game || !inGameName.trim()) return

    setLoading(true)
    setError(null)

    try {
      const res = await saveGameAccount({
        game,
        in_game_name: inGameName.trim(),
      })

      if (res.success) {
        setShowAddForm(false)
        setInGameName("")
        router.refresh()
      } else {
        setError(res.message)
      }
    } catch (err: any) {
      setError(err?.message || "Erreur lors de l'enregistrement.")
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (id: string) => {
    if (!confirm("Voulez-vous supprimer ce compte de jeu ?")) return
    setLoading(true)
    try {
      await removeGameAccount(id)
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {accounts.length === 0 ? (
        <div className="text-center py-6 text-xs text-muted-foreground border border-dashed border-white/10 rounded-xl bg-black/20">
          Aucun compte de jeu enregistré. Ajoutez votre premier pseudo pour pouvoir rejoindre des compétitions.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between"
            >
              <div>
                <span className="text-[10px] uppercase font-mono text-cyan-400 font-bold block">
                  {acc.game}
                </span>
                <span className="text-sm font-bold text-white block mt-0.5">
                  {acc.in_game_name}
                </span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
                  <CheckCircle2 className="size-3" /> Certifié
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(acc.id)}
                disabled={loading}
                className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {showAddForm ? (
        <form onSubmit={handleAddAccount} className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-4">
          <div className="text-xs font-bold text-white">Ajouter un nouveau compte compétitif</div>

          {error && (
            <div className="p-2.5 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="size-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Titre du jeu</Label>
              <select
                value={game}
                onChange={(e) => setGame(e.target.value)}
                className="w-full h-9 px-3 rounded-md bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
              >
                {COMMON_GAMES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Pseudo en jeu (Riot ID avec #, Steam, PSN...)</Label>
              <Input
                placeholder="Ex: Faker#EUW ou S1mple"
                value={inGameName}
                onChange={(e) => setInGameName(e.target.value)}
                className="bg-black/60 border-white/10 text-xs h-9 focus-visible:ring-cyan-400"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAddForm(false)}
              className="text-xs"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
            >
              {loading ? <Loader2 className="size-3.5 animate-spin mr-1" /> : <Plus className="size-3.5 mr-1" />}
              Enregistrer le compte
            </Button>
          </div>
        </form>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAddForm(true)}
          className="text-xs border-white/10 hover:border-white/20"
        >
          <Plus className="size-3.5 mr-1 text-cyan-400" />
          Lier un nouveau compte de jeu
        </Button>
      )}
    </div>
  )
}
