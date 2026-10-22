import Link from "next/link"
import { getMyStructures } from "@/app/actions/structure.actions"
import { Button } from "@/components/ui/button"
import { Plus, Building2, Globe } from "lucide-react"
import { StructureList } from "@/components/structure/structure-list"

export default async function StructuresPage() {
  const structures = await getMyStructures()

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="size-5 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              ORGANISATIONS & CLUBS
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase">
            Mes Structures
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gérez vos organisations e-sport, vos équipes affiliées et vos membres officiels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/structures/explore">
              <Globe className="mr-2 size-4 text-slate-400" />
              Explorer
            </Link>
          </Button>
          <Button size="sm" className="shadow-[0_0_20px_rgba(16,185,129,0.3)]" asChild>
            <Link href="/dashboard/structures/new">
              <Plus className="mr-2 size-4" />
              Nouvelle structure
            </Link>
          </Button>
        </div>
      </div>

      <StructureList structures={structures} />
    </div>
  )
}
