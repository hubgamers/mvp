"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Trophy,
  ArrowLeft,
  Gamepad2,
  Calendar,
  Users,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { saveTournament } from "@/app/actions/tournament.actions"

interface Game {
  id: string
  name: string
}

interface NewTournamentFormProps {
  gamesList: Game[]
}

export default function NewTournamentForm({ gamesList }: NewTournamentFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [game, setGame] = useState(gamesList[0]?.id || "")
  const [format, setFormat] = useState("5v5 Élimination Directe")
  const [platform, setPlatform] = useState("PC")
  const [cashprize, setCashprize] = useState<number>(500)
  const [entryFee, setEntryFee] = useState("Gratuit")
  const [nbRoster, setNbRoster] = useState<number>(16)
  const [checkinEnabled, setCheckinEnabled] = useState(true)
  const [statusCode] = useState("REGISTRATION")

  // Dates par défaut
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  const [regStart, setRegStart] = useState(new Date().toISOString().slice(0, 16))
  const [regEnd, setRegEnd] = useState(tomorrow)
  const [startAt, setStartAt] = useState(nextWeek)

  const handleNameChange = (val: string) => {
    setName(val)
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
    setSlug(generatedSlug)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !slug) {
      setError("Veuillez renseigner le titre et l'identifiant URL.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await saveTournament({
        name,
        slug,
        game_id: game,
        status_code: statusCode,
        format,
        platform,
        cashprize: Number(cashprize) || 0,
        prix_entree: entryFee,
        nb_rosters: Number(nbRoster) || 16,
        checkin_enabled: checkinEnabled,
        checkin_start_at: new Date(regEnd),
        checkin_end_at: new Date(startAt),
        registration_start_at: new Date(regStart),
        registration_end_at: new Date(regEnd),
        start_at: new Date(startAt),
        end_at: new Date(new Date(startAt).getTime() + 24 * 60 * 60 * 1000),
      })

      if (res.success) {
        router.push(`/dashboard/tournaments/${(res as any).tournament?.id || ""}`)
        router.refresh()
      } else {
        setError(res.message)
      }
    } catch (err: any) {
      setError(err?.message || "Une erreur est survenue lors de la création du tournoi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8 max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="sm" className="h-9 w-9 p-0 rounded-full border-white/10">
          <Link href="/dashboard/tournaments">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="size-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              NOUVELLE COMPÉTITION
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Créer un tournoi officiel
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Section 1 : Informations Générales */}
        <Card className="border-white/10 bg-card/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <Gamepad2 className="size-4 text-cyan-400" />
              Identité du Tournoi
            </CardTitle>
            <CardDescription className="text-xs">
              Définissez le nom, le jeu et le slug public de votre événement.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-semibold">Titre du tournoi *</Label>
                <Input
                  id="name"
                  placeholder="Ex: HubGamers Masters Cup #1"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="bg-black/40 border-white/10 focus-visible:ring-cyan-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug" className="text-xs font-semibold">Slug URL unique *</Label>
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-white/5 border border-r-0 border-white/10 rounded-l-md text-xs text-muted-foreground">
                    /tournaments/
                  </span>
                  <Input
                    id="slug"
                    placeholder="hubgamers-masters-cup-1"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="bg-black/40 border-white/10 rounded-l-none focus-visible:ring-cyan-400"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="game" className="text-xs font-semibold">Jeu</Label>
              <select
                id="game"
                value={game}
                onChange={(e) => setGame(e.target.value)}
                className="w-full h-10 px-3 rounded-md bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <option value="" disabled>Sélectionner un jeu</option>
                {gamesList?.map((gameItem) => (
                  <option key={gameItem.id} value={gameItem.id}>
                    {gameItem.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="platform" className="text-xs font-semibold">Plateforme</Label>
              <select
                id="platform"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full h-10 px-3 rounded-md bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <option value="PC">PC (Windows)</option>
                <option value="Crossplay">Crossplay (PC & Consoles)</option>
                <option value="PlayStation 5">PlayStation 5</option>
                <option value="Xbox Series">Xbox Series X/S</option>
                <option value="Nintendo Switch">Nintendo Switch</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="format" className="text-xs font-semibold">Format du tournoi</Label>
              <select
                id="format"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full h-10 px-3 rounded-md bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <option value="5v5 Élimination Directe">5v5 Élimination Directe</option>
                <option value="5v5 Double Élimination">5v5 Double Élimination</option>
                <option value="3v3 Arbre à élimination">3v3 Arbre à élimination</option>
                <option value="2v2 Duo Cup">2v2 Duo Cup</option>
                <option value="1v1 Showdown">1v1 Showdown</option>
                <option value="Phase de poules + Arbre final">Phase de poules + Arbre final</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Section 2 : Configuration compétitive */}
        <Card className="border-white/10 bg-card/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <Users className="size-4 text-purple-400" />
              Capacité & Récompenses
            </CardTitle>
            <CardDescription className="text-xs">
              Nombre d'équipes et dotation monétaire du tournoi.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nbRoster" className="text-xs font-semibold">Nombre d'équipes max</Label>
                <select
                  id="nbRoster"
                  value={nbRoster}
                  onChange={(e) => setNbRoster(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-md bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  <option value="4">4 Équipes</option>
                  <option value="8">8 Équipes</option>
                  <option value="16">16 Équipes</option>
                  <option value="32">32 Équipes</option>
                  <option value="64">64 Équipes</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cashprize" className="text-xs font-semibold">Cashprize total (€)</Label>
                <Input
                  id="cashprize"
                  type="number"
                  min="0"
                  step="10"
                  value={cashprize}
                  onChange={(e) => setCashprize(Number(e.target.value))}
                  className="bg-black/40 border-white/10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="entryFee" className="text-xs font-semibold">Frais d'inscription</Label>
                <Input
                  id="entryFee"
                  value={entryFee}
                  onChange={(e) => setEntryFee(e.target.value)}
                  placeholder="Ex: Gratuit ou 10€ par joueur"
                  className="bg-black/40 border-white/10"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <input
                type="checkbox"
                id="checkin"
                checked={checkinEnabled}
                onChange={(e) => setCheckinEnabled(e.target.checked)}
                className="size-4 rounded border-white/20 bg-black/40 text-cyan-400 focus:ring-cyan-400"
              />
              <Label htmlFor="checkin" className="text-xs text-slate-300 font-medium cursor-pointer">
                Activer la période de Check-in obligatoire 45 minutes avant le début des matchs
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Section 3 : Calendrier */}
        <Card className="border-white/10 bg-card/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="size-4 text-emerald-400" />
              Dates Clés du Tournoi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="regStart" className="text-xs font-semibold">Ouverture des inscriptions</Label>
                <Input
                  id="regStart"
                  type="datetime-local"
                  value={regStart}
                  onChange={(e) => setRegStart(e.target.value)}
                  className="bg-black/40 border-white/10 text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="regEnd" className="text-xs font-semibold">Clôture des inscriptions</Label>
                <Input
                  id="regEnd"
                  type="datetime-local"
                  value={regEnd}
                  onChange={(e) => setRegEnd(e.target.value)}
                  className="bg-black/40 border-white/10 text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startAt" className="text-xs font-semibold">Lancement du tournoi</Label>
                <Input
                  id="startAt"
                  type="datetime-local"
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                  className="bg-black/40 border-white/10 text-xs"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-6 border-t border-white/10 flex items-center justify-between">
            <Button asChild variant="ghost" className="text-xs text-muted-foreground">
              <Link href="/dashboard/tournaments">Annuler</Link>
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black shadow-lg"
            >
              {loading ? "Création en cours..." : "Créer le tournoi et ouvrir le bracket"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}