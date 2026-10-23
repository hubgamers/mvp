'use server'

import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface SaveTournamentStageInput {
    id?: string | null
    tournament_id: string
    name: string
    type_code: string
    status_code: string
    nb_team: number
    bo_code: string
}

// Add et update sécurisés
export async function saveTournamentStage(data: SaveTournamentStageInput) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Non authentifié." };

    try {
        if (data.id) {
            // Mise à jour (Update) si un ID existe
            await prisma.tournaments_stages.update({
                where: { id: data.id },
                data: {
                    name: data.name,
                    type_code: data.type_code,
                    status_code: data.status_code,
                    nb_team: data.nb_team,
                    bo_code: data.bo_code
                }
            });
        } else {
            // Création (Create) si aucun ID n'est fourni
            await prisma.tournaments_stages.create({
                data: {
                    tournament_id: data.tournament_id,
                    name: data.name,
                    type_code: data.type_code,
                    status_code: data.status_code,
                    nb_team: data.nb_team,
                    bo_code: data.bo_code
                }
            });
        }

        revalidatePath(`/dashboard/tournaments/${data.tournament_id}`)
        return { success: true, message: "Étape du tournoi sauvegardée avec succès." };
    } catch (error) {
        console.error("Erreur saveTournamentStage:", error);
        return { success: false, message: "Impossible de sauvegarder l'étape du tournoi." };
    }
}

export async function removeTournamentStage(id: string, tournamentId?: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Non authentifié." };

    try {
        await prisma.tournaments_stages.delete({
            where: { id },
        });

        if (tournamentId) {
            revalidatePath(`/dashboard/tournaments/${tournamentId}`)
        }
        return { success: true, message: "Étape supprimée avec succès." };
    } catch (error) {
        console.error("Erreur removeTournamentStage:", error);
        return { success: false, message: "Impossible de supprimer l'étape du tournoi." };
    }
}

interface GenerateMatchesInput {
    stageId: string
    tournamentId: string
    type: "ROUND_ROBIN" | "BRACKET"
    data: any // Soit l'objet des poules { "Poule A": [teams] }, soit le tableau des seeds [teams]
}

export async function generateStageMatches({ stageId, tournamentId, type, data }: GenerateMatchesInput) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, message: "Non authentifié." }

    try {
        // 1. Nettoyer les anciens matchs de cette étape si besoin (optionnel mais propre)
        await prisma.tournaments_matches.deleteMany({
            where: { stage_id: stageId }
        })

        if (type === "ROUND_ROBIN") {
            // `data` est un objet : { "Poule A": [ {id, name}, ... ], "Poule B": [...] }
            for (const [poolName, teams] of Object.entries(data as Record<string, any[]>)) {
                // Génération des matchs en Round-Robin (Aller simple entre chaque équipe de la poule)
                for (let i = 0; i < teams.length; i++) {
                    for (let j = i + 1; j < teams.length; j++) {
                        await prisma.tournaments_matches.create({
                            data: {
                                stage_id: stageId,
                                roster1_id: teams[i].id,
                                roster2_id: teams[j].id,
                                status_code: "SCHEDULED",
                            }
                        })
                    }
                }
            }
        } else if (type === "BRACKET") {
            // `data` est un tableau ordonné de seeds : [team1, team2, team3, team4, ...]
            const teams = data as any[]

            // Génération du 1er tour (Round 1) en paires (Seed 1 vs Dernier, Seed 2 vs Avant-dernier, etc. ou ordre direct)
            for (let i = 0; i < teams.length; i += 2) {
                const team1 = teams[i]
                const team2 = teams[i + 1] || null // S'il y a un BYE (impair)

                await prisma.tournaments_matches.create({
                    data: {
                        stage_id: stageId,
                        roster1_id: team1?.id || null,
                        roster2_id: team2?.id || null,
                        status_code: "SCHEDULED",
                    }
                })
            }
        }

        // Mettre à jour le statut de l'étape si nécessaire
        await prisma.tournaments_stages.update({
            where: { id: stageId },
            data: { status_code: "RUNNING" }
        })

        revalidatePath(`/dashboard/tournaments/${tournamentId}`)
        return { success: true, message: "Matchs générés avec succès !" }
    } catch (error) {
        console.error("Erreur generateStageMatches:", error)
        return { success: false, message: "Erreur lors de la génération des matchs." }
    }
}