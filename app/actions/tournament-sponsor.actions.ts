import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

interface SaveTournamentSponsorInput {
    tournament_id: string;
    sponsor_id: string;
    tier?: string;
}

// Add et update
export async function saveTournamentSponsor(data: SaveTournamentSponsorInput) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Non authentifié." };

    try {
        await prisma.tournament_sponsors.upsert({
            where: {
                tournament_id_sponsor_id: {
                    tournament_id: data.tournament_id,
                    sponsor_id: data.sponsor_id
                }
            },
            create: {
                ...data
            },
            update: {
                tier: data.tier
            }
        });

        return { success: true, message: "Sponsor du tournoi sauvegardé avec succès." };
    } catch (error) {
        console.error("Erreur saveTournamentSponsor:", error); // Corrigé le nom de la fonction dans le log
        return { success: false, message: "Impossible de sauvegarder le sponsor du tournoi." };
    }
}

interface RemoveTournamentSponsorInput {
    tournament_id: string;
    sponsor_id: string;
}

export async function removeTournamentSponsor(data: RemoveTournamentSponsorInput) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Non authentifié." };

    try {
        await prisma.tournament_sponsors.delete({
            where: {
                tournament_id_sponsor_id: {
                    tournament_id: data.tournament_id,
                    sponsor_id: data.sponsor_id
                }
            }
        });

        return { success: true, message: "Sponsor supprimé avec succès du tournoi." };
    } catch (error) {
        console.error("Erreur removeTournamentSponsor:", error);
        return { success: false, message: "Impossible de supprimer le sponsor du tournoi." };
    }
}