import { notFound } from "next/navigation"
import { getStructureById } from "@/app/actions/structure.actions"
import { StructureDetailView } from "@/components/structure/structure-detail-view"

interface PageProps {
  params: Promise<{ structureId: string }>
}

export default async function StructureDetailPage({ params }: PageProps) {
  const { structureId } = await params
  const structure = await getStructureById(structureId)

  if (!structure) {
    notFound()
  }

  return <StructureDetailView structure={structure} />
}