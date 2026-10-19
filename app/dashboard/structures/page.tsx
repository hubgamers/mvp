import Link from "next/link"
import { getMyStructures } from "@/app/actions/structure.actions"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Plus } from "lucide-react"
import { StructureList } from "@/components/structure/structure-list"

export default async function StructuresPage() {
  const structures = await getMyStructures()

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Structures & Clubs</h1>
          <p className="text-sm text-muted-foreground">
            Gérez vos structures e-sport et vos équipes affiliées.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/structures/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle structure
          </Link>
        </Button>
      </div>

      <Separator />

      <StructureList structures={structures} />
    </div>
  )
}