'use server'

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache"
import crypto from "crypto"
import { checkTournamentRosterCapacity } from "@/lib/plans"

interface SaveTournamentRegistrationInput {
    roster_id: string;
    tournament_id: string;
    status_code: string;
    checked_in: boolean;
}

// Add et update
export async function saveTournamentRegistration(data: SaveTournamentRegistrationInput) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Non authentifié." };

    // Si checked_in est vrai, on met la date actuelle, sinon null
    const checked_at = data.checked_in ? new Date() : null;

    try {
        const capacity = await checkTournamentRosterCapacity(
            user.id,
            data.tournament_id,
            data.roster_id
        );
        if (!capacity.allowed) {
            const existing = await prisma.tournaments_registrations.findUnique({
                where: {
                    roster_id_tournament_id: {
                        roster_id: data.roster_id,
                        tournament_id: data.tournament_id,
                    },
                },
                select: { roster_id: true },
            });
            if (!existing) return { success: false, message: capacity.message };
        }

        await prisma.tournaments_registrations.upsert({
            where: {
                roster_id_tournament_id: {
                    roster_id: data.roster_id,
                    tournament_id: data.tournament_id
                }
            },
            create: {
                roster_id: data.roster_id,
                tournament_id: data.tournament_id,
                status_code: data.status_code,
                checked_in: data.checked_in,
                checked_in_at: checked_at
            },
            update: {
                status_code: data.status_code,
                checked_in: data.checked_in,
                checked_in_at: checked_at
            }
        });

        return { success: true, message: "Inscription au tournoi sauvegardée avec succès." };
    } catch (error) {
        console.error("Erreur saveTournamentRegistration:", error);
        return { success: false, message: "Impossible de sauvegarder l'inscription au tournoi." };
    }
}

interface RemoveTournamentRegistrationInput {
    roster_id: string
    tournament_id: string
}

export async function removeTournamentRegistration(data: RemoveTournamentRegistrationInput) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Non authentifié." };

    try {
        await prisma.tournaments_registrations.delete({
            where: {
                roster_id_tournament_id: {
                    roster_id: data.roster_id,
                    tournament_id: data.tournament_id
                }
            },
        });

        return { success: true, message: "Inscription supprimée avec succès." };
    } catch (error) {
        console.error("Erreur removeTournamentRegistration:", error);
        return { success: false, message: "Impossible de supprimer l'inscription du roster." };
    }
}

export async function addRosterToTournamentDirectly({
  tournamentId,
  rosterId,
}: {
  tournamentId: string
  rosterId: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Non authentifié." }

  try {
    const capacity = await checkTournamentRosterCapacity(user.id, tournamentId, rosterId)
    if (!capacity.allowed) return { success: false, message: capacity.message }

    const existing = await prisma.tournaments_registrations.findUnique({
      where: {
        roster_id_tournament_id: {
          tournament_id: tournamentId,
          roster_id: rosterId,
        },
      },
    })

    if (existing) {
      return { success: false, message: "Cette équipe est déjà inscrite au tournoi." }
    }

    await prisma.tournaments_registrations.create({
      data: {
        tournament_id: tournamentId,
        roster_id: rosterId,
        status_code: "CONFIRMED",
        checked_in: false,
      },
    })

    revalidatePath(`/dashboard/tournaments/${tournamentId}`)
    return { success: true, message: "Équipe ajoutée au tournoi avec succès." }
  } catch (error) {
    console.error("Erreur addRosterToTournamentDirectly:", error)
    return { success: false, message: "Impossible d'ajouter l'équipe au tournoi." }
  }
}

export async function inviteRosterToTournament({
  tournamentId,
  rosterId,
}: {
  tournamentId: string
  rosterId: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Non authentifié." }

  try {
    const capacity = await checkTournamentRosterCapacity(user.id, tournamentId, rosterId)
    if (!capacity.allowed) return { success: false, message: capacity.message }

    // 1. Vérifier si l'équipe existe et récupérer son nom ou vérifier son capitaine si besoin
    const roster = await prisma.rosters.findUnique({
      where: { id: rosterId },
      include: { rosters_members: true }
    })

    if (!roster) {
      return { success: false, message: "Équipe introuvable." }
    }

    // 2. Vérifier si une invitation existe déjà pour cette équipe sur ce tournoi
    const existing = await prisma.invitations.findFirst({
      where: {
        target_id: tournamentId,
        target_type_code: "TOURNAMENT",
        // On peut stocker l'ID du roster dans un champ ou via l'email du capitaine, 
        // ou s'assurer qu'on gère l'invitation par équipe.
      }
    })

    // Génération d'un code unique
    const invitationCode = crypto.randomBytes(6).toString("hex").toUpperCase()

    // On récupère l'email du capitaine (ou d'un membre avec un rôle de captain si défini, sinon du premier membre)
    const captainMember = roster.rosters_members.find((m: any) => m.role_code === "CAPTAIN") || roster.rosters_members[0]
    
    if (!captainMember) {
      return { success: false, message: "Cette équipe n'a aucun membre pour recevoir l'invitation." }
    }

    // Récupérer l'email de l'utilisateur (capitaine) via la table users
    const captainUser = await prisma.users.findUnique({
      where: { id: captainMember.user_id }
    })

    if (!captainUser || !captainUser.email) {
      return { success: false, message: "Impossible de trouver l'e-mail du capitaine de cette équipe." }
    }

    await prisma.invitations.create({
      data: {
        code: invitationCode,
        inviter_id: user.id,
        email: captainUser.email, // Envoyé au capitaine de l'équipe
        target_type_code: "TOURNAMENT",
        target_id: tournamentId,
        status: "WAIT",
        max_uses: 1,
        uses_count: 0,
      },
    })

    revalidatePath(`/dashboard/tournaments/${tournamentId}`)
    return { success: true, message: `Invitation envoyée avec succès au capitaine de l'équipe ${roster.name} !` }
  } catch (error) {
    console.error("Erreur inviteRosterToTournament:", error)
    return { success: false, message: "Impossible d'envoyer l'invitation à l'équipe." }
  }
}