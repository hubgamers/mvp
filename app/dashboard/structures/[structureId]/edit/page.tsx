import { notFound } from "next/navigation"
import Link from "next/link"
import { getStructureById } from "@/app/actions/structure.actions"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft } from "lucide-react"
import { EditStructureForm } from "@/components/structure/edit-structure-form"

interface PageProps {
  params: Promise<{ structureId: string }>
}

export default async function EditStructurePage({ params }: PageProps) {
  const { structureId } = await params
  const structure = await getStructureById(structureId)

  if (!structure) {
    notFound()
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2">
          <Link href={`/dashboard/structures/${structure.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la structure
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Modifier la structure</h1>
        <p className="text-sm text-muted-foreground">
          Mettez à jour le nom de la structure {structure.name}.
        </p>
      </div>

      <Separator />

      <EditStructureForm structure={structure} />
    </div>
  )
}