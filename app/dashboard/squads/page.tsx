import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { prisma } from "@/lib/prisma"
import {
  Users,
  UserPlus,
  Gamepad2,
  Mic,
  Plus,
  ArrowRight,
  Shield,
  Search,
  Sparkles,
  Flame,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export const metadata = {
  title: "Mes Squads & LFG · HubGamers",
  description: "Gérez vos escouades, sessions de jeu et recherches de coéquipiers.",
}

export default async function DashboardSquadsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Escouades dont l'utilisateur est membre
  const mySquads = await prisma.squads.findMany({
    where: {
      squads_members: {
        some: { user_id: user.id },
      },
    },
    include: {
      squad_types: true,
      squads_members: {
        include: {
          squad_member_roles: true,
          users: { select: { id: true, display_name: true } },
        },
      },
      _count: {
        select: {
          squads_members: true,
        },
      },
    },
    orderBy: { created_at: "desc" },
  })

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Entête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <UserPlus className="size-4 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              RECHERCHE DE JOUEURS · LFG & SQUADS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Mes Escouades & Groupes
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Trouvez les coéquipiers parfaits selon votre niveau, votre jeu et votre style de communication.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" className="border-white/10 text-xs">
            <Link href="/dashboard/squads/explore">
              <Search className="size-3.5 mr-1.5" />
              Explorer les escouades
            </Link>
          </Button>
          <Button asChild className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs">
            <Link href="/dashboard/squads/new">
              <Plus className="size-4 mr-1.5" />
              Créer une escouade
            </Link>
          </Button>
        </div>
      </div>

      {mySquads.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-white/10 bg-black/20">
          <Users className="size-12 mx-auto text-muted-foreground mb-3 opacity-40" />
          <h3 className="text-base font-bold text-white">Vous n'avez rejoint aucune escouade</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Créez votre propre groupe LFG pour recruter des joueurs ou parcourez les escouades publiques ouvertes.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <Button asChild className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs">
              <Link href="/dashboard/squads/new">
                <Plus className="size-3.5 mr-1" />
                Créer une escouade
              </Link>
            </Button>
            <Button asChild variant="outline" className="text-xs border-white/10">
              <Link href="/dashboard/squads/explore">Trouver une escouade</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {mySquads.map((squad) => {
            const myMembership = squad.squads_members.find((m) => m.user_id === user.id)
            const isOwner = myMembership?.role_code === "OWNER"
            const joinedMembers = squad.squads_members.filter((m) => m.status === "JOINED")

            return (
              <Card
                key={squad.id}
                className="group border-white/10 bg-card/60 backdrop-blur-sm hover:border-white/20 hover:bg-card/90 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Badge
                        variant={isOwner ? "default" : "outline"}
                        className={`text-[10px] uppercase font-mono ${
                          isOwner ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" : ""
                        }`}
                      >
                        {myMembership?.squad_member_roles?.label || (isOwner ? "Chef" : "Membre")}
                      </Badge>

                      <Badge variant="secondary" className="text-[10px] bg-white/5 border-white/10">
                        {squad.squad_types?.label || squad.type_code}
                      </Badge>
                    </div>

                    <h2 className="text-lg font-bold text-white tracking-tight line-clamp-1 group-hover:text-cyan-400 transition-colors">
                      {squad.name}
                    </h2>

                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      {squad.game && (
                        <span className="text-cyan-400 font-semibold">{squad.game}</span>
                      )}
                      {squad.platform && <span>· {squad.platform}</span>}
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 pt-0 space-y-3">
                    <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-black/30 border border-white/5 text-xs">
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase">Places</span>
                        <span className="font-bold text-white">
                          {joinedMembers.length} / {squad.nb_places || "Illimité"}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase">Niveau</span>
                        <span className="font-bold text-white">{squad.level || "Tous niveaux"}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                      {squad.role_searched ? (
                        <span className="truncate">Recherche : <strong className="text-white">{squad.role_searched}</strong></span>
                      ) : (
                        <span>Tout rôle accepté</span>
                      )}

                      {squad.micro_required && (
                        <span className="flex items-center gap-1 text-emerald-400 shrink-0 text-[11px]">
                          <Mic className="size-3" /> Micro ON
                        </span>
                      )}
                    </div>
                  </CardContent>
                </div>

                <CardFooter className="p-5 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Statut : {myMembership?.status}
                  </span>
                  <Button asChild size="sm" className="h-8 text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold">
                    <Link href={`/dashboard/squads/${squad.id}`}>
                      Gérer
                      <ArrowRight className="size-3 ml-1" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
