import Link from "next/link"
import { getTournaments } from "@/app/actions/tournament.actions"
import { Button } from "@/components/ui/button"
import { Globe, Plus, Trophy, Search, Flame } from "lucide-react"
import { TournamentList } from "@/components/tournament/tournament-list"

export default async function TournamentsExplorePage() {
  const tournaments = await getTournaments()

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Globe className="size-5 text-brand-cyan" />
            <span className="text-xs font-bold uppercase tracking-widest text-brand-cyan">
              ARÈNE PUBLIQUE
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase">
            Explorer les Tournois
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Découvrez toutes les compétitions ouvertes aux inscriptions et suivez les brackets en direct.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/tournaments">
              <Trophy className="mr-2 size-4 text-brand-cyan" />
              Mes tournois
            </Link>
          </Button>
          <Button size="sm" className="shadow-[0_0_20px_rgba(0,242,254,0.3)]" asChild>
            <Link href="/dashboard/tournaments/new">
              <Plus className="mr-2 size-4" />
              Créer un tournoi
            </Link>
          </Button>
        </div>
      </div>

      <TournamentList tournaments={tournaments} />
    </div>
  )
}
