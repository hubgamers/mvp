// app/actions/invitation.actions.ts
'use server'

import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function inviteTeamToTournament(tournamentId: string, teamId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Non authentifié." }

  try {
    const [tournament, team] = await Promise.all([
      prisma.tournaments.findFirst({
        where: {
          id: tournamentId,
          created_by: user.id,
          deleted_at: null,
          status: { in: ["DRAFT", "REGISTRATION_OPEN"] },
        },
        select: { id: true, name: true, game: true },
      }),
      prisma.teams.findFirst({
        where: { id: teamId, deleted_at: null, is_public: true },
        select: { id: true, name: true, game: true, created_by: true },
      }),
    ])

    if (!tournament) {
      return { success: false, message: "Tournoi introuvable, fermé ou action non autorisée." }
    }
    if (!team) {
      return { success: false, message: "Équipe introuvable ou privée." }
    }
    if (tournament.game.toLowerCase() !== team.game.toLowerCase()) {
      return { success: false, message: "Cette équipe ne joue pas au même jeu que le tournoi." }
    }

    const owner = await prisma.users.findUnique({
      where: { id: team.created_by },
      select: { email: true },
    })
    if (!owner?.email) {
      return { success: false, message: "Impossible de trouver l'adresse e-mail du propriétaire de l'équipe." }
    }

    const [existingRegistration, pendingInvitation] = await Promise.all([
      prisma.tournament_registrations.findUnique({
        where: { tournament_id_team_id: { tournament_id: tournamentId, team_id: teamId } },
        select: { id: true },
      }),
      prisma.invitations.findFirst({
        where: {
          target_type: "TOURNAMENT",
          target_id: tournamentId,
          team_id: teamId,
          status: "PENDING",
          expires_at: { gt: new Date() },
        },
        select: { id: true },
      }),
    ])

    if (existingRegistration) {
      return { success: false, message: "Cette équipe est déjà inscrite à ce tournoi." }
    }
    if (pendingInvitation) {
      return { success: false, message: "Une invitation est déjà en attente pour cette équipe." }
    }

    const escapeHtml = (value: string) =>
      value.replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character] ?? character)

    await prisma.invitations.create({
      data: {
        email: owner.email,
        target_type: "TOURNAMENT",
        target_id: tournamentId,
        team_id: teamId,
        invited_by: user.id,
        token_hash: crypto.randomUUID(),
      },
    })

    try {
      const { error } = await resend.emails.send({
        from: "HubGamers <onboarding@resend.dev>",
        to: owner.email,
        subject: "Invitation à un tournoi HubGamers",
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2>Invitation à un tournoi</h2>
            <p>Bonjour,</p>
            <p>L'équipe <strong>${escapeHtml(team.name)}</strong> est invitée au tournoi <strong>${escapeHtml(tournament.name)}</strong>.</p>
            <p>Connectez-vous à HubGamers et ouvrez <strong>Mes invitations</strong> pour accepter ou refuser.</p>
          </div>
        `,
      })
      if (error) throw error
    } catch (error) {
      console.error("Erreur envoi e-mail invitation tournoi:", error)
      revalidatePath("/dashboard/invitations")
      revalidatePath(`/dashboard/tournaments/${tournamentId}`)
      return { success: true, message: "Invitation créée, mais l'e-mail n'a pas pu être envoyé." }
    }

    revalidatePath("/dashboard/invitations")
    revalidatePath(`/dashboard/tournaments/${tournamentId}`)
    return { success: true, message: "Invitation envoyée au propriétaire de l'équipe." }
  } catch (error: any) {
    console.error("Erreur inviteTeamToTournament:", error)
    return { success: false, message: error?.message || "Impossible de créer l'invitation." }
  }
}

export async function inviteTournamentStaff(
  tournamentId: string,
  _prevState: unknown,
  formData: FormData,
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Non authentifié." }

  const email = String(formData.get("email") || "").trim().toLowerCase()
  const role = String(formData.get("role") || "")
  console.log({ tournamentId, email, role })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, message: "Saisissez une adresse e-mail valide." }
  }
  if (role !== "ADMIN" && role !== "ARBITRE") {
    return { success: false, message: "Le rôle sélectionné est invalide." }
  }

  try {
    const tournament = await prisma.tournaments.findFirst({
      where: { id: tournamentId, deleted_at: null },
      select: { id: true, name: true, created_by: true, organizer_structure_id: true },
    })
    if (!tournament) {
      return { success: false, message: "Tournoi introuvable." }
    }

    const [structureMembership, tournamentMembership] = await Promise.all([
      tournament.organizer_structure_id
        ? prisma.structure_members.findUnique({
          where: {
            structure_id_user_id: {
              structure_id: tournament.organizer_structure_id,
              user_id: user.id,
            },
          },
          select: { role: true },
        })
        : Promise.resolve(null),
      prisma.tournament_members.findUnique({
        where: { tournament_id_user_id: { tournament_id: tournamentId, user_id: user.id } },
        select: { role: true },
      }),
    ])
    const canManageStaff =
      tournament.created_by === user.id ||
      structureMembership?.role === "OWNER" ||
      structureMembership?.role === "ADMIN" ||
      tournamentMembership?.role === "ADMIN"
    if (!canManageStaff) {
      return {
        success: false,
        message: "Seuls le créateur et les administrateurs du tournoi peuvent inviter l’équipe d’organisation.",
      }
    }

    const { data: authData, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
      console.error("Erreur listUsers:", authError)
    }

    // 2. Trouver l'utilisateur spécifique par son e-mail dans le tableau
    const targetAuthUser = authData?.users?.find((u) => u.email === email)
    if (targetAuthUser) {
      const existingMember = await prisma.tournament_members.findUnique({
        where: { tournament_id_user_id: { tournament_id: tournamentId, user_id: targetAuthUser.id } },
        select: { user_id: true },
      })
      if (existingMember) {
        return { success: false, message: "Cette personne fait déjà partie de l’équipe du tournoi." }
      }
    }

    const pendingInvitation = await prisma.invitations.findFirst({
      where: {
        email,
        target_type: "TOURNAMENT",
        target_id: tournamentId,
        role: { in: ["ADMIN", "ARBITRE"] },
        status: "PENDING",
        expires_at: { gt: new Date() },
      },
      select: { id: true },
    })
    if (pendingInvitation) {
      return { success: false, message: "Une invitation d’organisation est déjà en attente pour cette adresse." }
    }

    await prisma.invitations.create({
      data: {
        email,
        target_type: "TOURNAMENT",
        target_id: tournamentId,
        invited_by: user.id,
        role,
        token_hash: crypto.randomUUID(),
      },
    })

    const escapeHtml = (value: string) =>
      value.replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character] ?? character)

    try {
      const { error } = await resend.emails.send({
        from: "HubGamers <onboarding@resend.dev>",
        to: email,
        subject: `Invitation à rejoindre l’organisation de ${tournament.name}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2>Invitation à rejoindre l’équipe d’un tournoi</h2>
            <p>Vous avez été invité à participer au tournoi <strong>${escapeHtml(tournament.name)}</strong> en tant que <strong>${role === "ADMIN" ? "administrateur" : "arbitre"}</strong>.</p>
            <p>Connectez-vous à HubGamers et ouvrez <strong>Mes invitations</strong> pour accepter ou refuser cette proposition.</p>
          </div>
        `,
      })
      if (error) throw error
    } catch (error) {
      console.error("Erreur envoi e-mail invitation organisation tournoi:", error)
      revalidatePath("/dashboard/invitations")
      revalidatePath(`/dashboard/tournaments/${tournamentId}`)
      return { success: true, message: "Invitation créée, mais l’e-mail n’a pas pu être envoyé." }
    }

    revalidatePath("/dashboard/invitations")
    revalidatePath(`/dashboard/tournaments/${tournamentId}`)
    return { success: true, message: "Invitation envoyée." }
  } catch (error) {
    console.error("Erreur inviteTournamentStaff:", error)
    return { success: false, message: "Impossible de créer l’invitation." }
  }
}

// 1. Récupérer les invitations pour l'utilisateur connecté
export async function getMyInvitations() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !user.email) return []

  try {
    const invitations = await prisma.invitations.findMany({
      where: {
        email: user.email,
        status: "PENDING",
        expires_at: { gt: new Date() },
      },
    })

    if (!invitations || invitations.length === 0) return []

    // Résolution dynamique des noms (Structure ou Équipe)
    const enrichedInvitations = await Promise.all(
      invitations.map(async (inv) => {
        let targetName = "Inconnu"

        if (inv.target_type === 'TEAM') {
          const team = await prisma.teams.findUnique({
            where: { id: inv.target_id },
            select: { name: true },
          })
          if (team) targetName = team.name
        } else if (inv.target_type === 'STRUCTURE') {
          const structure = await prisma.structures.findUnique({
            where: { id: inv.target_id },
            select: { name: true },
          })
          if (structure) targetName = structure.name
        } else if (inv.target_type === 'TOURNAMENT') {
          const tournament = await prisma.tournaments.findUnique({
            where: { id: inv.target_id },
            select: { name: true },
          })
          if (tournament) targetName = tournament.name
        }

        return {
          id: inv.id,
          type: inv.target_type,
          role: inv.role,
          targetName,
        }
      })
    )

    return enrichedInvitations
  } catch (error) {
    console.error("Erreur getMyInvitations:", error)
    return []
  }
}

// 2. Répondre à une invitation (Accepter / Refuser)
export async function respondToInvitation(invitationId: string, action: 'ACCEPTED' | 'DECLINED') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !user.email) return { success: false, message: "Non authentifié." }

  try {
    // 1. Récupérer l'invitation ET VERIFIER QU'ELLE EST STRICTEMENT 'PENDING'
    const invite = await prisma.invitations.findFirst({
      where: {
        id: invitationId,
        email: user.email,
        status: "PENDING",
        expires_at: { gt: new Date() },
      },
    })

    if (!invite) {
      return { success: false, message: "Invitation invalide, expirée ou déjà traitée." }
    }

    // 2. Traitement de l'acceptation via une transaction Prisma sécurisée
    if (action === 'ACCEPTED') {
      await prisma.$transaction(async (tx) => {
        if (invite.target_type === 'TOURNAMENT') {
          try {
            await tx.tournament_members.create({
              data: {
                tournament_id: invite.target_id,
                user_id: user.id,
                role: (invite.role as any) || 'ARBITRE'
              }
            })
          } catch (e: any) {
            // Ignore si la relation existe déjà (code d'erreur unique constraint PostgreSQL)
            if (e.code !== 'P2002') throw e
          }
        } else if (invite.target_type === 'TEAM') {
          // Ajout dans le roster de l'équipe (`team_members`)
          try {
            await tx.team_members.create({
              data: {
                team_id: invite.target_id,
                user_id: user.id,
                role: (invite.role as any) || "PLAYER",
              },
            })
          } catch (e: any) {
            // Ignore si la relation existe déjà (code d'erreur unique constraint PostgreSQL)
            if (e.code !== 'P2002') throw e
          }

          // Rattachement automatique à la structure parente si l'équipe y est liée
          const structTeam = await tx.structure_teams.findUnique({
            where: { team_id: invite.target_id },
            select: { structure_id: true },
          })

          if (structTeam) {
            try {
              await tx.structure_members.create({
                data: {
                  structure_id: structTeam.structure_id,
                  user_id: user.id,
                  role: 'MEMBER',
                },
              })
            } catch (e: any) {
              if (e.code !== 'P2002') throw e
            }
          }
        } else if (invite.target_type === 'STRUCTURE') {
          try {
            await tx.structure_members.create({
              data: {
                structure_id: invite.target_id,
                user_id: user.id,
                role: (invite.role as any) || "MEMBER",
              },
            })
          } catch (e: any) {
            if (e.code !== 'P2002') throw e
          }
        }

        // Mettre à jour le statut de l'invitation après son traitement.
        await tx.invitations.update({
          where: { id: invitationId },
          data: {
            status: action,
            accepted_at: new Date(),
            accepted_by: user.id,
          },
        })
      })
    } else {
      // Si l'action est un refus (DECLINED)
      await prisma.invitations.update({
        where: { id: invitationId },
        data: { status: 'DECLINED' },
      })
    }

    revalidatePath("/dashboard/invitations")
    if (invite.target_type === "TOURNAMENT") {
      revalidatePath(`/dashboard/tournaments/${invite.target_id}`)
      revalidatePath("/dashboard/chats")
    }
    return { success: true, message: action === 'ACCEPTED' ? "Invitation acceptée !" : "Invitation refusée." }
  } catch (error: any) {
    console.error("Erreur respondToInvitation:", error)
    return { success: false, message: error?.message || "Une erreur est survenue." }
  }
}