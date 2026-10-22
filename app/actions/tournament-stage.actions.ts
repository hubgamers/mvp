'use server'

import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

interface SaveTournamentStageInput {
    id?: string
    tournament_id: string
    name: string
    type_code: string
    status_code: string
    nb_team: number
    bo_code: string
}

// Add et update
export async function saveTournamentStage(data: SaveTournamentStageInput) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Non authentifié." };

    try {
        await prisma.tournaments_stages.upsert({
            where: {
                id: data.id ?? ""
            },
            create: {
                tournament_id: data.tournament_id,
                name: data.name,
                type_code: data.type_code,
                status_code: data.status_code,
                nb_team: data.nb_team,
                bo_code: data.bo_code
            },
            update: {
                tournament_id: data.tournament_id,
                name: data.name,
                type_code: data.type_code,
                status_code: data.status_code,
                nb_team: data.nb_team,
                bo_code: data.bo_code
            }
        });

        return { success: true, message: "Étape du tournoi sauvegardée avec succès." };
    } catch (error) {
        console.error("Erreur saveTournamentStage:", error);
        return { success: false, message: "Impossible de sauvegarder l'étape du tournoi." };
    }
}

export async function removeTournamentStage(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Non authentifié." };

    try {
        await prisma.tournaments_stages.delete({
            where: {
                id
            },
        });

        return { success: true, message: "Etape supprimée avec succès." };
    } catch (error) {
        console.error("Erreur removeTournamentStage:", error);
        return { success: false, message: "Impossible de supprimer l'étape du tournoi." };
    }
}