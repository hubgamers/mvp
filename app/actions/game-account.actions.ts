import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server"

interface SaveGameAccountInput {
    game: string
    in_game_name: string
}

// Add et update
export async function saveClub(data: SaveGameAccountInput) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Non authentifié." };

    try {
        await prisma.user_game_accounts.upsert({
            where: {
                // Assurez-vous que votre schéma Prisma possède bien une contrainte 
                // unique composée (compound unique) sur [user_id, game]
                user_id_game: {
                    user_id: user.id,
                    game: data.game
                }
            },
            create: {
                user_id: user.id,
                game: data.game,
                in_game_name: data.in_game_name
            },
            update: {
                in_game_name: data.in_game_name
            }
        });

        return { success: true, message: "Compte de jeu ajouté avec succès." };
    } catch (error) {
        console.error("Erreur addGameAccount:", error);
        return { success: false, message: "Impossible d'ajouter le compte de jeu." };
    }
}

export async function verifyGameAccount() {
    // TODO: Déclenche la verif du compte via API (PSN, XBOX etc..)
}

export async function removeGameAccount(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Non authentifié." }

    try {
        await prisma.user_game_accounts.delete({
            where: {
                id
            }
        })
    } catch (error) {
        console.error("Erreur removeGameAccount:", error)
        return { success: false, message: "Impossible de supprimer le compte de jeu." }
    }
}