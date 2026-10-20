// app/actions/invitation.actions.ts
'use server'

import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

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
      },
    })

    if (!invite) {
      return { success: false, message: "Invitation invalide, expirée ou déjà traitée." }
    }

    // 2. Traitement de l'acceptation via une transaction Prisma sécurisée
    if (action === 'ACCEPTED') {
      await prisma.$transaction(async (tx) => {
        if (invite.target_type === 'TEAM') {
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

        // 3. Mettre à jour le statut de l'invitation
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
    return { success: true, message: action === 'ACCEPTED' ? "Invitation acceptée !" : "Invitation refusée." }
  } catch (error: any) {
    console.error("Erreur respondToInvitation:", error)
    return { success: false, message: error?.message || "Une erreur est survenue." }
  }
}