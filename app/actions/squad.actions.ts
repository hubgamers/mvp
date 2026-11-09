'use server'

import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { SquadMemberStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"
import crypto from "crypto"

interface SaveSquadInput {
    id?: string
    name: string
    type_code: string
    game: string
    platform: string
    nb_places: number
    micro_required: boolean
    level: string
    role_searched: string
}

// Add et update
export async function saveSquad(data: SaveSquadInput) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Non authentifié." };

    try {
        const squadId = data.id || crypto.randomUUID();

        const squad = await prisma.$transaction(async (tx) => {
            const saved = await tx.squads.upsert({
                where: {
                    id: squadId
                },
                create: {
                    id: squadId,
                    name: data.name,
                    type_code: data.type_code,
                    game: data.game,
                    platform: data.platform,
                    nb_places: Number(data.nb_places) || 4,
                    micro_required: Boolean(data.micro_required),
                    level: data.level,
                    role_searched: data.role_searched,
                },
                update: {
                    name: data.name,
                    type_code: data.type_code,
                    game: data.game,
                    platform: data.platform,
                    nb_places: Number(data.nb_places) || 4,
                    micro_required: Boolean(data.micro_required),
                    level: data.level,
                    role_searched: data.role_searched,
                }
            });

            // S'assurer que le créateur est membre OWNER
            await tx.squads_members.upsert({
                where: {
                    user_id_squad_id: {
                        user_id: user.id,
                        squad_id: saved.id
                    }
                },
                create: {
                    user_id: user.id,
                    squad_id: saved.id,
                    role_code: 'OWNER',
                    status: 'JOINED'
                },
                update: {}
            });

            return saved;
        });

        revalidatePath("/dashboard/squads");
        return { success: true, message: "Squad sauvegardée avec succès.", squad };
    } catch (error) {
        console.error("Erreur saveSquad:", error);
        return { success: false, message: "Impossible de save la squad." };
    }
}

interface SaveSquadMemberInput {
    user_id: string
    squad_id: string
    role_code: string
}

export async function saveSquadMember(data: SaveSquadMemberInput) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Non authentifié." };

    try {
        await prisma.squads_members.upsert({
            where: {
                user_id_squad_id: data
            },
            create: {
                ...data,
                status: 'JOINED'
            },
            update: {
                role_code: data.role_code,
            }
        });

        return { success: true, message: "Membre sauvegardé avec succès." };
    } catch (error) {
        console.error("Erreur saveSquadMember:", error);
        return { success: false, message: "Impossible de save le membre de la squad." };
    }
}

export async function joinSquad(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Non authentifié." };

    const user_id_squad_id = {
        user_id: user.id,
        squad_id: id
    };

    const invitationCode = 'invitation-squad-' + id;

    try {
        await Promise.all([
            prisma.squads_members.upsert({
                where: {
                    user_id_squad_id
                },
                create: {
                    user_id: user.id,
                    squad_id: id,
                    role_code: 'MEMBER',
                    status: SquadMemberStatus.INVITE
                },
                update: {
                    role_code: 'MEMBER',
                    status: SquadMemberStatus.INVITE
                }
            }),
            prisma.invitations.upsert({
                where: {
                    code: invitationCode
                },
                create: {
                    code: invitationCode,
                    inviter_id: user.id,
                    email: user.email,
                    target_type_code: 'SQUAD',
                    target_id: id,
                    status: 'WAIT'
                },
                update: {
                    inviter_id: user.id,
                    target_type_code: 'SQUAD',
                    target_id: id,
                    status: 'WAIT'
                }
            })
        ]);

        revalidatePath(`/dashboard/squads/${id}`);
        revalidatePath('/dashboard/squads');
        return { success: true, message: "Demande pour rejoindre l'escouade envoyée avec succès." };
    } catch (error) {
        console.error("Erreur joinSquad:", error);
        return { success: false, message: "Impossible de rejoindre la squad." };
    }
}

interface RemoveSquadMemberInput {
    user_id: string
    squad_id: string
}

export async function removeSquadMember(data: RemoveSquadMemberInput) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Non authentifié." };

    try {
        await prisma.squads_members.delete({
            where: {
                user_id_squad_id: data
            }
        });

        revalidatePath(`/dashboard/squads/${data.squad_id}`);
        revalidatePath('/dashboard/squads');
        return { success: true, message: "Membre retiré de l'escouade avec succès." };
    } catch (error) {
        console.error("Erreur removeSquadMember:", error);
        return { success: false, message: "Impossible de supprimer le membre de la squad." };
    }
}