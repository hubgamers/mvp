"use client"

import { useState } from "react"
import { Copy, Check, Tv, ExternalLink, Settings2, Palette, Eye, Play, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface StudioClientProps {
  studio: any
  availableTournaments: any[]
}

export function StudioClient({ studio, availableTournaments }: StudioClientProps) {
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const config = studio.studio_scenes_config?.[0] || {
    primary_color: "#00F0FF",
    secondary_color: "#A855F7",
    font_family: "Inter",
  }

  const [primaryColor, setPrimaryColor] = useState(config.primary_color || "#00F0FF")
  const [secondaryColor, setSecondaryColor] = useState(config.secondary_color || "#A855F7")

  const origin = typeof window !== "undefined" ? window.location.origin : "https://hubgamers.pro"

  const copyOverlayUrl = (token: string) => {
    const url = `${origin}/overlays/${token}`
    navigator.clipboard.writeText(url)
    setCopiedToken(token)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Colonne gauche (2/3) : Liste des Overlays */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="border-white/10 bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <Tv className="size-4 text-cyan-400" />
              Overlays OBS Disponibles (Browser Sources)
            </CardTitle>
            <CardDescription className="text-xs">
              Ajoutez une source "Navigateur" dans OBS Studio avec une résolution de 1920x1080 et collez l'URL.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {studio.studio_overlays?.map((overlay: any) => {
              const fullUrl = `${origin}/overlays/${overlay.access_token}`
              return (
                <div
                  key={overlay.id}
                  className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-white">
                        {overlay.overlay_types?.label || overlay.type_code}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Type : <code className="text-cyan-400">{overlay.type_code}</code>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/20 bg-emerald-500/10">
                      Actif · Temps réel
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <Input
                      readOnly
                      value={fullUrl}
                      className="bg-black/60 border-white/10 font-mono text-xs text-slate-300 h-9"
                    />
                    <Button
                      size="sm"
                      onClick={() => copyOverlayUrl(overlay.access_token)}
                      className="h-9 px-3 shrink-0 bg-white/10 hover:bg-white/20 text-white text-xs"
                    >
                      {copiedToken === overlay.access_token ? (
                        <>
                          <Check className="size-3.5 mr-1 text-emerald-400" />
                          Copié !
                        </>
                      ) : (
                        <>
                          <Copy className="size-3.5 mr-1" />
                          Copier l'URL
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Colonne droite (1/3) : Paramètres du flux & Couleurs */}
      <div className="space-y-6">
        <Card className="border-white/10 bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <Palette className="size-4 text-purple-400" />
              Charte Graphique du Stream
            </CardTitle>
            <CardDescription className="text-xs">
              Personnalisez les couleurs appliquées aux bandeaux de score et à l'arbre.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Couleur Primaire (Scoreboard)</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="size-9 rounded cursor-pointer bg-transparent border-0"
                />
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="bg-black/40 border-white/10 font-mono text-xs"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Couleur Secondaire (Accents)</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="size-9 rounded cursor-pointer bg-transparent border-0"
                />
                <Input
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="bg-black/40 border-white/10 font-mono text-xs"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs">
                Enregistrer le style OBS
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-gradient-to-br from-cyan-950/20 to-black/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="size-4 text-cyan-400" />
              Guide d'intégration
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-300 space-y-2">
            <p>1. Lancez <strong>OBS Studio</strong> ou <strong>Streamlabs</strong>.</p>
            <p>2. Cliquez sur <strong>+</strong> dans vos sources et choisissez <strong>Navigateur</strong>.</p>
            <p>3. Collez l'URL de l'overlay souhaité.</p>
            <p>4. Définissez la taille à <strong>1920</strong> en largeur et <strong>1080</strong> en hauteur.</p>
            <p>5. Cochez <em>"Rafraîchir le navigateur lorsque la scène devient active"</em>.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
