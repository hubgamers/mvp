import { notFound, redirect } from "next/navigation"
import { getStructureById } from "@/app/actions/structure.actions"
import EditStructureContent from "./EditStructureContent"

interface PageProps {
  params: Promise<{ structureId: string }>
}

export default async function EditStructurePage({ params }: PageProps) {
  const { structureId } = await params
  const structure = await getStructureById(structureId)

  if (!structure) {
    notFound()
  }

  // Si l'utilisateur n'est pas admin, on le redirige avec un paramètre d'erreur
  if (!structure.isAdmin) {
    redirect(`/dashboard/structures/${structure.id}?error=unauthorized`)
  }

  return (
    <EditStructureContent structure={structure} />
  )
}