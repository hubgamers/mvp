"use client"

import { useState } from "react"
import { Building, Plus, Globe, Image as ImageIcon, Trash2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TabsContent } from "@/components/ui/tabs"
import { saveSponsor, deleteTournamentSponsor } from "@/app/actions/sponsor.actions" // Ajuste le chemin selon ton arborescence

export function TournamentSponsorsTab({ tournament, currentUserId }: { tournament: any; currentUserId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Stocke le sponsor sélectionné pour l'édition (null si création)
  const [selectedSponsor, setSelectedSponsor] = useState<any | null>(null)

  // Ouvre la modale pour l'ajout
  const handleOpenCreate = () => {
    setSelectedSponsor(null)
    setIsOpen(true)
  }

  // Ouvre la modale pour l'édition avec les données existantes
  const handleOpenEdit = (ts: any) => {
    setSelectedSponsor({
      id: ts.sponsors.id,
      name: ts.sponsors.name,
      logo_url: ts.sponsors.logo_url,
      website_url: ts.sponsors.website_url || "",
      tier: ts.tier || ""
    })
    setIsOpen(true)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)

    const name = formData.get("name")?.toString() || ""
    const logo_url = formData.get("logo_url")?.toString() || ""
    const website_url = formData.get("website_url")?.toString() || ""
    const tier = formData.get("tier")?.toString() || ""

    if (!name || !logo_url) {
      setIsLoading(false)
      return
    }

    try {
      const data = {
        id: selectedSponsor?.id, // ID du sponsor si on édite
        tournamentId: tournament.id,
        name,
        logo_url,
        website_url,
        tier
      }

      const res = await saveSponsor(data)

      if (res.success) {
        setIsOpen(false)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete() {
    if (!selectedSponsor?.id) return
    if (!confirm("Voulez-vous vraiment retirer ce sponsor du tournoi ?")) return

    setIsLoading(true)
    try {
      const res = await deleteTournamentSponsor(tournament.id, selectedSponsor.id)
      if (res.success) {
        setIsOpen(false)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  // Vérifier si l'utilisateur est membre du staff
  const userMembership = tournament.tournaments_members.find((m) => m.user_id === currentUserId)
  const isStaff = !!userMembership
  const isAdmin = userMembership?.role_code === "ADMIN" // ou "admin" selon ta base de données

  return (
    <TabsContent value="sponsors" className="space-y-4">
      <Card className="border-white/10 bg-card/60 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-white">Sponsors et partenaires</CardTitle>
            <CardDescription className="text-xs">
              Logos et marques affichés sur vos pages et overlays OBS.
            </CardDescription>
          </div>

          {isAdmin && (
            <Button size="sm" onClick={handleOpenCreate}>
              <Plus className="size-4" />
              Ajouter un sponsor
            </Button>
          )}
        </CardHeader>

        <CardContent>
          {tournament.tournament_sponsors.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-xs border border-dashed border-white/10 rounded-xl">
              Aucun sponsor rattaché à ce tournoi.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {tournament.tournament_sponsors.map((ts: any) => (
                <div
                  key={ts.sponsor_id}
                  onClick={() => handleOpenEdit(ts)}
                  className="p-4 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between gap-3 cursor-pointer hover:border-white/20 transition-all group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    {ts.sponsors.logo_url ? (
                      <img
                        src={ts.sponsors.logo_url}
                        alt={ts.sponsors.name}
                        className="size-10 object-contain rounded-lg bg-white/5 p-1 shrink-0"
                      />
                    ) : (
                      <Building className="size-6 text-amber-400 shrink-0" />
                    )}
                    <div className="overflow-hidden">
                      <div className="font-bold text-sm text-white truncate">{ts.sponsors.name}</div>
                      <div className="text-[11px] text-muted-foreground truncate">{ts.tier || "Partenaire"}</div>
                    </div>
                  </div>
                  <Edit className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modale unique gérant l'Ajout et l'Édition */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px] border-white/10 bg-card text-card-foreground">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-white">
                {selectedSponsor ? "Modifier le sponsor" : "Ajouter un sponsor"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {selectedSponsor
                  ? "Mettez à jour les informations ou retirez ce sponsor du tournoi."
                  : "Renseignez les informations de la marque ou du partenaire pour ce tournoi."}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-medium text-white">Nom du sponsor</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    defaultValue={selectedSponsor?.name || ""}
                    placeholder="ex: Logitech G"
                    required
                    className="pl-9 bg-black/20 border-white/10 text-white text-xs"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tier" className="text-xs font-medium text-white">Niveau de partenariat (Tier)</Label>
                <Input
                  id="tier"
                  name="tier"
                  defaultValue={selectedSponsor?.tier || ""}
                  placeholder="ex: Sponsor Platinum, Partenaire officiel..."
                  className="bg-black/20 border-white/10 text-white text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo_url" className="text-xs font-medium text-white">URL du Logo</Label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    id="logo_url"
                    name="logo_url"
                    type="url"
                    defaultValue={selectedSponsor?.logo_url || ""}
                    placeholder="https://example.com/logo.png"
                    required
                    className="pl-9 bg-black/20 border-white/10 text-white text-xs"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website_url" className="text-xs font-medium text-white">Site Web (Optionnel)</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    id="website_url"
                    name="website_url"
                    type="url"
                    defaultValue={selectedSponsor?.website_url || ""}
                    placeholder="https://brand.com"
                    className="pl-9 bg-black/20 border-white/10 text-white text-xs"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="flex justify-between items-center sm:justify-between">
              {selectedSponsor ? (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isLoading}
                >
                  <Trash2 className="size-4 mr-1.5" />
                  Supprimer
                </Button>
              ) : <div />}

              <div className="flex gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" size="sm" disabled={isLoading}>
                  {isLoading ? "Enregistrement..." : (selectedSponsor ? "Mettre à jour" : "Enregistrer")}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </TabsContent>
  )
}