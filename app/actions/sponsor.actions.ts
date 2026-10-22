'use server'

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

interface SaveSponsorInput {
    id?: string
    name: string
    logo_url: string
    website_url: string
}

// Add et update
export async function saveSponsor(data: SaveSponsorInput) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Non authentifié." };

    try {
        await prisma.sponsors.upsert({
            where: {
                id: data.id
            },
            create: {
                ...data
            },
            update: {
                ...data
            }
        });

        return { success: true, message: "Sponsor sauvegardé avec succès." };
    } catch (error) {
        console.error("Erreur saveTournamentRegistration:", error);
        return { success: false, message: "Impossible de sauvegarder le sponsor." };
    }
}