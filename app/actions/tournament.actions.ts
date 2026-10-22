import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { tournaments } from "@prisma/client"

interface SaveTournamentInput {
    name: string
    slug: string
    game: string
    status_code: string
    format: string
    platform: string
    cashprize: number
    prix_entree: string
    nb_roster: number
    checkin_enabled: boolean
    checkin_start_at: Date
    checkin_end_at: Date
    start_at: Date
    end_at: Date
    registration_start_at: Date
    registration_end_at: Date
    deleted: boolean
}

// Add et update
export async function saveTournament(data: SaveTournamentInput) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Non authentifié." };

    try {
        await prisma.tournaments.upsert({
            where: {
                slug: data.slug
            },
            create: {
                ...data,
            },
            update: {
                ...data
            }
        });

        return { success: true, message: "Tournoi sauvegardé avec succès." };
    } catch (error) {
        console.error("Erreur saveTournament:", error);
        return { success: false, message: "Impossible de save le tournoi." };
    }
}

interface SaveTournamentMember {
    user_id: string
    tournament_id: string
    role_code: string
}

export async function saveTournamentMember(data: SaveTournamentMember) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Non authentifié." };

    try {
        await prisma.tournaments_members.upsert({
            where: {
                user_id_tournament_id: data
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
        console.error("Erreur saveTournamentMember:", error);
        return { success: false, message: "Impossible de save le membre du club." };
    }
}

interface RemoveTournamentMemberInput {
    user_id: string
    tournament_id: string
}

export async function removeTournamentMember(data: RemoveTournamentMemberInput) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Non authentifié." };

    try {
        await prisma.tournaments_members.delete({
            where: {
                user_id_tournament_id: data
            }
        });

        return { success: true, message: "Membre du tournoi supprimé avec succès." };
    } catch (error) {
        console.error("Erreur removeTournamentMember:", error);
        return { success: false, message: "Impossible de supprimer le membre du tournoi." };
    }
}

interface GetTournamentsFilters {
    query?: string;
    statusFilter?: string;
    gameFilter?: string;
}

export async function getTournaments(myTournaments: boolean, filters?: GetTournamentsFilters) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (myTournaments && !user) {
        return { success: false, message: "Non authentifié.", tournaments: [] };
    }

    try {
        const where: any = {};

        if (filters?.query) {
            where.OR = [
                { name: { contains: filters.query, mode: "insensitive" } },
                { game: { contains: filters.query, mode: "insensitive" } },
            ];
        }

        if (filters?.statusFilter) {
            where.status_code = filters.statusFilter;
        }

        if (filters?.gameFilter) {
            where.game = { equals: filters.gameFilter, mode: "insensitive" };
        }

        if (myTournaments && user) {
            where.tournaments_members = {
                some: {
                    user_id: user.id
                }
            };
        }

        const tournaments = await prisma.tournaments.findMany({
            where,
            orderBy: { start_at: "desc" },
            include: {
                tournament_statuses: true,
                _count: {
                    select: {
                        tournaments_registrations: true,
                        tournament_streams: true,
                    },
                },
            },
        });

        return {
            success: true,
            message: "Tournois récupérés avec succès.",
            tournaments
        };
    } catch (error) {
        console.error("Erreur getTournaments:", error);
        return { success: false, message: "Impossible d'afficher les tournois.", tournaments: [] };
    }
}

export async function getGameListFromTournaments() {
    try {
        const gamesList = await prisma.tournaments.findMany({
            select: { game: true },
            distinct: ["game"],
            where: { game: { not: null } },
        });

        return { 
            success: true, 
            message: "Affichage des jeux avec succès.", 
            games: gamesList.map(g => g.game).filter(Boolean) as string[] 
        };
    } catch (error) {
        console.error("Erreur getGameListFromTournaments:", error);
        return { success: false, message: "Impossible d'afficher les jeux.", games: [] };
    }
}