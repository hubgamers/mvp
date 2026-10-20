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

        const team = inv.target_type === "TOURNAMENT" && inv.team_id
          ? await prisma.teams.findUnique({
              where: { id: inv.team_id },
              select: { name: true },
            })
          : null

        return {
          id: inv.id,
          type: inv.target_type,
          role: inv.role,
          targetName,
          teamName: team?.name,
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
          if (!invite.team_id) {
            throw new Error("Cette invitation de tournoi n'est associée à aucune équipe.")
          }

          const [team, tournament, existingRegistration] = await Promise.all([
            tx.teams.findFirst({
              where: {
                id: invite.team_id,
                created_by: user.id,
                deleted_at: null,
              },
              select: { id: true, game: true },
            }),
            tx.tournaments.findFirst({
              where: {
                id: invite.target_id,
                deleted_at: null,
                status: { in: ["DRAFT", "REGISTRATION_OPEN"] },
              },
              select: { id: true, game: true },
            }),
            tx.tournament_registrations.findUnique({
              where: {
                tournament_id_team_id: {
                  tournament_id: invite.target_id,
                  team_id: invite.team_id,
                },
              },
              select: { id: true },
            }),
          ])

          if (!team) {
            throw new Error("Seul le propriétaire de l'équipe invitée peut répondre à cette invitation.")
          }
          if (!tournament) {
            throw new Error("Le tournoi n'accepte plus d'inscriptions.")
          }
          if (team.game.toLowerCase() !== tournament.game.toLowerCase()) {
            throw new Error("Cette équipe ne joue pas au même jeu que le tournoi.")
          }
          if (existingRegistration) {
            throw new Error("Cette équipe est déjà inscrite à ce tournoi.")
          }

          await tx.tournament_registrations.create({
            data: {
              tournament_id: tournament.id,
              team_id: team.id,
              registered_by: user.id,
              status: "APPROVED",
            },
          })
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
    }
    return { success: true, message: action === 'ACCEPTED' ? "Invitation acceptée !" : "Invitation refusée." }
  } catch (error: any) {
    console.error("Erreur respondToInvitation:", error)
    return { success: false, message: error?.message || "Une erreur est survenue." }
  }
}