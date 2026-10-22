import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

interface SaveClubInput {
    name: string
    description: string
    slug: string
    recruit_open: boolean
    deleted: boolean
}

// Add et update
export async function saveClub(data: SaveClubInput) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Non authentifié." };

    try {
        await prisma.clubs.upsert({
            where: {
                slug: data.slug
            },
            create: {
                ...data,
            },
            update: {
                name: data.name,
                description: data.description,
                recruit_open: data.recruit_open,
                deleted: data.deleted
            }
        });

        return { success: true, message: "Club sauvegardée avec succès." };
    } catch (error) {
        console.error("Erreur saveClub:", error);
        return { success: false, message: "Impossible de save le club." };
    }
}

interface SaveClubMemberInput {
    user_id: string
    club_id: string
    role_code: string
}

export async function saveClubMember(data: SaveClubMemberInput) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Non authentifié." };

    try {
        await prisma.clubs_members.upsert({
            where: {
                user_id_club_id: data
            },
            create: {
                ...data
            },
            update: {
                role_code: data.role_code,
            }
        });

        return { success: true, message: "Membre sauvegardé avec succès." };
    } catch (error) {
        console.error("Erreur saveClubMember:", error);
        return { success: false, message: "Impossible de save le membre du club." };
    }
}

interface RemoveClubMemberInput {
    user_id: string
    club_id: string
}

export async function removeClubMember(data: RemoveClubMemberInput) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Non authentifié." };

    try {
        await prisma.clubs_members.delete({
            where: {
                user_id_club_id: data
            }
        });

        return { success: true, message: "Membre du club supprimé avec succès." };
    } catch (error) {
        console.error("Erreur removeClubMember:", error);
        return { success: false, message: "Impossible de supprimer le membre du club." };
    }
}