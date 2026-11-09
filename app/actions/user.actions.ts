'use server'

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server"


export async function getUserProfile() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Non authentifié." }

    try {
        await prisma.users.findFirst({
            where: {
                email: user.email
            }
        })
    } catch (error) {
        console.error("Erreur getUserProfile:", error)
        return { success: false, message: "Impossible de trouver le profil." }
    }
}

export async function searchUserFromId(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Non authentifié." };

    try {
        const user = await prisma.users.findFirst({
            where: {
                id
            }
        })

        return {
            success: true,
            message: "Utilisateur affiché avec succès.",
            user
        };
    } catch (error) {
        console.error("Erreur searchUserFromId:", error);
        return { success: false, message: "Impossible d'afficher l'utilisateur." };
    }
}

interface UpdateProfileInput {
    display_name: string
}

export async function updateUserProfile(data: UpdateProfileInput) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Non authentifié." }

    try {
        await prisma.users.update({
            where: {
                email: user.email
            },
            data
        })
    } catch (error) {
        console.error("Erreur updateUserProfile:", error)
        return { success: false, message: "Impossible de modifier le profil." }
    }
}

export async function deleteAccount() {
    // TODO: faire la delete
}