import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { SquadMemberStatus } from "@prisma/client"

interface SaveSquadInput {
    id: string
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
        await prisma.squads.upsert({
            where: {
                id: data.id
            },
            create: {
                ...data,
            },
            update: {
                ...data
            }
        });

        return { success: true, message: "Squad sauvegardée avec succès." };
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
                    role_code: 'USER',
                    status: SquadMemberStatus.INVITE
                },
                update: {
                    role_code: 'USER',
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
                    target_type_code: 'SQUAD',
                    target_id: id
                },
                update: {
                    inviter_id: user.id,
                    target_type_code: 'SQUAD',
                    target_id: id
                }
            })
        ]);

        return { success: true, message: "Invitation à la squad créée/mise à jour avec succès." };
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

        return { success: true, message: "Membre de la squad supprimé avec succès." };
    } catch (error) {
        console.error("Erreur removeSquadMember:", error);
        return { success: false, message: "Impossible de supprimer le membre de la squad." };
    }
}