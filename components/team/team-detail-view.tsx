// components/teams/team-detail-view.tsx
import Link from "next/link"
import { TeamDetail } from "@/app/actions/team.actions"
import { AddMemberForm } from "./add-member-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Gamepad2, Monitor, Calendar, Users, Trophy } from "lucide-react"

interface TeamDetailViewProps {
  team: TeamDetail & { members?: Array<{ id: string; email: string; role: string }> }
  structureId: string
}

export function TeamDetailView({ team, structureId }: TeamDetailViewProps) {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2">
          <Link href={`/dashboard/structures/${structureId}/teams`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux équipes
          </Link>
        </Button>
      </div>

      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border bg-card p-6 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>
            <Badge variant="outline">{team.platform}</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <Gamepad2 className="h-4 w-4 text-primary" />
              {team.game}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              Créée le {new Date(team.created_at).toLocaleDateString("fr-FR")}
            </span>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <Tabs defaultValue="roster" className="space-y-6">
        <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0 gap-6">
          <TabsTrigger value="roster" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 pb-3 pt-2">
            Roster / Joueurs ({team.members?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="tournaments" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 pb-3 pt-2">
            Tournois inscrits
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roster" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ajouter un membre au roster</CardTitle>
            </CardHeader>
            <CardContent>
              <AddMemberForm teamId={team.id} structureId={structureId} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Membres actuels
              </CardTitle>
            </CardHeader>
            <CardContent>
              {team.members && team.members.length > 0 ? (
                <div className="space-y-3">
                  {team.members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{member.email}</span>
                      </div>
                      <Badge variant={member.role === 'CAPTAIN' ? 'default' : 'secondary'}>
                        {member.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground py-6 text-center">
                  Aucun membre dans cette équipe pour le moment.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tournaments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                Historique des compétitions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground py-8 text-center">
                Cette équipe n'est actuellement inscrite à aucun tournoi.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}