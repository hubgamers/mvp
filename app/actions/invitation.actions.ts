'use server'

import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function acceptInvitation(code: string) {
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

    if (invitation.status !== "WAIT") {
      return { success: false, message: `Cette invitation est déjà ${invitation.status.toLowerCase()}.` }
    }

    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      return { success: false, message: "Cette invitation a expiré." }
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
        // Ajout de l'utilisateur dans l'équipe du tournoi (tournaments_members)
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
            role_code: "ARBITER", // Ou tu peux stocker le rôle souhaité si tu as un champ dédié dans l'invitation
          },
          update: {
            role_code: "ARBITER",
          },
        })
      }

      await tx.invitations.update({
        where: { code },
        data: {
          status: "ACCEPTED",
          uses_count: { increment: 1 },
        },
      })
    })

    revalidatePath("/dashboard/invitations")
    return { success: true, message: "Invitation acceptée avec succès." }
  } catch (error) {
    console.error("Erreur acceptInvitation:", error)
    return { success: false, message: "Impossible d'accepter l'invitation." }
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