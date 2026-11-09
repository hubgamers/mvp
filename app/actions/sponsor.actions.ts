'use server'

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getTournamentEntitlements } from "@/lib/plans";

interface SaveSponsorInput {
    id?: string
    tournamentId: string
    name: string
    logo_url: string
    website_url?: string | null
    tier?: string | null
}

export async function saveSponsor(data: SaveSponsorInput) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Non authentifié." };

    try {
        const entitlements = await getTournamentEntitlements(user.id, data.tournamentId);
        if (!entitlements.sponsorsAndCasters) {
            return {
                success: false,
                message: "Les sponsors sont réservés aux offres Organizer Plus et Pro : /dashboard/billing?category=organizer",
            };
        }

        let sponsorId = data.id;

        // 1. Si on a un ID valide, on met à jour, sinon on crée un nouveau sponsor
        if (sponsorId && sponsorId.trim() !== "") {
            const updated = await prisma.sponsors.update({
                where: { id: sponsorId },
                data: {
                    name: data.name,
                    logo_url: data.logo_url,
                    website_url: data.website_url,
                }
            });
            sponsorId = updated.id;
        } else {
            const created = await prisma.sponsors.create({
                data: {
                    name: data.name,
                    logo_url: data.logo_url,
                    website_url: data.website_url,
                }
            });
            sponsorId = created.id;
        }

        // 2. Créer ou mettre à jour le lien dans tournament_sponsors
        await prisma.tournament_sponsors.upsert({
            where: {
                tournament_id_sponsor_id: {
                    tournament_id: data.tournamentId,
                    sponsor_id: sponsorId
                }
            },
            create: {
                tournament_id: data.tournamentId,
                sponsor_id: sponsorId,
                tier: data.tier || "Partenaire"
            },
            update: {
                tier: data.tier || "Partenaire"
            }
        });

        revalidatePath(`/dashboard/tournaments/${data.tournamentId}`);
        return { success: true, message: "Sponsor sauvegardé avec succès." };
    } catch (error) {
        console.error("Erreur saveSponsor:", error);
        return { success: false, message: "Impossible de sauvegarder le sponsor." };
    }
}

export async function deleteTournamentSponsor(tournamentId: string, sponsorId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Non authentifié." };

    try {
        await prisma.tournament_sponsors.delete({
            where: {
                tournament_id_sponsor_id: {
                    tournament_id: tournamentId,
                    sponsor_id: sponsorId,
                }
            }
        });

        revalidatePath(`/dashboard/tournaments/${tournamentId}`);
        return { success: true, message: "Sponsor retiré du tournoi avec succès." };
    } catch (error) {
        console.error("Erreur deleteTournamentSponsor:", error);
        return { success: false, message: "Impossible de supprimer le sponsor." };
    }
}