// components/tournaments/tournament-detail-view.tsx
import Link from "next/link"
import { TournamentDetail } from "@/app/actions/tournament.actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Gamepad2, Monitor, Calendar, Users, ArrowLeft, Trophy, UserPlus, Clapperboard } from "lucide-react"
import InviteTeamForm from "./invite-team-form"
import { TournamentBracket } from "./details/tournament-bracket"

interface TournamentDetailViewProps {
  tournament: TournamentDetail & {
    isAdmin?: boolean
    studioProjectId?: string | null
  }
}

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  DRAFT: { label: "Brouillon", variant: "secondary" },
  REGISTRATION_OPEN: { label: "Inscriptions ouvertes", variant: "default" },
  REGISTRATION_CLOSED: { label: "Inscriptions closes", variant: "secondary" },
  CHECK_IN: { label: "Check-in", variant: "secondary" },
  IN_PROGRESS: { label: "En cours", variant: "default" },
  COMPLETED: { label: "Terminé", variant: "outline" },
  CANCELLED: { label: "Annulé", variant: "destructive" },
  ARCHIVED: { label: "Archivé", variant: "outline" },
}

export function TournamentDetailView({ tournament }: TournamentDetailViewProps) {
  const statusConfig = statusMap[tournament.status] || { label: tournament.status, variant: "outline" as const }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Navigation de retour */}
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2">
          <Link href="/dashboard/tournaments">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux tournois
          </Link>
        </Button>
      </div>

      {/* En-tête du tournoi */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border bg-card p-6 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{tournament.name}</h1>
            <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <Gamepad2 className="h-4 w-4 text-primary" />
              {tournament.game}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Monitor className="h-4 w-4" />
              Plateforme : {tournament.platform}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              Créé le {new Date(tournament.created_at).toLocaleDateString("fr-FR")}
            </span>
            {tournament.isAdmin && (
              <div className="flex items-center gap-4">
                <Link href={`/dashboard/tournaments/${tournament.id}/edit`} className="text-primary hover:underline font-medium">
                  Modifier le tournoi
                </Link>
                <Link
                  href={tournament.studioProjectId
                    ? `/dashboard/studio/${tournament.studioProjectId}`
                    : `/dashboard/studio/new?tournamentId=${tournament.id}`}
                  className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                >
                  <Clapperboard className="h-4 w-4" />
                  {tournament.studioProjectId ? "Ouvrir le Studio" : "Créer le Studio"}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Onglets de navigation */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0 gap-6">
          <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 pb-3 pt-2">
            Aperçu
          </TabsTrigger>
          <TabsTrigger value="participants" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 pb-3 pt-2">
            Équipes Inscrites ({tournament.registrations?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="bracket" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 pb-3 pt-2">
            Arbre de tournoi
          </TabsTrigger>
        </TabsList>

        {/* TAB: APERÇU */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Informations générales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p>{tournament.description || `Tournoi ${tournament.name} sur ${tournament.game}.`}</p>
                <div className="flex items-center gap-2 pt-2">
                  <span className="font-semibold text-foreground">Créé par :</span>
                  <span>{tournament.creator?.username || "Organisateur inconnu"}</span>
                </div>
                <div className="grid gap-3 border-t pt-4 sm:grid-cols-2">
                  <p>
                    <span className="font-semibold text-foreground">Équipes : </span>
                    {tournament.min_teams ?? 2}
                    {tournament.max_teams ? ` à ${tournament.max_teams}` : " minimum"}
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">Format : </span>
                    {tournament.team_size_min ?? "—"}
                    {tournament.team_size_max ? `–${tournament.team_size_max}` : ""} joueurs par équipe
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">Récompense : </span>
                    {tournament.prize_pool
                      ? `${Number(tournament.prize_pool).toLocaleString("fr-FR")} ${tournament.prize_currency ?? "EUR"}`
                      : "Aucune"}
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">Inscription : </span>
                    {tournament.is_free ? "Gratuite" : "Payante"}
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">Début : </span>
                    {tournament.starts_at
                      ? new Date(tournament.starts_at).toLocaleString("fr-FR", { timeZone: tournament.timezone ?? "UTC" })
                      : "À définir"}
                  </p>
                  {tournament.ends_at && (
                    <p>
                      <span className="font-semibold text-foreground">Fin : </span>
                      {new Date(tournament.ends_at).toLocaleString("fr-FR", { timeZone: tournament.timezone ?? "UTC" })}
                    </p>
                  )}
                </div>
                {tournament.rules && (
                  <div className="border-t pt-4">
                    <p className="mb-1 font-semibold text-foreground">Règlement</p>
                    <p className="whitespace-pre-wrap">{tournament.rules}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-amber-500" /> Paramètres
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Statut actuel</span>
                    <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Plateforme</span>
                    <span className="font-semibold">{tournament.platform}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* TAB: PARTICIPANTS & INVITATIONS */}
        <TabsContent value="participants" className="space-y-6">
          {/* Section d'invitation / Inscription d'équipe */}
          {tournament.isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <UserPlus className="h-4 w-4 text-primary" /> Inviter une équipe
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Formulaire ou composant d'invitation */}
                <InviteTeamForm
                  tournamentId={tournament.id}
                  existingRegistrations={tournament.registrations || []}
                />
              </CardContent>
            </Card>
          )}


          {/* Liste des équipes enregistrées */}
          <Card>
            <CardHeader>
              <CardTitle>Équipes enregistrées ({tournament.registrations?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {tournament.registrations && tournament.registrations.length > 0 ? (
                <div className="space-y-3">
                  {tournament.registrations.map((reg) => (
                    <div key={reg.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-semibold">{reg.team.name}</p>
                          <p className="text-xs text-muted-foreground">Jeu : {reg.team.game} ({reg.team.platform})</p>
                        </div>
                      </div>
                      <Badge variant={reg.status === 'APPROVED' || reg.status === 'CHECKED_IN' ? 'default' : 'secondary'}>
                        {reg.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground py-8 text-center">
                  Aucune équipe n'est inscrite pour le moment.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: BRACKET */}
        <TabsContent value="bracket">
          <TournamentBracket initialMatches={tournament.bracketMatches} />
        </TabsContent>
      </Tabs>
    </div>
  )
}