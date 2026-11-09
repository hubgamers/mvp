'use server'

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { getPlanEntitlements, planLimitMessage } from "@/lib/plans";

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
        const existingRoster = await prisma.rosters.findUnique({
            where: { slug: data.slug },
            include: { rosters_members: { where: { user_id: user.id }, select: { user_id: true } } },
        });
        if (existingRoster && existingRoster.rosters_members.length === 0) {
            return { success: false, message: "Cette line-up ne vous appartient pas." };
        }

        if ((!existingRoster || existingRoster.deleted) && !data.deleted) {
            const entitlements = await getPlanEntitlements(user.id, "club");
            const lineupCount = await prisma.rosters.count({
                where: {
                    deleted: false,
                    ...(existingRoster ? { id: { not: existingRoster.id } } : {}),
                    rosters_members: { some: { user_id: user.id, role_code: "CAPTAIN" } },
                },
            });
            if (lineupCount >= entitlements.lineups) {
                return {
                    success: false,
                    message: planLimitMessage("Line-ups", entitlements.lineups, "club"),
                };
            }
        }

        const roster = await prisma.$transaction(async (tx) => {
            const saved = await tx.rosters.upsert({
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

            // Enregistrer automatiquement le créateur comme CAPTAIN
            await tx.rosters_members.upsert({
                where: {
                    user_id_roster_id: {
                        user_id: user.id,
                        roster_id: saved.id
                    }
                },
                create: {
                    user_id: user.id,
                    roster_id: saved.id,
                    role_code: "CAPTAIN"
                },
                update: {}
            });

            return saved;
        });

        return { success: true, message: "Roster sauvegardé avec succès.", roster };
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