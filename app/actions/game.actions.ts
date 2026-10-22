'use server'

import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

export async function getGames() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Non authentifié." };

    try {
        const games = await prisma.games.findMany();

        return {
            success: true,
            message: "Jeux affichés avec succès.",
            games
        };
    } catch (error) {
        console.error("Erreur getGames:", error);
        return { success: false, message: "Impossible d'afficher les jeux'." };
    }
}