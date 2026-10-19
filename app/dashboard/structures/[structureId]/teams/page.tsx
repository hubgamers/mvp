// app/dashboard/structures/[structureId]/teams/page.tsx
import { notFound } from "next/navigation"
import Link from "next/link"
import { getStructureById } from "@/app/actions/structure.actions"
import { getTeamsByStructureId } from "@/app/actions/team.actions"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft } from "lucide-react"
import { TeamList } from "@/components/team/team-list"

interface PageProps {
  params: Promise<{ structureId: string }>
}

export default async function StructureTeamsPage({ params }: PageProps) {
  const { structureId } = await params
  const structure = await getStructureById(structureId)

  if (!structure) {
    notFound()
  }

  const teams = await getTeamsByStructureId(structureId)

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2">
          <Link href={`/dashboard/structures/${structureId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à {structure.name}
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Équipes de {structure.name}</h1>
        <p className="text-sm text-muted-foreground">
          Toutes les équipes enregistrées et rattachées à cette structure.
        </p>
      </div>

      <Separator />

      <TeamList teams={teams} structureId={structureId} />
    </div>
  )
}