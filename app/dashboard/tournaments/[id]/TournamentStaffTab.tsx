"use client"

import { useState } from "react"
import { Shield, Mail, UserPlus, Trash2, Clock, CheckCircle2, Send } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { inviteTournamentMember } from "@/app/actions/tournament-member.actions"
import { removeTournamentMember } from "@/app/actions/tournament.actions"

export function TournamentStaffTab({
  tournament,
  currentUserId,
  canInviteCasters,
  canInviteReferees,
}: {
  tournament: any
  currentUserId: string
  canInviteCasters: boolean
  canInviteReferees: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleInvite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email")?.toString() || ""
    const role_code = formData.get("role_code")?.toString() || "admin"

    if (!email) {
      setIsLoading(false)
      return
    }

    try {
      const res = await inviteTournamentMember({
        tournamentId: tournament.id,
        email,
        role_code,
      })

      if (res.success) {
        setIsOpen(false)
          (event.target as HTMLFormElement).reset()
      } else {
        alert(res.message)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRemove(userId: string) {
    if (!confirm("Voulez-vous vraiment retirer ce membre de l'équipe ?")) return

    try {
      await removeTournamentMember(tournament.id, userId)
    } catch (error) {
      console.error(error)
    }
  }

  // Filtrer les invitations en attente (statut WAIT) liées à ce tournoi
  const pendingInvitations = tournament.invitations?.filter((inv: any) => inv.status === "WAIT") || []
  const visibleMembers = tournament.tournaments_members.filter(
    (member: any) => canInviteCasters || member.role_code !== "CASTER"
  )

  // Vérifier si l'utilisateur est membre du staff
  const userMembership = tournament.tournaments_members.find((m) => m.user_id === currentUserId)
  const isStaff = !!userMembership
  const isAdmin = userMembership?.role_code === "ADMIN" // ou "admin" selon ta base de données

  return (
    <TabsContent value="staff" className="space-y-4">
      <Card className="border-white/10 bg-card/60 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-white">Équipe d'organisation</CardTitle>
            <CardDescription className="text-xs">
              Administrateurs, arbitres officiels et commentateurs autorisés.
            </CardDescription>
          </div>

          {/* Bouton pour ouvrir la modale d'invitation */}
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {isAdmin && (
              <DialogTrigger asChild>
                <Button size="sm">
                  <UserPlus className="size-4" />
                  Inviter un membre
                </Button>
              </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[425px] border-white/10 bg-card text-card-foreground">
              <form onSubmit={handleInvite}>
                <DialogHeader>
                  <DialogTitle className="text-white">Inviter un collaborateur</DialogTitle>
                  <DialogDescription className="text-xs">
                    Envoyez une invitation par e-mail pour rejoindre l'équipe de ce tournoi.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-medium text-white">Adresse e-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="collaborateur@example.com"
                        required
                        className="pl-9 bg-black/20 border-white/10 text-white text-xs"
                      />
                    </div>
                  </div>

                  {/* Rôle */}
                  <div className="space-y-2">
                    <Label htmlFor="role_code" className="text-xs font-medium text-white">Rôle</Label>
                    <select
                      id="role_code"
                      name="role_code"
                      defaultValue="admin"
                      className="flex h-9 w-full rounded-md border border-white/10 bg-black/20 px-3 py-1 text-xs text-white shadow-xs outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="admin" className="bg-card text-white">Administrateur</option>
                      {canInviteReferees && (
                        <option value="referee" className="bg-card text-white">Arbitre</option>
                      )}
                      {canInviteCasters && (
                        <option value="caster" className="bg-card text-white">Commentateur (Caster)</option>
                      )}
                    </select>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" size="sm" disabled={isLoading}>
                    {isLoading ? "Envoi..." : "Envoyer l'invitation"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Section 1 : Membres actifs */}
          <div className="divide-y divide-white/5">
            <div className="text-xs font-semibold text-muted-foreground pb-2 uppercase tracking-wider">Membres actifs</div>
            {visibleMembers.length === 0 ? (
              <div className="py-4 text-xs text-muted-foreground">Aucun membre dans l'équipe pour le moment.</div>
            ) : (
              visibleMembers.map((member: any) => (
                <div key={member.user_id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                      <Shield className="size-4 text-primary" />
                    </div>
                    <div>
                      <span className="font-bold text-sm text-white block">
                        {member.users?.display_name || "Utilisateur"}
                      </span>
                      <span className="text-xs text-muted-foreground block">
                        {member.users?.email}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs font-mono uppercase border-white/10 text-white">
                      {member.tournament_member_roles?.label || member.role_code}
                    </Badge>

                    {isAdmin && member.user_id !== currentUserId && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleRemove(member.user_id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Section 2 : Invitations en attente */}
          {pendingInvitations.length > 0 && (
            <div className="divide-y divide-white/5 pt-2">
              <div className="text-xs font-semibold text-amber-400 pb-2 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="size-3.5" /> Invitations en attente ({pendingInvitations.length})
              </div>
              {pendingInvitations.map((invitation: any) => (
                <div key={invitation.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                      <Send className="size-4 text-amber-400" />
                    </div>
                    <div>
                      <span className="font-bold text-sm text-white block">
                        {invitation.email}
                      </span>
                      <span className="text-[11px] text-muted-foreground block">
                        Invité le {new Date(invitation.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-400/30">
                      En attente d'acceptation
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  )
}