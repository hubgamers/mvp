import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { prisma } from "@/lib/prisma"
import {
  Trophy,
  Users,
  Calendar,
  Gamepad2,
  Tv,
  Swords,
  Shield,
  Layers,
  Sparkles,
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Plus,
  Clock,
  Radio,
  Coins,
  Building,
  Edit,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TournamentManageActions } from "./tournament-manage-actions"
import { getTournamentDetail } from "@/app/actions/tournament.actions"
import { TournamentSponsorsTab } from "./TournamentSponsorsTab"
import { TournamentStaffTab } from "./TournamentStaffTab"
import { getInvitationsFromTournamentId } from "@/app/actions/invitation.actions"
import { TournamentStagesTab } from "./TournamentStagesTab"
import { TournamentRegistrationsTab } from "./TournamentRegistrationsTab"
import { TournamentMatchesTab } from "./TournamentMatchesTab"

interface TournamentDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function TournamentDetailPage({ params }: TournamentDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Récupération en parallèle du tournoi et des données de référence pour les étapes
  const [tournamentRes, stageTypes, boOptions, stageStatuses] = await Promise.all([
    getTournamentDetail(id),
    prisma.tournament_stage_types.findMany(),
    prisma.bo_options.findMany(),
    prisma.tournament_stage_statuses.findMany(),
  ])

  const rawTournament = tournamentRes.tournament;

  if (!rawTournament) {
    notFound()
  }

  function serializeTournament(tournament: any) {
    if (!tournament) return tournament;

    return {
      ...tournament,
      cashprize: tournament.cashprize ? Number(tournament.cashprize) : null,
      prix_entree: tournament.prix_entree ? Number(tournament.prix_entree) : null,
      // Si tu as d'autres champs Decimal dans les sous-objets, tu peux les ajuster ici si nécessaire
    };
  }

  const tournament = serializeTournament(rawTournament);

  // Dans page.tsx
  const rawInvitations = await getInvitationsFromTournamentId(tournament.id)
  // Si ton action renvoie un objet type { invitations: [...] }, extrait-le :
  const invitations = Array.isArray(rawInvitations) ? rawInvitations : (rawInvitations?.invitations || [])
  const availableRosters = await prisma.rosters.findMany({ select: { id: true, name: true } })



  // Vérifier si l'utilisateur est membre du staff
  const userMembership = tournament.tournaments_members.find((m) => m.user_id === user.id)
  const isStaff = !!userMembership
  const isAdmin = userMembership?.role_code === "ADMIN"

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Barre supérieure avec retour et actions rapides */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm" className="h-9 w-9 p-0 rounded-full border-white/10">
            <Link href="/dashboard/tournaments">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-[10px] font-mono uppercase">
                {tournament.tournament_statuses?.label || tournament.status_code}
              </Badge>
              {tournament.game && (
                <span className="text-xs text-cyan-400 font-bold uppercase tracking-wider">
                  {tournament.game}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
              {tournament.name}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (
            <Button asChild variant="outline" size="sm" className="border-white/10 text-xs">
              <Link href={`/tournaments/${tournament.slug}/edit`}>
                <Edit className="size-3.5 mr-1.5" />
                Editer
              </Link>
            </Button>
          )}
          <Button asChild variant="outline" size="sm" className="border-white/10 text-xs">
            <Link href={`/tournaments/${tournament.slug}`} target="_blank">
              <ExternalLink className="size-3.5 mr-1.5" />
              Page publique
            </Link>
          </Button>
          <Button asChild size="sm" className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold">
            <Link href={`/dashboard/studio?tournament_id=${tournament.id}`}>
              <Tv className="size-3.5 mr-1.5" />
              Studio OBS
            </Link>
          </Button>
        </div>
      </div>

      {/* Résumé des métriques du tournoi */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-white/10 bg-card/60 backdrop-blur-sm p-4">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1">
            <Coins className="size-3.5 text-amber-400" />
            Cashprize
          </span>
          <span className="text-xl sm:text-2xl font-black text-white">
            {tournament.cashprize ? `${Number(tournament.cashprize)} €` : "0 €"}
          </span>
        </Card>

        <Card className="border-white/10 bg-card/60 backdrop-blur-sm p-4">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1">
            <Users className="size-3.5 text-cyan-400" />
            Équipes inscrites
          </span>
          <span className="text-xl sm:text-2xl font-black text-white">
            {tournament.tournaments_registrations.length}
            {tournament.nb_rosters ? ` / ${tournament.nb_rosters}` : ""}
          </span>
        </Card>

        <Card className="border-white/10 bg-card/60 backdrop-blur-sm p-4">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1">
            <Layers className="size-3.5 text-purple-400" />
            Étapes & Arbres
          </span>
          <span className="text-xl sm:text-2xl font-black text-white">
            {tournament.tournaments_stages.length} phase(s)
          </span>
        </Card>

        <Card className="border-white/10 bg-card/60 backdrop-blur-sm p-4">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1">
            <Shield className="size-3.5 text-emerald-400" />
            Votre Rôle
          </span>
          <span className="text-base sm:text-lg font-bold text-emerald-400 uppercase">
            {userMembership?.tournament_member_roles?.label || (isStaff ? "Staff" : "Participant")}
          </span>
        </Card>
      </div>

      {/* Contenu avec onglets */}
      <Tabs defaultValue="registrations" className="w-full space-y-6">
        <TabsList className="bg-black/40 border border-white/10 p-1 rounded-xl">
          <TabsTrigger value="registrations" className="text-xs">
            Inscriptions & Équipes ({tournament.tournaments_registrations.length})
          </TabsTrigger>
          <TabsTrigger value="stages" className="text-xs">
            Étapes & Brackets ({tournament.tournaments_stages.length})
          </TabsTrigger>
          <TabsTrigger value="matches" className="text-xs">
            Matchs & Scores
          </TabsTrigger>
          <TabsTrigger value="sponsors" className="text-xs">
            Sponsors & Partenaires ({tournament.tournament_sponsors.length})
          </TabsTrigger>
          <TabsTrigger value="staff" className="text-xs">
            Staff & Arbitres ({tournament.tournaments_members.length})
          </TabsTrigger>
        </TabsList>

        {/* 1. Onglet Inscriptions */}
        <TabsContent value="registrations" className="space-y-4">
          <TournamentRegistrationsTab
            tournament={tournament}
            invitations={invitations}
            availableRosters={availableRosters}
            isStaff={isStaff}
          />
        </TabsContent>

        {/* 2. Onglet Étapes & Brackets */}
        <TabsContent value="stages" className="space-y-4">
          <TournamentStagesTab
            tournament={tournament}
            stageTypes={stageTypes}
            boOptions={boOptions}
            stageStatuses={stageStatuses}
            isStaff={isStaff}
          />
        </TabsContent>

        {/* 3. Onglet Matchs */}
        <TabsContent value="matches" className="space-y-4">
          <TournamentMatchesTab tournament={tournament} />
        </TabsContent>

        {/* 4. Onglet Sponsors */}
        <TournamentSponsorsTab tournament={tournament} currentUserId={user.id} />

        {/* 5. Onglet Staff */}
        <TournamentStaffTab tournament={tournament} currentUserId={user.id} />
      </Tabs>
    </div>
  )
}