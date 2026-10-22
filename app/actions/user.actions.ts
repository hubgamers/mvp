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