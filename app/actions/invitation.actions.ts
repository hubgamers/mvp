'use server'

import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import {
  checkSquadJoinCapacity,
  checkTournamentRosterCapacity,
  getClubEntitlements,
  getTournamentEntitlements,
  planLimitMessage,
} from "@/lib/plans"

export async function acceptInvitation(code: string, rosterIdForTournament?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Non authentifié." }

  try {
    const invitation = await prisma.invitations.findUnique({
      where: { code },
    })

    if (!invitation) {
      return { success: false, message: "Invitation introuvable." }
    }

    if (invitation.target_type_code === "CLUB") {
      const entitlements = await getClubEntitlements(user.id, invitation.target_id)
      const existingMember = await prisma.clubs_members.findUnique({
        where: {
          user_id_club_id: {
            user_id: user.id,
            club_id: invitation.target_id,
          },
        },
        select: { user_id: true },
      })
      if (!existingMember) {
        const memberCount = await prisma.clubs_members.count({
          where: { club_id: invitation.target_id },
        })
        if (memberCount >= entitlements.clubMembers) {
          return {
            success: false,
            message: planLimitMessage("Membres du club", entitlements.clubMembers, "club"),
          }
        }
      }
    }

    if (invitation.target_type_code === "SQUAD") {
      const capacity = await checkSquadJoinCapacity(user.id, invitation.target_id)
      if (!capacity.allowed) return { success: false, message: capacity.message }
    }

    if (invitation.target_type_code === "TOURNAMENT" && rosterIdForTournament) {
      const capacity = await checkTournamentRosterCapacity(
        user.id,
        invitation.target_id,
        rosterIdForTournament
      )
      if (!capacity.allowed) return { success: false, message: capacity.message }
    }

    if (invitation.status !== "WAIT") {
      return { success: false, message: `Cette invitation est déjà ${invitation.status.toLowerCase()}.` }
    }

    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      return { success: false, message: "Cette invitation a expiré." }
    }

    let tournamentStaffRole = "STAFF"
    if (invitation.target_type_code === "TOURNAMENT_STAFF") {
      tournamentStaffRole = invitation.code.startsWith("ARBITER-")
        ? "ARBITER"
        : invitation.code.startsWith("CASTER-")
          ? "CASTER"
          : "ADMIN"
      const entitlements = await getTournamentEntitlements(user.id, invitation.target_id)
      if (tournamentStaffRole === "CASTER" && !entitlements.sponsorsAndCasters) {
        return {
          success: false,
          message: "Les casters sont réservés aux offres Organizer Plus et Pro : /dashboard/billing?category=organizer",
        }
      }
      if (tournamentStaffRole === "ARBITER") {
        const [refereeCount, pendingInvitations] = await Promise.all([
          prisma.tournaments_members.count({
            where: { tournament_id: invitation.target_id, role_code: "ARBITER" },
          }),
          prisma.invitations.count({
            where: {
              target_id: invitation.target_id,
              target_type_code: "TOURNAMENT_STAFF",
              status: "WAIT",
              code: { startsWith: "ARBITER-", not: invitation.code },
            },
          }),
        ])
        if (refereeCount + pendingInvitations >= entitlements.referees) {
          return {
            success: false,
            message: planLimitMessage("Arbitres par tournoi", entitlements.referees, "organizer"),
          }
        }
      }
    }

    // Effectuer l'adhésion selon le target_type_code
    await prisma.$transaction(async (tx) => {
      if (invitation.target_type_code === "CLUB") {
        await tx.clubs_members.upsert({
          where: {
            user_id_club_id: {
              user_id: user.id,
              club_id: invitation.target_id,
            },
          },
          create: {
            user_id: user.id,
            club_id: invitation.target_id,
            role_code: "USER",
          },
          update: {},
        })
      } else if (invitation.target_type_code === "ROSTER") {
        await tx.rosters_members.upsert({
          where: {
            user_id_roster_id: {
              user_id: user.id,
              roster_id: invitation.target_id,
            },
          },
          create: {
            user_id: user.id,
            roster_id: invitation.target_id,
            role_code: "PLAYER",
          },
          update: {},
        })
      } else if (invitation.target_type_code === "SQUAD") {
        console.log('userId', user.id)
        await tx.squads_members.upsert({
          where: {
            user_id_squad_id: {
              user_id: user.id,
              squad_id: invitation.target_id,
            },
          },
          create: {
            user_id: user.id,
            squad_id: invitation.target_id,
            role_code: "PLAYER",
            status: "JOINED",
          },
          update: {
            status: "JOINED",
          },
        })
      } else if (invitation.target_type_code === "TOURNAMENT") {
        // Inscription de l'équipe au tournoi
        if (!rosterIdForTournament) {
          throw new Error("Un rosterId est requis pour inscrire une équipe au tournoi.")
        }

        await tx.tournaments_registrations.upsert({
          where: {
            roster_id_tournament_id: {
              roster_id: rosterIdForTournament,
              tournament_id: invitation.target_id,
            },
          },
          create: {
            tournament_id: invitation.target_id,
            roster_id: rosterIdForTournament,
            status_code: "CONFIRMED",
            checked_in: false,
          },
          update: {
            status_code: "CONFIRMED",
          },
        })
      } else if (invitation.target_type_code === "TOURNAMENT_STAFF") {
        // Inscription de l'utilisateur dans le staff du tournoi (tournaments_members)
        await tx.tournaments_members.upsert({
          where: {
            user_id_tournament_id: {
              user_id: user.id,
              tournament_id: invitation.target_id,
            },
          },
          create: {
            user_id: user.id,
            tournament_id: invitation.target_id,
            role_code: tournamentStaffRole,
          },
          update: {
            role_code: tournamentStaffRole,
          },
        })
      }

      // Marquer l'invitation comme acceptée
      await tx.invitations.update({
        where: { code },
        data: {
          status: "ACCEPTED",
          uses_count: { increment: 1 },
        },
      })
    })

    revalidatePath("/dashboard/invitations")
    revalidatePath(`/dashboard/tournaments/${invitation.target_id}`)
    
    return { success: true, message: "Invitation acceptée avec succès." }
  } catch (error: any) {
    console.error("Erreur acceptInvitation:", error)
    return { success: false, message: error.message || "Impossible d'accepter l'invitation." }
  }
}

export async function refuseInvitation(code: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Non authentifié." }

  try {
    await prisma.invitations.update({
      where: { code },
      data: { status: "REFUSED" },
    })

    revalidatePath("/dashboard/invitations")
    return { success: true, message: "Invitation refusée." }
  } catch (error) {
    console.error("Erreur refuseInvitation:", error)
    return { success: false, message: "Impossible de refuser l'invitation." }
  }
}

interface CreateInvitationInput {
  target_type_code: "CLUB" | "ROSTER" | "SQUAD"
  target_id: string
  max_uses?: number
  expires_in_days?: number
}

export async function createInvitation(data: CreateInvitationInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Non authentifié." }
  if (!user.email) return { success: false, message: "Votre compte ne possède pas d'adresse e-mail." }

  try {
    // Génération d'un code unique lisible
    const code = Math.random().toString(36).substring(2, 10).toUpperCase()
    const expires_at = data.expires_in_days
      ? new Date(Date.now() + data.expires_in_days * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours par défaut

    const invitation = await prisma.invitations.create({
      data: {
        code,
        inviter_id: user.id,
        email: user.email,
        target_type_code: data.target_type_code,
        target_id: data.target_id,
        status: "WAIT",
        max_uses: data.max_uses || 1,
        expires_at,
      },
    })

    revalidatePath("/dashboard/invitations")
    return { success: true, message: "Invitation créée avec succès.", invitation }
  } catch (error) {
    console.error("Erreur createInvitation:", error)
    return { success: false, message: "Impossible de créer l'invitation." }
  }
}

export async function getInvitationsFromTournamentId(id: string) {
  try {
    const invitations = await prisma.invitations.findMany({
      where: {
        target_type_code: 'TOURNAMENT',
        target_id: id
      }
    });

    return {
      success: true,
      message: "Affichage des invitations du tournois avec succès.",
      invitations
    };
  } catch (error) {
    console.error("Erreur getInvitationsFromTournamentId:", error);
    return { success: false, message: "Impossible d'afficher les invitations.", games: [] };
  }
}