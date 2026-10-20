// components/structures/structure-list.tsx
import Link from "next/link"
import { Structure } from "@/app/actions/structure.actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Calendar, Plus, Users } from "lucide-react"

interface StructureListProps {
  structures: Structure[]
}

export function StructureList({ structures }: StructureListProps) {
  if (structures.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center animate-in fade-in-50">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <Shield className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">Aucune structure trouvée</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          Créez votre première structure e-sport pour regrouper vos équipes et membres.
        </p>
        <Button asChild>
          <Link href="/dashboard/structures/new">
            <Plus className="mr-2 h-4 w-4" />
            Créer une structure
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {structures.map((structure) => (
        <Card key={structure.id} className="flex flex-col justify-between hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-lg font-bold truncate">{structure.name}</CardTitle>
            </div>
          </CardHeader>

          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span>Créateur : {structure.creator?.username || "Inconnu"}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Calendar className="h-3.5 w-3.5" />
              <span>Créée le {new Date(structure.created_at).toLocaleDateString("fr-FR")}</span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              {typeof structure._count?.structure_members === "number" && (
                <span>{structure._count.structure_members} membre{structure._count.structure_members === 1 ? "" : "s"}</span>
              )}
              {typeof structure._count?.structure_teams === "number" && (
                <span>{structure._count.structure_teams} équipe{structure._count.structure_teams === 1 ? "" : "s"}</span>
              )}
            </div>
          </CardContent>

          <CardFooter className="pt-2">
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/dashboard/structures/${structure.id}`}>
                {structure.isAdmin ? 'Gérer la structure' : 'Détails de la structure'}
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}