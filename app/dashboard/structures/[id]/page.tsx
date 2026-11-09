import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { prisma } from "@/lib/prisma"
import {
  Building2,
  UsersRound,
  Shield,
  ArrowLeft,
  Mail,
  Plus,
  Crown,
  Trash2,
  ExternalLink,
  Gamepad2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { StructureManageClient } from "./structure-manage-client"
import { getClubEntitlements } from "@/lib/plans"

interface StructureDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function StructureDetailPage({ params }: StructureDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const club = await prisma.clubs.findUnique({
    where: { id },
    include: {
      clubs_members: {
        include: {
          club_roles: true,
          users: { select: { id: true, display_name: true, email: true } },
        },
      },
      rosters: {
        include: {
          rosters_members: true,
        },
      },
    },
  })

  if (!club || club.deleted) {
    notFound()
  }

  const myMembership = club.clubs_members.find((m) => m.user_id === user.id)
  const isAdmin = myMembership?.role_code === "ADMIN"
  const entitlements = await getClubEntitlements(user.id, club.id)
  const recruitmentOpen = Boolean(club.recruit_open && entitlements.recruitment)

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Barre supérieure */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm" className="h-9 w-9 p-0 rounded-full border-white/10">
            <Link href="/dashboard/structures">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={isAdmin ? "default" : "outline"} className="text-[10px] font-mono uppercase">
                {myMembership?.club_roles?.label || myMembership?.role_code || "Membre"}
              </Badge>
              {recruitmentOpen && (
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                  Recrutement actif
                </Badge>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              {club.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="border-white/10 text-xs">
            <Link href={`/clubs/${club.slug}`} target="_blank">
              <ExternalLink className="size-3.5 mr-1.5" />
              Page publique
            </Link>
          </Button>
          <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs">
            <Link href="/dashboard/teams/new">
              <Plus className="size-3.5 mr-1.5" />
              Créer une lineup
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche (2/3) : Membres & Lineups */}
        <div className="lg:col-span-2 space-y-6">
          {/* Liste des membres */}
          <Card className="border-white/10 bg-card/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                  <UsersRound className="size-4 text-emerald-400" />
                  Membres du Club ({club.clubs_members.length})
                </CardTitle>
                <CardDescription className="text-xs">
                  Joueurs, dirigeants et managers autorisés dans la structure.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-white/5">
                {club.clubs_members.map((member) => (
                  <div key={member.user_id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs text-white">
                        {member.users.display_name?.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{member.users.display_name}</div>
                        <div className="text-xs text-muted-foreground">{member.users.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs font-mono uppercase">
                        {member.club_roles?.label || member.role_code}
                      </Badge>
                      {isAdmin && member.user_id !== user.id && (
                        <StructureManageClient
                          clubId={club.id}
                          memberUserId={member.user_id}
                          currentRole={member.role_code}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Rosters / Lineups rattachés */}
          <Card className="border-white/10 bg-card/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                  <Gamepad2 className="size-4 text-purple-400" />
                  Rosters & Pôles de Jeux ({club.rosters.length})
                </CardTitle>
                <CardDescription className="text-xs">
                  Lineups compétitives engagées sous la bannière de {club.name}.
                </CardDescription>
              </div>
              <Button asChild size="sm" variant="outline" className="text-xs border-white/10">
                <Link href="/dashboard/teams/new">Ajouter une lineup</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {club.rosters.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  Aucun roster compétitif n'a encore été créé pour ce club.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {club.rosters.map((roster) => (
                    <Link
                      key={roster.id}
                      href={`/dashboard/teams/${roster.id}`}
                      className="p-4 rounded-xl bg-black/30 border border-white/5 hover:border-white/20 transition-colors"
                    >
                      <div className="font-bold text-sm text-white mb-1">{roster.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {roster.game || "Multi-jeu"} · {roster.platform || "PC"}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Colonne droite (1/3) : Recrutement & Invitation */}
        <div className="space-y-6">
          <Card className="border-white/10 bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <Mail className="size-4 text-cyan-400" />
                Inviter un membre
              </CardTitle>
              <CardDescription className="text-xs">
                Générez un lien d'invitation avec un rôle prédéfini pour intégrer un joueur ou staff.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StructureManageClient
                clubId={club.id}
                isInvitationGenerator
              />
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold text-white">À propos de la structure</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-300 space-y-2">
              <p>{club.description || "Aucune description enregistrée."}</p>
              <div className="pt-2 text-muted-foreground font-mono">
                Identifiant URL: /clubs/{club.slug}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
