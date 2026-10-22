'use server'

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface SaveGameAccountInput {
    game: string;
    in_game_name: string;
    game_user_id?: string;
}

// Add et update
export async function saveGameAccount(data: SaveGameAccountInput) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Non authentifié." };

    try {
        await prisma.user_game_accounts.upsert({
            where: {
                user_id_game: {
                    user_id: user.id,
                    game: data.game
                }
            },
            create: {
                user_id: user.id,
                game: data.game,
                in_game_name: data.in_game_name,
                game_user_id: data.game_user_id || null,
            },
            update: {
                in_game_name: data.in_game_name,
                game_user_id: data.game_user_id || null,
            }
        });

        revalidatePath("/dashboard/user");
        return { success: true, message: "Compte de jeu enregistré avec succès." };
    } catch (error) {
        console.error("Erreur saveGameAccount:", error);
        return { success: false, message: "Impossible d'enregistrer le compte de jeu." };
    }
}

// Alias pour compatibilité
export const saveClub = saveGameAccount;

export async function verifyGameAccount(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Non authentifié." };

    try {
        await prisma.user_game_accounts.update({
            where: { id },
            data: { verified: true }
        });
        revalidatePath("/dashboard/user");
        return { success: true, message: "Compte vérifié avec succès." };
    } catch (error) {
        console.error("Erreur verifyGameAccount:", error);
        return { success: false, message: "Impossible de vérifier le compte." };
    }
}

export async function removeGameAccount(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Non authentifié." };

    try {
        await prisma.user_game_accounts.delete({
            where: {
                id
            }
        });
        revalidatePath("/dashboard/user");
        return { success: true, message: "Compte de jeu supprimé avec succès." };
    } catch (error) {
        console.error("Erreur removeGameAccount:", error);
        return { success: false, message: "Impossible de supprimer le compte de jeu." };
    }
}
