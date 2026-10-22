import Link from "next/link"
import { TournamentDetail } from "@/app/actions/tournament.actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Gamepad2,
  Monitor,
  Calendar,
  Users,
  ArrowLeft,
  Trophy,
  UserPlus,
  Clapperboard,
  Edit,
  Shield,
  Layers,
  Sparkles,
  Flame,
  CheckCircle2,
} from "lucide-react"
import InviteTeamForm from "./invite-team-form"
import { InviteTournamentStaffForm } from "./invite-staff-form"
import { TournamentBracket } from "./details/tournament-bracket"
import { TournamentStaffItem } from "./details/tournament-staff-item"

interface TournamentDetailViewProps {
  tournament: TournamentDetail & {
    isAdmin?: boolean
    canManageStaff?: boolean
    staffMembers?: Array<{ userId: string; name: string; role: "ADMIN" | "ARBITRE" }>
    studioProjectId?: string | null
  }
}

const statusMap: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" | "live" | "cyber" | "warning" }
> = {
  DRAFT: { label: "Brouillon", variant: "outline" },
  REGISTRATION_OPEN: { label: "Inscriptions ouvertes", variant: "cyber" },
  REGISTRATION_CLOSED: { label: "Inscriptions closes", variant: "secondary" },
  CHECK_IN: { label: "Check-in en cours", variant: "warning" },
  IN_PROGRESS: { label: "En direct", variant: "live" },
  COMPLETED: { label: "Terminé", variant: "outline" },
  CANCELLED: { label: "Annulé", variant: "destructive" },
  ARCHIVED: { label: "Archivé", variant: "outline" },
}

export function TournamentDetailView({ tournament }: TournamentDetailViewProps) {
  const statusConfig = statusMap[tournament.status] || {
    label: tournament.status,
    variant: "outline" as const,
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Navigation de retour */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-muted-foreground hover:text-white -ml-2"
        >
          <Link href="/dashboard/tournaments">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux tournois
          </Link>
        </Button>
      </div>

      {/* Hero Banner du Tournoi */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.12] bg-gradient-to-r from-card via-[#0c1322] to-card p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-cyan/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-60 h-60 bg-brand-violet/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant={statusConfig.variant} className="text-xs uppercase px-3 py-1">
                {statusConfig.label}
              </Badge>
              <span className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-brand-cyan bg-brand-cyan/10 px-2.5 py-1 rounded-full border border-brand-cyan/20">
                <Gamepad2 className="h-3.5 w-3.5" />
                {tournament.game}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Monitor className="h-3.5 w-3.5" />
                {tournament.platform}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase">
              {tournament.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                {tournament.starts_at
                  ? `Début le ${new Date(tournament.starts_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`
                  : `Créé le ${new Date(tournament.created_at).toLocaleDateString("fr-FR")}`}
              </span>
              <span>•</span>
              <span className="text-slate-300">
                Organisé par <strong className="text-white">{tournament.creator?.username || "Staff"}</strong>
              </span>
              {tournament.prize_pool && (
                <>
                  <span>•</span>
                  <span className="font-bold text-amber-400 flex items-center gap-1">
                    <Trophy className="size-3.5 text-amber-400" />
                    Cashprize : {Number(tournament.prize_pool).toLocaleString("fr-FR")} {tournament.prize_currency ?? "EUR"}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {tournament.isAdmin && (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/tournaments/${tournament.id}/edit`}>
                    <Edit className="size-3.5 mr-1.5 text-slate-400" />
                    Paramètres
                  </Link>
                </Button>
                <Button size="sm" variant="cyber" asChild>
                  <Link
                    href={
                      tournament.studioProjectId
                        ? `/dashboard/studio/${tournament.studioProjectId}`
                        : `/dashboard/studio/new?tournamentId=${tournament.id}`
                    }
                  >
                    <Clapperboard className="size-3.5 mr-1.5" />
                    {tournament.studioProjectId ? "Studio Broadcast" : "Créer Studio OBS"}
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Onglets de navigation */}
      <Tabs defaultValue="bracket" className="space-y-6">
        <TabsList className="w-full justify-start border-b border-white/[0.08] rounded-none bg-transparent p-0 gap-8 h-auto pb-px">
          <TabsTrigger
            value="bracket"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-cyan data-[state=active]:text-brand-cyan data-[state=active]:bg-transparent px-2 pb-3 pt-2 text-sm font-bold uppercase tracking-wider text-muted-foreground transition-colors"
          >
            Arbre de tournoi
          </TabsTrigger>
          <TabsTrigger
            value="participants"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-cyan data-[state=active]:text-brand-cyan data-[state=active]:bg-transparent px-2 pb-3 pt-2 text-sm font-bold uppercase tracking-wider text-muted-foreground transition-colors flex items-center gap-2"
          >
            Équipes & Roster
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white">
              {tournament.registrations?.length || 0}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="overview"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-cyan data-[state=active]:text-brand-cyan data-[state=active]:bg-transparent px-2 pb-3 pt-2 text-sm font-bold uppercase tracking-wider text-muted-foreground transition-colors"
          >
            Règlement & Infos
          </TabsTrigger>
        </TabsList>

        {/* TAB: BRACKET */}
        <TabsContent value="bracket" className="space-y-6 pt-2">
          <TournamentBracket initialMatches={tournament.bracketMatches} />
        </TabsContent>

        {/* TAB: PARTICIPANTS & INVITATIONS */}
        <TabsContent value="participants" className="space-y-6 pt-2">
          {tournament.isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <UserPlus className="h-4 w-4 text-brand-cyan" /> Inviter une équipe à la compétition
                </CardTitle>
                <CardDescription>
                  Recherchez une équipe enregistrée ou invitez son capitaine par email.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InviteTeamForm
                  tournamentId={tournament.id}
                  existingRegistrations={tournament.registrations || []}
                />
              </CardContent>
            </Card>
          )}

          {/* Liste des équipes enregistrées */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  Lineups & Équipes inscrites ({tournament.registrations?.length || 0})
                </CardTitle>
                <CardDescription>
                  Liste des participants confirmés pour le tirage au sort
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {tournament.registrations && tournament.registrations.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {tournament.registrations.map((reg) => (
                    <div
                      key={reg.id}
                      className="flex items-center justify-between p-3.5 border border-white/[0.08] rounded-xl bg-black/40 hover:border-brand-cyan/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/30 flex items-center justify-center font-bold text-brand-cyan text-sm">
                          {reg.team.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{reg.team.name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {reg.team.game} · {reg.team.platform}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          reg.status === "APPROVED" || reg.status === "CHECKED_IN"
                            ? "cyber"
                            : "secondary"
                        }
                        className="text-[10px]"
                      >
                        {reg.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground py-10 text-center rounded-xl border border-dashed border-white/10 bg-black/20">
                  <Users className="size-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="font-semibold text-white">Aucune équipe n'est encore inscrite.</p>
                  <p className="text-xs text-muted-foreground mt-1">Invitez des rosters pour démarrer la compétition.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Staff d'arbitrage */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="size-4 text-purple-400" />
                Staff de compétition & Arbitres
              </CardTitle>
              <CardDescription>
                Administrateurs et arbitres habilités à arbitrer les matchs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {tournament.canManageStaff && (
                <InviteTournamentStaffForm tournamentId={tournament.id} />
              )}
              {tournament.staffMembers?.length ? (
                <div className="space-y-2 border-t border-white/[0.08] pt-4">
                  {tournament.staffMembers.map((member) => (
                    <TournamentStaffItem
                      key={member.userId}
                      tournamentId={tournament.id}
                      member={member}
                      canManageStaff={tournament.canManageStaff}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Seul le créateur du tournoi est actuellement assigné au staff.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: APERÇU / RÈGLEMENT */}
        <TabsContent value="overview" className="space-y-6 pt-2">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Informations & Règlement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 text-sm text-slate-300">
                <p className="leading-relaxed">
                  {tournament.description || `Tournoi officiel ${tournament.name} disputé sur ${tournament.game}.`}
                </p>

                <div className="grid gap-3 border-t border-white/[0.08] pt-4 sm:grid-cols-2 text-xs">
                  <div>
                    <span className="text-muted-foreground block mb-0.5">Format équipe</span>
                    <span className="font-semibold text-white">
                      {tournament.team_size_min ?? "—"}
                      {tournament.team_size_max ? ` à ${tournament.team_size_max}` : ""} joueurs
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-0.5">Capacité de l'arbre</span>
                    <span className="font-semibold text-white">
                      {tournament.min_teams ?? 2}
                      {tournament.max_teams ? ` à ${tournament.max_teams} équipes` : " équipes"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-0.5">Frais d'inscription</span>
                    <span className="font-semibold text-emerald-400">
                      {tournament.is_free ? "Gratuit" : "Entrée payante"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-0.5">Fuseau horaire</span>
                    <span className="font-semibold text-white">{tournament.timezone ?? "Europe/Paris"}</span>
                  </div>
                </div>

                {tournament.rules && (
                  <div className="border-t border-white/[0.08] pt-4">
                    <h4 className="font-bold text-white uppercase text-xs tracking-wider mb-2">
                      Règlement officiel du tournoi
                    </h4>
                    <div className="rounded-lg bg-black/40 p-4 border border-white/[0.06] text-xs font-mono whitespace-pre-wrap leading-relaxed text-slate-300">
                      {tournament.rules}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-amber-400" />
                    Récompenses
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-4 text-center">
                    <span className="text-[11px] text-amber-300 uppercase tracking-widest font-semibold block mb-1">
                      Cashprize Total
                    </span>
                    <span className="text-2xl font-black text-amber-400">
                      {tournament.prize_pool
                        ? `${Number(tournament.prize_pool).toLocaleString("fr-FR")} ${tournament.prize_currency ?? "EUR"}`
                        : "Gloire & Classement"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Validation des scores</span>
                    <span className="text-white font-medium">Arbitrage auto</span>
                  </div>
                  <Separator className="bg-white/[0.08]" />
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Format arbre</span>
                    <span className="text-white font-medium">Single Elimination</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
