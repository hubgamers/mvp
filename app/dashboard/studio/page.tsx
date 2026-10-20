import Link from "next/link"
import { getMyStudioProjects } from "@/app/actions/studio.actions"
import { StudioProjectList } from "@/components/studio/studio-project-list"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Plus } from "lucide-react"

export default async function StudioPage() {
  const projects = await getMyStudioProjects()

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Studio</h1>
          <p className="text-sm text-muted-foreground">
            Préparez les scènes et l’identité visuelle de vos diffusions.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/studio/new">
            <Plus className="mr-2 size-4" />
            Nouveau projet
          </Link>
        </Button>
      </div>
      <Separator />
      <StudioProjectList projects={projects} />
    </div>
  )
}
