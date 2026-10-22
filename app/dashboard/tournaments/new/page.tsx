import { getGames } from "@/app/actions/game.actions"
import NewTournamentForm from "./NewTournamentForm"

export const metadata = {
  title: "Nouveau Tournoi · HubGamers",
  description: "Créer un nouveau tournoi esport officiel.",
}

export default async function NewTournamentPage() {
  // Récupération des jeux côté serveur
  const res = await getGames()
  const gamesList = res?.games || []

  return <NewTournamentForm gamesList={gamesList} />
}