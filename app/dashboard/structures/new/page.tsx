import { CreateStructureForm } from "@/components/structure/create-structure-form"
import { Separator } from "@/components/ui/separator"

export default function NewStructurePage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Créer une structure</h1>
        <p className="text-sm text-muted-foreground">
          Enregistrez une nouvelle organisation e-sport.
        </p>
      </div>
      <Separator />
      <CreateStructureForm />
    </div>
  )
}