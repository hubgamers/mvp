import Link from "next/link"
import { Structure } from "@/app/actions/structure.actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Calendar, Plus, Users, ArrowRight, Building2 } from "lucide-react"

interface StructureListProps {
  structures: Structure[]
}

export function StructureList({ structures }: StructureListProps) {
  if (structures.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/20 p-12 text-center animate-in fade-in-50">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
          <Building2 className="h-10 w-10" />
        </div>
        <h3 className="mt-5 text-xl font-black text-white uppercase tracking-tight">
          Aucune structure enregistrée
        </h3>
        <p className="mb-6 mt-2 max-w-sm text-sm text-muted-foreground leading-relaxed">
          Créez votre première organisation esport pour fédérer vos équipes, encadrants et joueurs sous une même bannière.
        </p>
        <Button size="lg" className="shadow-[0_0_20px_rgba(0,242,254,0.35)]" asChild>
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
        <Card
          key={structure.id}
          className="group flex flex-col justify-between border-white/[0.08] bg-card/75 backdrop-blur-md transition-all duration-300 hover:border-emerald-500/40 hover:-translate-y-1 hover:shadow-[0_12px_35px_rgba(0,0,0,0.6)]"
        >
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500/30 via-teal-500/20 to-transparent" />

          <CardHeader className="pb-3 pt-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center font-black text-emerald-300 text-sm shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                  <Shield className="size-6 text-emerald-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base font-black text-white truncate">
                    {structure.name}
                  </CardTitle>
                  <p className="text-[11px] text-muted-foreground truncate">
                    Par {structure.creator?.username || "Admin"}
                  </p>
                </div>
              </div>
              {structure.isAdmin && (
                <Badge variant="success" className="shrink-0 text-[10px]">
                  ORGANISATEUR
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-3 text-xs text-muted-foreground pt-1 pb-4">
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-black/40 p-2.5 border border-white/[0.05]">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Lineups</span>
                <span className="font-bold text-white text-sm">
                  {typeof structure._count?.structure_teams === "number"
                    ? structure._count.structure_teams
                    : 0}{" "}
                  équipes
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Effectif</span>
                <span className="font-bold text-white text-sm">
                  {typeof structure._count?.structure_members === "number"
                    ? structure._count.structure_members
                    : 0}{" "}
                  membres
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="size-3.5" />
                Créée le {new Date(structure.created_at).toLocaleDateString("fr-FR")}
              </span>
              <span className="text-emerald-400 font-mono font-semibold">CLUB VÉRIFIÉ</span>
            </div>
          </CardContent>

          <CardFooter className="pt-2 pb-4">
            <Button
              variant="outline"
              className="w-full text-xs font-bold uppercase tracking-wider group-hover:border-emerald-500/40 group-hover:text-emerald-300 transition-colors"
              asChild
            >
              <Link href={`/dashboard/structures/${structure.id}`}>
                {structure.isAdmin ? "Administrer la structure" : "Consulter le profil"}
                <ArrowRight className="size-3.5 ml-1.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
