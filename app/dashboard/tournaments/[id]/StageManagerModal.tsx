"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Users, Shuffle, Play, Trash2 } from "lucide-react"
import { generateStageMatches } from "@/app/actions/tournament-stage.actions"

interface StageManagerModalProps {
    stage: any
    tournament: any
    isOpen: boolean
    onClose: () => void
}

export function StageManagerModal({ stage, tournament, isOpen, onClose }: StageManagerModalProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [nbGroups, setNbGroups] = useState(2)

    // Récupérer toutes les équipes confirmées du tournoi (statut CONFIRMED)
    const allAcceptedTeams = tournament.tournaments_registrations?.filter(
        (reg: any) => reg.status_code === "CONFIRMED"
    ).map((reg: any) => reg.rosters) || []

    // Équipes sélectionnées pour cette étape
    const [selectedTeams, setSelectedTeams] = useState<any[]>(allAcceptedTeams)

    // Stockage des poules sous forme : { "Poule A": [team1, team2], "Poule B": [team3] }
    const [pools, setPools] = useState<Record<string, any[]>>({})

    const isGroupStage = stage.type_code?.includes("ROUND_ROBIN") || stage.type_code === "POOLS" || stage.type_code?.includes("GROUP")
    const isBracketStage = stage.type_code?.includes("ELIMINATION") || stage.type_code === "BRACKET"

    // Initialiser les poules par défaut dès que le nombre de poules change ou à l'ouverture
    useEffect(() => {
        if (isGroupStage) {
            const initialPools: Record<string, any[]> = {}
            for (let i = 0; i < nbGroups; i++) {
                const poolName = `Poule ${String.fromCharCode(65 + i)}`
                initialPools[poolName] = []
            }
            // Répartir les équipes existantes de manière équilibrée au début si vide
            selectedTeams.forEach((team, idx) => {
                const poolKey = `Poule ${String.fromCharCode(65 + (idx % nbGroups))}`
                initialPools[poolKey].push(team)
            })
            setPools(initialPools)
        }
    }, [nbGroups, isGroupStage])

    // Activer / Désactiver une équipe
    function toggleTeamSelection(team: any) {
        if (selectedTeams.some((t) => t.id === team.id)) {
            // Retirer des sélections et de toutes les poules
            setSelectedTeams(selectedTeams.filter((t) => t.id !== team.id))
            const updatedPools = { ...pools }
            Object.keys(updatedPools).forEach((pKey) => {
                updatedPools[pKey] = updatedPools[pKey].filter((t: any) => t.id !== team.id)
            })
            setPools(updatedPools)
        } else {
            // Ajouter aux sélections et placer par défaut dans la première poule
            setSelectedTeams([...selectedTeams, team])
            const firstPoolKey = Object.keys(pools)[0]
            if (firstPoolKey) {
                setPools({
                    ...pools,
                    [firstPoolKey]: [...pools[firstPoolKey], team]
                })
            }
        }
    }

    // Déplacer manuellement une équipe d'une poule vers une autre via un select
    function handleMoveTeamToPool(team: any, targetPool: string) {
        const updatedPools = { ...pools }

        // Retirer l'équipe de sa poule actuelle
        Object.keys(updatedPools).forEach((pKey) => {
            updatedPools[pKey] = updatedPools[pKey].filter((t: any) => t.id !== team.id)
        })

        // L'ajouter dans la poule cible
        if (updatedPools[targetPool]) {
            updatedPools[targetPool].push(team)
        }

        setPools(updatedPools)
    }

    // Mélange aléatoire optionnel
    function handleShuffleIntoPools() {
        if (selectedTeams.length === 0) return toast.error("Aucune équipe sélectionnée.")
        
        const shuffled = [...selectedTeams].sort(() => Math.random() - 0.5)
        const newPools: Record<string, any[]> = {}
        
        for (let i = 0; i < nbGroups; i++) {
            const poolName = `Poule ${String.fromCharCode(65 + i)}`
            newPools[poolName] = []
        }

        shuffled.forEach((team, index) => {
            const poolKey = `Poule ${String.fromCharCode(65 + (index % nbGroups))}`
            newPools[poolKey].push(team)
        })

        setPools(newPools)
        toast.success(`Équipes réparties aléatoirement dans ${nbGroups} poules !`)
    }

    // Changer l'ordre des Seeds (Bracket)
    function handleMoveSeed(index: number, direction: 'up' | 'down') {
        const newSeeds = [...selectedTeams]
        const targetIndex = direction === 'up' ? index - 1 : index + 1
        
        if (targetIndex < 0 || targetIndex >= newSeeds.length) return
        
        const temp = newSeeds[index]
        newSeeds[index] = newSeeds[targetIndex]
        newSeeds[targetIndex] = temp
        
        setSelectedTeams(newSeeds)
    }

    // Lancer la génération des matchs
    async function handleGenerate() {
        setLoading(true)
        try {
            const payloadData = isGroupStage ? pools : selectedTeams

            const result = await generateStageMatches({
                stageId: stage.id,
                tournamentId: tournament.id,
                type: isGroupStage ? "ROUND_ROBIN" : "BRACKET",
                data: payloadData,
            })

            if (result.success) {
                toast.success(result.message)
                router.refresh()
                onClose()
            } else {
                toast.error(result.message)
            }
        } catch (error) {
            toast.error("Erreur lors de la génération des matchs.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[800px] bg-slate-900 border-white/10 text-white max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[10px] text-cyan-400 border-cyan-500/20">
                            {stage.tournament_stage_types?.label || stage.type_code}
                        </Badge>
                        <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[10px]">
                            {stage.bo_options?.label || stage.bo_code}
                        </Badge>
                    </div>
                    <DialogTitle className="text-xl font-bold">
                        Configuration de l'étape : {stage.name}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-400">
                        {isGroupStage ? "Gérez le nombre de poules et placez manuellement chaque équipe dans la poule de votre choix." : "Organisez l'ordre des têtes de série pour le premier tour de l'arbre."}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* SECTION 1 : LISTE GLOBALE DES ÉQUIPES CONFIRMÉES */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                            <Users className="size-4 text-cyan-400" />
                            Équipes confirmées du tournoi ({allAcceptedTeams.length})
                        </h3>
                        <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-black/30 border border-white/5">
                            {allAcceptedTeams.length === 0 ? (
                                <p className="text-xs text-muted-foreground py-2">Aucune équipe confirmée pour l'instant.</p>
                            ) : (
                                allAcceptedTeams.map((team: any) => {
                                    const isSelected = selectedTeams.some((t) => t.id === team.id)
                                    return (
                                        <button
                                            key={team.id}
                                            type="button"
                                            onClick={() => toggleTeamSelection(team)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                                                isSelected 
                                                    ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300" 
                                                    : "bg-white/5 border-white/5 text-slate-400 hover:text-white"
                                            }`}
                                        >
                                            {team.name} {isSelected ? "✓" : "+"}
                                        </button>
                                    )
                                })
                            )}
                        </div>
                    </div>

                    {/* SECTION 2 : CONFIGURATION ET PLACEMENT MANUEL DES POULES */}
                    {isGroupStage && (
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-black/30 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="space-y-1.5 w-full sm:w-auto flex-1">
                                    <Label htmlFor="nbGroups" className="text-xs">Nombre de poules</Label>
                                    <Input
                                        id="nbGroups"
                                        type="number"
                                        min={1}
                                        max={8}
                                        value={nbGroups}
                                        onChange={(e) => setNbGroups(parseInt(e.target.value) || 1)}
                                        className="bg-black/30 border-white/10 text-xs w-full"
                                    />
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-white/10 text-xs gap-1.5 bg-white/5 hover:bg-white/10 w-full sm:w-auto mt-2 sm:mt-5"
                                    onClick={handleShuffleIntoPools}
                                >
                                    <Shuffle className="size-3.5 text-cyan-400" />
                                    Mélange aléatoire rapide
                                </Button>
                            </div>

                            {/* Affichage des poules avec sélecteur de déplacement manuel */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(pools).map(([poolName, teams]: [string, any[]]) => (
                                    <div key={poolName} className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
                                        <h5 className="font-bold text-xs text-cyan-400 uppercase tracking-wider flex items-center justify-between">
                                            {poolName}
                                            <Badge variant="secondary" className="text-[10px]">{teams.length} équipe(s)</Badge>
                                        </h5>

                                        <div className="space-y-2">
                                            {teams.length === 0 ? (
                                                <p className="text-[11px] text-muted-foreground italic py-2 text-center border border-dashed border-white/5 rounded-lg">
                                                    Aucune équipe dans cette poule
                                                </p>
                                            ) : (
                                                teams.map((team: any) => (
                                                    <div key={team.id} className="p-2 rounded-lg bg-white/5 border border-white/5 text-xs text-white flex items-center justify-between gap-2">
                                                        <span className="truncate font-medium">{team.name}</span>
                                                        
                                                        {/* Sélecteur pour changer de poule manuellement */}
                                                        <select
                                                            value={poolName}
                                                            onChange={(e) => handleMoveTeamToPool(team, e.target.value)}
                                                            className="h-7 rounded bg-slate-900 border border-white/10 px-2 text-[11px] text-cyan-300 outline-none"
                                                        >
                                                            {Object.keys(pools).map((pKey) => (
                                                                <option key={pKey} value={pKey}>
                                                                    {pKey}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* SECTION 3 : BRACKET SEEDS */}
                    {isBracketStage && (
                        <div className="space-y-4">
                            <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">
                                    Ordre des Têtes de Série (Bracket)
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                    Utilisez les flèches pour modifier l'ordre des équipes du premier tour.
                                </p>
                            </div>

                            <div className="space-y-2 max-h-52 overflow-y-auto p-2 rounded-xl bg-black/30 border border-white/5">
                                {selectedTeams.map((team, index) => (
                                    <div 
                                        key={team.id}
                                        className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-xs text-white flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-[10px]">
                                                Seed #{index + 1}
                                            </Badge>
                                            <span className="font-semibold">{team.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-7 px-2 text-xs text-slate-300 hover:text-white"
                                                disabled={index === 0}
                                                onClick={() => handleMoveSeed(index, 'up')}
                                            >
                                                ↑
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-7 px-2 text-xs text-slate-300 hover:text-white"
                                                disabled={index === selectedTeams.length - 1}
                                                onClick={() => handleMoveSeed(index, 'down')}
                                            >
                                                ↓
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="border-white/10 text-xs"
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={handleGenerate}
                        disabled={loading || selectedTeams.length === 0}
                        className="bg-cyan-500 text-slate-950 hover:bg-cyan-400 text-xs font-semibold gap-1.5"
                    >
                        <Play className="size-3.5" />
                        {loading ? "Génération..." : "Générer les matchs"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}