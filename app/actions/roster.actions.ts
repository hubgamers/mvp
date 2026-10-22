import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

interface SaveRosterInput {
    name: string
    slug: string
    platform: string
    game: string
    deleted: boolean
}

// Add et update
export async function saveRoster(data: SaveRosterInput) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Non authentifié." };

    try {
        await prisma.rosters.upsert({
            where: {
                slug: data.slug
            },
            create: {
                ...data,
            },
            update: {
                name: data.name,
                platform: data.platform,
                game: data.game,
                deleted: data.deleted
            }
        });

        return { success: true, message: "Roste sauvegardé avec succès." };
    } catch (error) {
        console.error("Erreur saveRoster:", error);
        return { success: false, message: "Impossible de save le roster." };
    }
}

interface SaveRosterMemberInput {
    user_id: string
    roster_id: string
    role_code: string
}

export async function saveRosterMember(data: SaveRosterMemberInput) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Non authentifié." };

    try {
        await prisma.rosters_members.upsert({
            where: {
                user_id_roster_id: data
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
        console.error("Erreur saveRosterMember:", error);
        return { success: false, message: "Impossible de save le membre du club." };
    }
}

interface RemoveRosterMemberInput {
    user_id: string
    roster_id: string
}

export async function removeRosterMember(data: RemoveRosterMemberInput) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Non authentifié." };

    try {
        await prisma.rosters_members.delete({
            where: {
                user_id_roster_id: data
            }
        });

        return { success: true, message: "Membre du roster supprimé avec succès." };
    } catch (error) {
        console.error("Erreur removeRosterMember:", error);
        return { success: false, message: "Impossible de supprimer le membre du roster." };
    }
}