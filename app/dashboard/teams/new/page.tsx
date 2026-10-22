"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { UsersRound, ArrowLeft, Gamepad2, AlertCircle, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { saveRoster } from "@/app/actions/roster.actions"

const POPULAR_GAMES = [
  "Valorant",
  "League of Legends",
  "Counter-Strike 2",
  "Rocket League",
  "EA Sports FC 25",
  "Apex Legends",
  "Overwatch 2",
  "Fortnite",
  "Rainbow Six Siege",
]

export default function NewTeamPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [game, setGame] = useState("Valorant")
  const [platform, setPlatform] = useState("PC")

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
      setError("Veuillez renseigner le nom de l'équipe et son tag URL.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await saveRoster({
        name,
        slug,
        game,
        platform,
        deleted: false,
      })

      if (res.success) {
        router.push(`/dashboard/teams/${(res as any).roster?.id || ""}`)
        router.refresh()
      } else {
        setError(res.message)
      }
    } catch (err: any) {
      setError(err?.message || "Erreur lors de la création de la lineup.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8 max-w-3xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="sm" className="h-9 w-9 p-0 rounded-full border-white/10">
          <Link href="/dashboard/teams">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <UsersRound className="size-4 text-purple-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
              NOUVELLE LINEUP
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Créer une équipe compétitive
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-white/10 bg-card/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-white">Informations de la Lineup</CardTitle>
            <CardDescription className="text-xs">
              Configurez le titre de votre équipe, le jeu disputé et la plateforme. Vous serez automatiquement désigné Capitaine.
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
              <Label htmlFor="name" className="text-xs font-semibold">Nom de l'équipe *</Label>
              <Input
                id="name"
                placeholder="Ex: Solaris Phoenix"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="bg-black/40 border-white/10"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug" className="text-xs font-semibold">Identifiant Slug URL *</Label>
              <Input
                id="slug"
                placeholder="solaris-phoenix"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="bg-black/40 border-white/10 font-mono text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="game" className="text-xs font-semibold">Jeu principal</Label>
                <Input
                  id="game"
                  list="team-games"
                  value={game}
                  onChange={(e) => setGame(e.target.value)}
                  placeholder="Choisir ou saisir"
                  className="bg-black/40 border-white/10"
                />
                <datalist id="team-games">
                  {POPULAR_GAMES.map((g) => (
                    <option key={g} value={g} />
                  ))}
                </datalist>
              </div>

              <div className="space-y-2">
                <Label htmlFor="platform" className="text-xs font-semibold">Plateforme de jeu</Label>
                <select
                  id="platform"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full h-10 px-3 rounded-md bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  <option value="PC">PC (Windows)</option>
                  <option value="Crossplay">Crossplay (Multiplateforme)</option>
                  <option value="PlayStation 5">PlayStation 5</option>
                  <option value="Xbox Series">Xbox Series</option>
                  <option value="Nintendo Switch">Nintendo Switch</option>
                </select>
              </div>
            </div>
          </CardContent>

          <CardFooter className="p-6 border-t border-white/10 flex items-center justify-between">
            <Button asChild variant="ghost" className="text-xs text-muted-foreground">
              <Link href="/dashboard/teams">Annuler</Link>
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
            >
              {loading ? "Création..." : "Enregistrer la lineup"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
