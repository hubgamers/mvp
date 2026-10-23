"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Layers, Pencil, Trash2, Settings } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { saveTournamentStage, removeTournamentStage } from "@/app/actions/tournament-stage.actions"
import { StageManagerModal } from "./StageManagerModal"
import { toast } from "sonner"

interface TournamentStagesTabProps {
  tournament: any
  stageTypes: { code: string; label: string }[]
  boOptions: { code: string; label: string }[]
  stageStatuses: { code: string; label: string }[]
  isStaff: boolean
}

export function TournamentStagesTab({
  tournament,
  stageTypes,
  boOptions,
  stageStatuses,
  isStaff,
}: TournamentStagesTabProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // États pour la création/modification d'une étape
  const [selectedStage, setSelectedStage] = useState<any | null>(null)

  // État pour ouvrir le popup de gestion de la phase (Poules / Bracket)
  const [managingStage, setManagingStage] = useState<any | null>(null)

  const handleOpenCreate = () => {
    setSelectedStage(null)
    setIsOpen(true)
  }

  const handleOpenEdit = (stage: any) => {
    setSelectedStage(stage)
    setIsOpen(true)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    const payload = {
      id: selectedStage?.id,
      tournament_id: tournament.id,
      name: (formData.get("name") as string) || "Phase de compétition",
      type_code: formData.get("type_code") as string,
      status_code: (formData.get("status_code") as string) || "PENDING",
      nb_team: formData.get("nb_team") ? parseInt(formData.get("nb_team") as string) : 0,
      bo_code: formData.get("bo_code") as string,
    }

    const result = await saveTournamentStage(payload)
    setLoading(false)

    if (result.success) {
      toast.success(result.message)
      setIsOpen(false)
      router.refresh()
    } else {
      toast.error(result.message)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Voulez-vous vraiment supprimer cette étape ?")) return

    const result = await removeTournamentStage(id)
    if (result.success) {
      toast.success(result.message)
      router.refresh()
    } else {
      toast.error(result.message)
    }
  }

  return (
    <div className="space-y-4">
      <Card className="border-white/10 bg-card/60 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="size-4 text-cyan-400" />
              Phases de compétition
            </CardTitle>
            <CardDescription className="text-xs">
              Arbres d'élimination et formats de match définis pour ce tournoi.
            </CardDescription>
          </div>

          {isStaff && (
            <Button onClick={handleOpenCreate} size="sm" className="bg-cyan-500 text-slate-950 hover:bg-cyan-400">
              <Plus className="size-4 mr-1.5" />
              Ajouter une étape
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {tournament.tournaments_stages.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-xs">
              Aucune étape configurée. Ajoutez un arbre d'élimination directe ou double élimination.
            </div>
          ) : (
            <div className="space-y-4">
              {tournament.tournaments_stages.map((stage: any) => (
                <div
                  key={stage.id}
                  className="p-4 rounded-xl bg-black/30 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[10px]">
                        {stage.tournament_stage_types?.label || stage.type_code}
                      </Badge>
                      <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[10px]">
                        {stage.bo_options?.label || stage.bo_code}
                      </Badge>
                      {stage.nb_team > 0 && (
                        <Badge variant="secondary" className="text-[10px]">
                          {stage.nb_team} équipes
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-bold text-white text-sm">{stage.name || "Phase Principale"}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {stage.tournaments_matches?.length || 0} matchs générés dans cette étape
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-xs">
                      {stage.tournament_stage_statuses?.label || stage.status_code}
                    </Badge>

                    {isStaff && (
                      <div className="flex items-center gap-2 border-l border-white/10 pl-3">
                        {/* Bouton pour ouvrir le gestionnaire de phase */}
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-white/10 text-xs gap-1.5 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300"
                          onClick={() => setManagingStage(stage)}
                        >
                          <Settings className="size-3.5" />
                          Gérer
                        </Button>

                        {stage.status_code === 'PENDING' && (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-slate-300 hover:text-white hover:bg-white/10"
                              onClick={() => handleOpenEdit(stage)}
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              onClick={() => handleDelete(stage.id)}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal unique pour Créer / Modifier l'étape */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px] bg-slate-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>
              {selectedStage ? "Modifier l'étape" : "Ajouter une phase de compétition"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              {selectedStage ? "Mettez à jour les paramètres de cette étape." : "Configurez une nouvelle étape (ex: Phase de groupes, Playoffs)."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs">Nom de l'étape</Label>
              <Input 
                id="name" 
                name="name" 
                defaultValue={selectedStage?.name || ""}
                placeholder="Ex: Quarts de finale, Poule A" 
                className="bg-black/30 border-white/10 text-xs" 
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="type_code" className="text-xs">Type d'étape</Label>
              <select
                id="type_code"
                name="type_code"
                required
                defaultValue={selectedStage?.type_code || ""}
                className="w-full h-9 rounded-md bg-black/30 border border-white/10 px-3 text-xs text-white outline-none focus:border-cyan-500"
              >
                <option value="" disabled>Sélectionner un type</option>
                {stageTypes.map((type) => (
                  <option key={type.code} value={type.code} className="bg-slate-900">
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bo_code" className="text-xs">Format de match (BO)</Label>
              <select
                id="bo_code"
                name="bo_code"
                required
                defaultValue={selectedStage?.bo_code || ""}
                className="w-full h-9 rounded-md bg-black/30 border border-white/10 px-3 text-xs text-white outline-none focus:border-cyan-500"
              >
                <option value="" disabled>Sélectionner un format</option>
                {boOptions.map((bo) => (
                  <option key={bo.code} value={bo.code} className="bg-slate-900">
                    {bo.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nb_team" className="text-xs">Nombre d'équipes</Label>
              <Input 
                id="nb_team" 
                name="nb_team" 
                type="number" 
                defaultValue={selectedStage?.nb_team || ""}
                placeholder="Ex: 8, 16" 
                className="bg-black/30 border-white/10 text-xs" 
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status_code" className="text-xs">Statut</Label>
              <select
                id="status_code"
                name="status_code"
                defaultValue={selectedStage?.status_code || "PENDING"}
                className="w-full h-9 rounded-md bg-black/30 border border-white/10 px-3 text-xs text-white outline-none focus:border-cyan-500"
              >
                {stageStatuses.map((status) => (
                  <option key={status.code} value={status.code} className="bg-slate-900">
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <DialogFooter className="pt-4">
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-cyan-500 text-slate-950 hover:bg-cyan-400 text-xs font-semibold"
              >
                {loading ? "Enregistrement..." : selectedStage ? "Mettre à jour" : "Créer l'étape"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Intégration du Modal de Gestion de Phase (Poules / Bracket) */}
      {managingStage && (
        <StageManagerModal
          stage={managingStage}
          tournament={tournament}
          isOpen={!!managingStage}
          onClose={() => setManagingStage(null)}
        />
      )}
    </div>
  )
}