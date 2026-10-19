// app/dashboard/tournaments/new/page.tsx
import { CreateTournamentForm } from "@/components/create-tournament-form"
import { Separator } from "@/components/ui/separator"

export default function NewTournamentPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Créer un tournoi</h1>
        <p className="text-sm text-muted-foreground">
          Configure les informations de base pour lancer un nouvel événement esports.
        </p>
      </div>
      <Separator />
      <CreateTournamentForm />
    </div>
  )
}