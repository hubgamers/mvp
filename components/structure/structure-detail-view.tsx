// components/structures/structure-detail-view.tsx
import Link from "next/link"
import { Structure } from "@/app/actions/structure.actions"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Shield, Calendar, Edit, Gamepad2, Monitor, ExternalLink } from "lucide-react"
import { CreateTeamForm } from "../team/create-team-form"
import { StructureMembersView } from "./structure-member-view"

interface StructureDetailViewProps {
  structure: Structure
}

export function StructureDetailView({ structure }: StructureDetailViewProps) {
  const isAdmin = structure.isAdmin ?? false

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2">
          <Link href="/dashboard/structures">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux structures
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border bg-card p-6 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{structure.name}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <Shield className="h-4 w-4 text-primary" />
              Propriétaire : {structure.creator?.username || "Inconnu"}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              Créée le {new Date(structure.created_at).toLocaleDateString("fr-FR")}
            </span>
          </div>
        </div>

        {isAdmin && (
          <div>
            <Button variant="outline" asChild>
              <Link href={`/dashboard/structures/${structure.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </Link>
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0 gap-6">
          <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 pb-3 pt-2">
            Aperçu
          </TabsTrigger>
          <TabsTrigger value="members" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 pb-3 pt-2">
            Membres ({structure.members?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="teams" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 pb-3 pt-2">
            Équipes affiliées ({structure.teams?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Informations de la structure</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <div className="space-y-4">
                <p>{structure.description || `Gestion centralisée de la structure ${structure.name}.`}</p>
                {structure.website_url && (
                  <a
                    href={structure.website_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 font-medium text-primary hover:underline"
                  >
                    Site officiel <ExternalLink className="size-4" />
                  </a>
                )}
                <p>{structure.is_public ? "Structure publique" : "Structure privée"}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members">
          <StructureMembersView
            structureId={structure.id}
            members={structure.members || []}
            isAdmin={isAdmin}
          />
        </TabsContent>

        <TabsContent value="teams" className="space-y-6">
          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle>Ajouter une nouvelle équipe</CardTitle>
              </CardHeader>
              <CardContent>
                <CreateTeamForm structureId={structure.id} />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Équipes enregistrées ({structure.teams?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {structure.teams && structure.teams.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {structure.teams.map((team: any) => (
                    <div key={team.id} className="p-4 border rounded-lg flex flex-col justify-between space-y-2">
                      <div>
                        <Link href={`/dashboard/structures/${structure.id}/teams/${team.id}`}>
                          <h4 className="font-bold text-base hover:underline">{team.name}</h4>
                        </Link>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Gamepad2 className="h-3.5 w-3.5 text-primary" /> {team.game}
                          <span>•</span>
                          <Monitor className="h-3.5 w-3.5" /> {team.platform}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground py-6 text-center">
                  Aucune équipe rattachée à cette structure pour le moment.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}