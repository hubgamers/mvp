"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { UserPlus, ArrowLeft, Gamepad2, Mic, Users, AlertCircle, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { saveSquad } from "@/app/actions/squad.actions"

const POPULAR_GAMES = [
  "Valorant",
  "Counter-Strike 2",
  "League of Legends",
  "Rocket League",
  "Apex Legends",
  "Call of Duty: Warzone",
  "Overwatch 2",
  "Fortnite",
  "Rainbow Six Siege",
  "EA Sports FC 25",
]

const SQUAD_TYPES = [
  { code: "RANKED", label: "Compétitif / Ranked (Montée de rang)" },
  { code: "CASUAL", label: "Casual / Détente (Sessions chill)" },
  { code: "SCRIM", label: "Entraînement / Scrim (Matchs sérieux)" },
  { code: "FUN", label: "Fun / Mini-jeux & Créatif" },
]

export default function NewSquadPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState("")
  const [game, setGame] = useState("Valorant")
  const [typeCode, setTypeCode] = useState("RANKED")
  const [platform, setPlatform] = useState("PC")
  const [nbPlaces, setNbPlaces] = useState<number>(5)
  const [microRequired, setMicroRequired] = useState(true)
  const [level, setLevel] = useState("Diamant / Ascendant")
  const [roleSearched, setRoleSearched] = useState("Initiateur / Support")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError("Veuillez donner un nom à votre escouade.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await saveSquad({
        name: name.trim(),
        game,
        type_code: typeCode,
        platform,
        nb_places: Number(nbPlaces) || 5,
        micro_required: microRequired,
        level: level.trim(),
        role_searched: roleSearched.trim(),
      })

      if (res.success) {
        router.push(`/dashboard/squads/${(res as any).squad?.id || ""}`)
        router.refresh()
      } else {
        setError(res.message)
      }
    } catch (err: any) {
      setError(err?.message || "Erreur lors de la création de l'escouade.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8 max-w-3xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="sm" className="h-9 w-9 p-0 rounded-full border-white/10">
          <Link href="/dashboard/squads">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <UserPlus className="size-4 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              RECRUTEMENT LFG
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Créer une Escouade de Jeu
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-white/10 bg-card/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-white">Paramètres du Groupe</CardTitle>
            <CardDescription className="text-xs">
              Définissez les critères de votre session pour trouver des coéquipiers adaptés.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-semibold">Titre de l'annonce / Nom de l'escouade *</Label>
              <Input
                id="name"
                placeholder="Ex: Rush Immortel ce soir - Vocal Discord actif"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-black/40 border-white/10"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="game" className="text-xs font-semibold">Jeu</Label>
                <Input
                  id="game"
                  list="squad-games"
                  value={game}
                  onChange={(e) => setGame(e.target.value)}
                  className="bg-black/40 border-white/10"
                />
                <datalist id="squad-games">
                  {POPULAR_GAMES.map((g) => (
                    <option key={g} value={g} />
                  ))}
                </datalist>
              </div>

              <div className="space-y-2">
                <Label htmlFor="typeCode" className="text-xs font-semibold">Type de session</Label>
                <select
                  id="typeCode"
                  value={typeCode}
                  onChange={(e) => setTypeCode(e.target.value)}
                  className="w-full h-10 px-3 rounded-md bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
                >
                  {SQUAD_TYPES.map((t) => (
                    <option key={t.code} value={t.code}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="platform" className="text-xs font-semibold">Plateforme</Label>
                <select
                  id="platform"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full h-10 px-3 rounded-md bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
                >
                  <option value="PC">PC</option>
                  <option value="Crossplay">Crossplay</option>
                  <option value="PlayStation 5">PlayStation 5</option>
                  <option value="Xbox Series">Xbox Series</option>
                  <option value="Nintendo Switch">Nintendo Switch</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nbPlaces" className="text-xs font-semibold">Nombre total de places</Label>
                <select
                  id="nbPlaces"
                  value={nbPlaces}
                  onChange={(e) => setNbPlaces(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-md bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
                >
                  <option value="2">2 Joueurs (Duo)</option>
                  <option value="3">3 Joueurs (Trio)</option>
                  <option value="4">4 Joueurs (Squad 4)</option>
                  <option value="5">5 Joueurs (Full Team 5v5)</option>
                  <option value="6">6 Joueurs</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="level" className="text-xs font-semibold">Niveau / Rang attendu</Label>
                <Input
                  id="level"
                  placeholder="Ex: Diamant +, Platine, Tous niveaux..."
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="bg-black/40 border-white/10 text-xs"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="roleSearched" className="text-xs font-semibold">Rôle(s) ou profil recherché</Label>
              <Input
                id="roleSearched"
                placeholder="Ex: Main Duelist, Sniper, IGL ou Flex polyvalent"
                value={roleSearched}
                onChange={(e) => setRoleSearched(e.target.value)}
                className="bg-black/40 border-white/10 text-xs"
              />
            </div>

            <div className="pt-2 flex items-center gap-3">
              <input
                type="checkbox"
                id="micro"
                checked={microRequired}
                onChange={(e) => setMicroRequired(e.target.checked)}
                className="size-4 rounded border-white/20 bg-black/40 text-cyan-400 focus:ring-cyan-400"
              />
              <Label htmlFor="micro" className="text-xs text-slate-300 font-medium cursor-pointer flex items-center gap-1.5">
                <Mic className="size-3.5 text-emerald-400" />
                Micro obligatoire et communication vocale (Discord / Vocal en jeu)
              </Label>
            </div>
          </CardContent>

          <CardFooter className="p-6 border-t border-white/10 flex items-center justify-between">
            <Button asChild variant="ghost" className="text-xs text-muted-foreground">
              <Link href="/dashboard/squads">Annuler</Link>
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
            >
              {loading ? "Création en cours..." : "Créer l'escouade et ouvrir les recrutements"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
