import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

interface SaveTournamentRegistrationInput {
    roster_id: string;
    tournament_id: string;
    status_code: string;
    checked_in: boolean;
}

// Add et update
export async function saveTournamentRegistration(data: SaveTournamentRegistrationInput) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Non authentifié." };

    // Si checked_in est vrai, on met la date actuelle, sinon null
    const checked_at = data.checked_in ? new Date() : null;

    try {
        await prisma.tournaments_registrations.upsert({
            where: {
                roster_id_tournament_id: {
                    roster_id: data.roster_id,
                    tournament_id: data.tournament_id
                }
            },
            create: {
                roster_id: data.roster_id,
                tournament_id: data.tournament_id,
                status_code: data.status_code,
                checked_in: data.checked_in,
                checked_in_at: checked_at
            },
            update: {
                status_code: data.status_code,
                checked_in: data.checked_in,
                checked_in_at: checked_at
            }
        });

        return { success: true, message: "Inscription au tournoi sauvegardée avec succès." };
    } catch (error) {
        console.error("Erreur saveTournamentRegistration:", error);
        return { success: false, message: "Impossible de sauvegarder l'inscription au tournoi." };
    }
}

interface RemoveTournamentRegistrationInput {
    roster_id: string
    tournament_id: string
}

export async function removeTournamentRegistration(data: RemoveTournamentRegistrationInput) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Non authentifié." };

    try {
        await prisma.tournaments_registrations.delete({
            where: {
                roster_id_tournament_id: {
                    roster_id: data.roster_id,
                    tournament_id: data.tournament_id
                }
            },
        });

        return { success: true, message: "Inscription supprimée avec succès." };
    } catch (error) {
        console.error("Erreur removeTournamentRegistration:", error);
        return { success: false, message: "Impossible de supprimer l'inscription du roster." };
    }
}