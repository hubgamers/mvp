"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Building2, ArrowLeft, AlertCircle, Shield, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { saveClub } from "@/app/actions/club.actions"

export default function NewStructurePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [recruitOpen, setRecruitOpen] = useState(false)

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
      setError("Veuillez renseigner le nom et l'identifiant du club.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await saveClub({
        name,
        slug,
        description,
        recruit_open: recruitOpen,
        deleted: false,
      })

      if (res.success) {
        router.push(`/dashboard/structures/${(res as any).club?.id || ""}`)
        router.refresh()
      } else {
        setError(res.message)
      }
    } catch (err: any) {
      setError(err?.message || "Une erreur est survenue lors de la création de la structure.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8 max-w-3xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="sm" className="h-9 w-9 p-0 rounded-full border-white/10">
          <Link href="/dashboard/structures">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="size-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              NOUVELLE STRUCTURE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Fonder une organisation esport
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-white/10 bg-card/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-white">Identité de l'organisation</CardTitle>
            <CardDescription className="text-xs">
              Renseignez les détails publics de votre club. Vous en serez automatiquement désigné administrateur.
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
              <Label htmlFor="name" className="text-xs font-semibold">Nom de la structure *</Label>
              <Input
                id="name"
                placeholder="Ex: Solaris Gaming Club"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="bg-black/40 border-white/10"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug" className="text-xs font-semibold">Slug unique *</Label>
              <div className="flex items-center">
                <span className="px-3 py-2 bg-white/5 border border-r-0 border-white/10 rounded-l-md text-xs text-muted-foreground">
                  /clubs/
                </span>
                <Input
                  id="slug"
                  placeholder="solaris-gaming"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="bg-black/40 border-white/10 rounded-l-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs font-semibold">Description / Bio</Label>
              <Textarea
                id="description"
                rows={4}
                placeholder="Présentez l'histoire de la structure, vos ambitions compétitives et vos réseaux..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-black/40 border-white/10 text-xs"
              />
            </div>

            <div className="pt-2 flex items-center gap-3">
              <input
                type="checkbox"
                id="recruit"
                checked={recruitOpen}
                onChange={(e) => setRecruitOpen(e.target.checked)}
                className="size-4 rounded border-white/20 bg-black/40 text-emerald-400 focus:ring-emerald-400"
              />
              <Label htmlFor="recruit" className="text-xs text-slate-300 font-medium cursor-pointer">
                Recrutement ouvert aux nouveaux joueurs et staffs (Club Plus)
              </Label>
            </div>
          </CardContent>

          <CardFooter className="p-6 border-t border-white/10 flex items-center justify-between">
            <Button asChild variant="ghost" className="text-xs text-muted-foreground">
              <Link href="/dashboard/structures">Annuler</Link>
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
            >
              {loading ? "Création en cours..." : "Créer le club"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
