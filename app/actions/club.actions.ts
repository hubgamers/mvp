'use server'

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { getClubEntitlements, getPlanEntitlements, planLimitMessage } from "@/lib/plans";

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
        const existingClub = await prisma.clubs.findUnique({
            where: { slug: data.slug },
            include: {
                clubs_members: {
                    where: {
                        user_id: user.id,
                        role_code: { in: ["ADMIN", "OWNER"] },
                    },
                    select: { user_id: true },
                },
            },
        });
        if (existingClub && existingClub.clubs_members.length === 0) {
            return { success: false, message: "Cette structure ne vous appartient pas." };
        }

        if ((!existingClub || existingClub.deleted) && !data.deleted) {
            const entitlements = await getPlanEntitlements(user.id, "club");
            const clubCount = await prisma.clubs.count({
                where: {
                    deleted: false,
                    ...(existingClub ? { id: { not: existingClub.id } } : {}),
                    clubs_members: {
                        some: {
                            user_id: user.id,
                            role_code: { in: ["ADMIN", "OWNER"] },
                        },
                    },
                },
            });
            if (clubCount >= entitlements.clubs) {
                return {
                    success: false,
                    message: planLimitMessage("Structures", entitlements.clubs, "club"),
                };
            }
        }

        const entitlements = await getPlanEntitlements(user.id, "club");
        if (data.recruit_open && !entitlements.recruitment) {
            return {
                success: false,
                message: "Le recrutement est réservé aux offres Club Plus et Pro : /dashboard/billing?category=club",
            };
        }

        const club = await prisma.$transaction(async (tx) => {
            const saved = await tx.clubs.upsert({
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

            // Associer le créateur comme ADMIN de sa structure
            await tx.clubs_members.upsert({
                where: {
                    user_id_club_id: {
                        user_id: user.id,
                        club_id: saved.id
                    }
                },
                create: {
                    user_id: user.id,
                    club_id: saved.id,
                    role_code: "OWNER"
                },
                update: {}
            });

            return saved;
        });

        return { success: true, message: "Club sauvegardé avec succès.", club };
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
        const existingMember = await prisma.clubs_members.findUnique({
            where: { user_id_club_id: data },
            select: { user_id: true },
        });
        if (!existingMember) {
            const entitlements = await getClubEntitlements(user.id, data.club_id);
            const memberCount = await prisma.clubs_members.count({
                where: { club_id: data.club_id },
            });
            if (memberCount >= entitlements.clubMembers) {
                return {
                    success: false,
                    message: planLimitMessage("Membres du club", entitlements.clubMembers, "club"),
                };
            }
        }

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