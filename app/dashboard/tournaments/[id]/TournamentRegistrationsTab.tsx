"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Mail, Users, Clock } from "lucide-react"
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
import { Label } from "@/components/ui/label"
import { TournamentManageActions } from "./tournament-manage-actions"
import { addRosterToTournamentDirectly } from "@/app/actions/tournament-registration.actions"
import { inviteRosterToTournament } from "@/app/actions/tournament-registration.actions" // Import de la nouvelle action
import { toast } from "sonner"

interface TournamentRegistrationsTabProps {
    tournament: any
    invitations: any[]
    availableRosters?: { id: string; name: string }[]
    isStaff: boolean
}

export function TournamentRegistrationsTab({
    tournament,
    invitations = [],
    availableRosters = [],
    isStaff,
}: TournamentRegistrationsTabProps) {
    const router = useRouter()

    const [isAddOpen, setIsAddOpen] = useState(false)
    const [isInviteOpen, setIsInviteOpen] = useState(false)
    const [selectedRosterId, setSelectedRosterId] = useState<string>("")
    const [inviteRosterId, setInviteRosterId] = useState<string>("")
    const [loading, setLoading] = useState(false)

    async function handleDirectAdd(e: React.FormEvent) {
        e.preventDefault()
        if (!selectedRosterId) return toast.error("Veuillez sélectionner une équipe.")

        setLoading(true)
        const result = await addRosterToTournamentDirectly({
            tournamentId: tournament.id,
            rosterId: selectedRosterId,
        })
        setLoading(false)

        if (result.success) {
            toast.success(result.message)
            setIsAddOpen(false)
            setSelectedRosterId("")
            router.refresh()
        } else {
            toast.error(result.message)
        }
    }

    async function handleInvite(e: React.FormEvent) {
        e.preventDefault()
        if (!inviteRosterId) return toast.error("Veuillez sélectionner une équipe à inviter.")

        setLoading(true)
        const result = await inviteRosterToTournament({
            tournamentId: tournament.id,
            rosterId: inviteRosterId,
        })
        setLoading(false)

        if (result.success) {
            toast.success(result.message)
            setIsInviteOpen(false)
            setInviteRosterId("")
            router.refresh()
        } else {
            toast.error(result.message)
        }
    }

    // Filtrer les invitations de type TOURNAMENT avec le statut WAIT
    const pendingInvitations = Array.isArray(invitations) ? invitations.filter(
        (inv) => inv.target_type_code === "TOURNAMENT" && inv.status === "WAIT"
    ) : []

    return (
        <div className="space-y-6">
            <Card className="border-white/10 bg-card/60 backdrop-blur-sm">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                            <Users className="size-4 text-cyan-400" />
                            Équipes enregistrées au tournoi
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Validez ou refusez les inscriptions d'équipes et vérifiez leur check-in.
                        </CardDescription>
                    </div>

                    {isStaff && (
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                className="border-white/10 text-xs bg-white/5 hover:bg-white/10 text-white"
                                onClick={() => {
                                    setInviteRosterId("")
                                    setIsInviteOpen(true)
                                }}
                            >
                                <Mail className="size-3.5 mr-1.5 text-purple-400" />
                                Inviter une équipe
                            </Button>

                            <Button
                                size="sm"
                                className="bg-cyan-500 text-slate-950 hover:bg-cyan-400 text-xs font-semibold"
                                onClick={() => {
                                    setSelectedRosterId("")
                                    setIsAddOpen(true)
                                }}
                            >
                                <Plus className="size-4 mr-1.5" />
                                Ajouter directement
                            </Button>
                        </div>
                    )}
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Section 1: Invitations en attente (WAIT) */}
                    {pendingInvitations.length > 0 && (
                        <div className="space-y-3 pb-4 border-b border-white/10">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
                                <Clock className="size-3.5" />
                                Invitations en attente ({pendingInvitations.length})
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {pendingInvitations.map((inv) => (
                                    <div
                                        key={inv.id}
                                        className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20 flex items-center justify-between"
                                    >
                                        <div>
                                            <span className="font-bold text-white text-xs">Capitaine ({inv.email})</span>
                                            <p className="text-[10px] text-muted-foreground mt-0.5">
                                                Code : <span className="font-mono text-purple-300">{inv.code}</span>
                                            </p>
                                        </div>
                                        <Badge variant="outline" className="border-purple-500/30 text-purple-300 text-[10px]">
                                            En attente
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Section 2: Équipes inscrites */}
                    {tournament.tournaments_registrations.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground text-xs">
                            Aucune équipe inscrite pour l'instant. Les inscriptions sont visibles sur la page publique.
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {tournament.tournaments_registrations.map((reg: any) => (
                                <div
                                    key={reg.roster_id}
                                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-white text-sm">{reg.rosters?.name}</span>
                                            <Badge
                                                variant={reg.status_code === "CONFIRMED" ? "default" : "outline"}
                                                className="text-[10px]"
                                            >
                                                {reg.tournament_registration_statuses?.label || reg.status_code}
                                            </Badge>
                                            {reg.checked_in && (
                                                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                                                    Check-in OK
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {reg.rosters?.rosters_members?.length || 0} joueurs inscrits dans la lineup
                                        </div>
                                    </div>

                                    {isStaff && (
                                        <TournamentManageActions
                                            tournamentId={tournament.id}
                                            rosterId={reg.roster_id}
                                            currentStatus={reg.status_code}
                                            checkedIn={!!reg.checked_in}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modal 1: Ajouter directement */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="sm:max-w-[425px] bg-slate-900 border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>Ajouter une équipe (Accord préalable)</DialogTitle>
                        <DialogDescription className="text-xs text-slate-400">
                            Inscrire directement une équipe au tournoi avec le statut <span className="text-emerald-400 font-bold">CONFIRMÉ</span>.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleDirectAdd} className="space-y-4 pt-2">
                        <div className="space-y-1.5">
                            <Label className="text-xs">Sélectionner l'équipe</Label>
                            <select
                                required
                                value={selectedRosterId}
                                onChange={(e) => setSelectedRosterId(e.target.value)}
                                className="w-full h-9 rounded-md bg-black/30 border border-white/10 px-3 text-xs text-white outline-none focus:border-cyan-500"
                            >
                                <option value="" disabled>Choisir une équipe...</option>
                                {availableRosters.map((roster) => (
                                    <option key={roster.id} value={roster.id} className="bg-slate-900">
                                        {roster.name}
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
                                {loading ? "Ajout en cours..." : "Inscrire l'équipe"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal 2: Inviter une équipe (par son nom via le capitaine) */}
            <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                <DialogContent className="sm:max-w-[425px] bg-slate-900 border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>Inviter une équipe au tournoi</DialogTitle>
                        <DialogDescription className="text-xs text-slate-400">
                            Sélectionnez l'équipe à inviter. Seul son capitaine pourra accepter l'invitation.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleInvite} className="space-y-4 pt-2">
                        <div className="space-y-1.5">
                            <Label className="text-xs">Sélectionner l'équipe</Label>
                            <select
                                required
                                value={inviteRosterId}
                                onChange={(e) => setInviteRosterId(e.target.value)}
                                className="w-full h-9 rounded-md bg-black/30 border border-white/10 px-3 text-xs text-white outline-none focus:border-cyan-500"
                            >
                                <option value="" disabled>Choisir une équipe...</option>
                                {availableRosters.map((roster) => (
                                    <option key={roster.id} value={roster.id} className="bg-slate-900">
                                        {roster.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
                            >
                                {loading ? "Envoi..." : "Envoyer l'invitation au capitaine"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}