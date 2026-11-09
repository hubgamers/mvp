import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { prisma } from "@/lib/prisma"
import {
  Users,
  UserPlus,
  Gamepad2,
  Mic,
  ArrowLeft,
  Crown,
  Shield,
  Clock,
  Sparkles,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SquadDetailClient } from "./squad-detail-client"

interface SquadDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function SquadDetailPage({ params }: SquadDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const squad = await prisma.squads.findUnique({
    where: { id },
    include: {
      squad_types: true,
      squads_members: {
        include: {
          squad_member_roles: true,
          users: { select: { id: true, display_name: true, email: true } },
        },
        orderBy: { status: "asc" },
      },
    },
  })

  if (!squad) {
    notFound()
  }

  const myMembership = squad.squads_members.find((m) => m.user_id === user.id)
  const isOwner = myMembership?.role_code === "OWNER"
  const isMember = myMembership?.status === "JOINED"
  const isInvited = myMembership?.status === "INVITE"

  const joinedMembers = squad.squads_members.filter((m) => m.status === "JOINED")
  const pendingApplicants = squad.squads_members.filter((m) => m.status === "INVITE")
  const isFull = squad.nb_places ? joinedMembers.length >= squad.nb_places : false

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm" className="h-9 w-9 p-0 rounded-full border-white/10">
            <Link href="/dashboard/squads">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-[10px] font-mono uppercase">
                {squad.squad_types?.label || squad.type_code}
              </Badge>
              {squad.game && (
                <span className="text-xs text-cyan-400 font-bold uppercase tracking-wider">
                  {squad.game}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              {squad.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="border-white/10 text-xs">
            <Link href="/dashboard/squads/explore">
              Toutes les escouades
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche (2/3) : Membres & Recrutements */}
        <div className="lg:col-span-2 space-y-6">
          {/* Membres confirmés */}
          <Card className="border-white/10 bg-card/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="size-4 text-cyan-400" />
                  Membres de l'escouade ({joinedMembers.length} / {squad.nb_places || "Illimité"})
                </CardTitle>
                <CardDescription className="text-xs">
                  Joueurs actuellement connectés dans le groupe.
                </CardDescription>
              </div>
              {isFull && (
                <Badge variant="outline" className="text-amber-400 border-amber-500/30 text-xs">
                  Escouade complète
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-white/5">
                {joinedMembers.map((member) => (
                  <div key={member.user_id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold text-xs">
                        <Link href={`/dashboard/users/${member.user_id}`}>
                          {member.users.display_name?.slice(0, 2).toUpperCase()}
                        </Link>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          <span>{member.users.display_name}</span>
                          {member.role_code === "OWNER" && (
                            <Crown className="size-3.5 text-amber-400" />
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">{member.users.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs font-mono uppercase">
                        {member.squad_member_roles?.label || member.role_code}
                      </Badge>
                      <SquadDetailClient
                        squadId={squad.id}
                        targetUserId={member.user_id}
                        isOwner={isOwner}
                        isSelf={member.user_id === user.id}
                        actionType="MANAGE_MEMBER"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Candidatures en attente (visible par l'owner) */}
          {isOwner && (
            <Card className="border-white/10 bg-card/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                  <Clock className="size-4 text-amber-400" />
                  Demandes d'intégration en attente ({pendingApplicants.length})
                </CardTitle>
                <CardDescription className="text-xs">
                  Validez les joueurs souhaitant rejoindre l'escouade.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingApplicants.length === 0 ? (
                  <div className="text-center py-6 text-xs text-muted-foreground">
                    Aucune candidature en attente.
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {pendingApplicants.map((applicant) => (
                      <div key={applicant.user_id} className="py-3 flex items-center justify-between gap-4">
                        <div>
                          <div className="font-bold text-sm text-white">{applicant.users.display_name}</div>
                          <div className="text-xs text-muted-foreground">{applicant.users.email}</div>
                        </div>

                        <SquadDetailClient
                          squadId={squad.id}
                          targetUserId={applicant.user_id}
                          isOwner={isOwner}
                          actionType="ACCEPT_APPLICANT"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Colonne droite (1/3) : Fiche critères & Action rejoindre */}
        <div className="space-y-6">
          {/* Action principale pour le visiteur ou membre */}
          <Card className="border-white/10 bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold text-white">Votre participation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <SquadDetailClient
                squadId={squad.id}
                isOwner={isOwner}
                isMember={isMember}
                isInvited={isInvited}
                isFull={isFull}
                actionType="JOIN_OR_LEAVE"
              />
            </CardContent>
          </Card>

          {/* Invitation directe */}
          {isOwner && (
            <Card className="border-white/10 bg-card/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                  <UserPlus className="size-4 text-cyan-400" />
                  Inviter directement
                </CardTitle>
                <CardDescription className="text-xs">
                  Générez un code pour ajouter directement un ami à l'escouade.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SquadDetailClient
                  squadId={squad.id}
                  actionType="GENERATE_INVITE"
                />
              </CardContent>
            </Card>
          )}

          {/* Spécifications du groupe */}
          <Card className="border-white/10 bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold text-white">Critères de session</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-muted-foreground">Type :</span>
                <span className="text-white font-medium">{squad.squad_types?.label}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-muted-foreground">Plateforme :</span>
                <span className="text-white font-medium">{squad.platform || "PC"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-muted-foreground">Niveau requis :</span>
                <span className="text-cyan-400 font-bold">{squad.level || "Tous niveaux"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-muted-foreground">Profil recherché :</span>
                <span className="text-white font-medium">{squad.role_searched || "Non spécifié"}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Communication :</span>
                <span className={`font-semibold flex items-center gap-1 ${squad.micro_required ? "text-emerald-400" : "text-slate-400"}`}>
                  <Mic className="size-3" /> {squad.micro_required ? "Micro requis" : "Facultatif"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
