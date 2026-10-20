// app/actions/team.actions.ts
'use server'

import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function createTeamForStructure(structureId: string, prevState: any, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Non authentifié." }

  const name = formData.get("name") as string
  const game = formData.get("game") as string
  const platform = (formData.get("platform") as string) || "PC"

  if (!name || !game) {
    return { success: false, message: "Le nom de l'équipe et le jeu sont obligatoires." }
  }

  // Générer un slug unique pour l'équipe
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "") + "-" + Date.now().toString().slice(-4)

  try {
    // 1. Créer l'équipe et la lier à la structure via une transaction Prisma
    await prisma.$transaction(async (tx) => {
      const newTeam = await tx.teams.create({
        data: {
          name,
          slug,
          game,
          platform: platform as any,
          created_by: user.id,
        },
      })

      // 2. Lier l'équipe à la structure dans la table de jointure `structure_teams`
      await tx.structure_teams.create({
        data: {
          structure_id: structureId,
          team_id: newTeam.id,
        },
      })
    })

    revalidatePath(`/dashboard/structures/${structureId}`)
    return { success: true, message: "Équipe créée et rattachée avec succès !" }
  } catch (error: any) {
    console.error("Erreur création équipe:", error)
    return { success: false, message: error?.message || "Erreur lors de la création de l'équipe." }
  }
}

export interface TeamDetail {
  id: string
  name: string
  game: string
  platform: 'PC' | 'PLAYSTATION' | 'XBOX' | 'SWITCH' | 'MOBILE' | 'CROSS_PLATFORM' | 'OTHER'
  created_at: Date
  structure?: {
    id: string
    name: string
  }
  members?: any[]
}

// Récupérer toutes les équipes liées à une structure
export async function getTeamsByStructureId(structureId: string): Promise<TeamDetail[]> {
  try {
    const data = await prisma.structure_teams.findMany({
      where: { structure_id: structureId },
      include: {
        teams: {
          select: {
            id: true,
            name: true,
            game: true,
            platform: true,
            created_at: true,
          },
        },
      },
    })

    if (!data || data.length === 0) return []

    return data
      .map((item) => item.teams)
      .filter((team): team is NonNullable<typeof team> => team !== null) as TeamDetail[]
  } catch (error) {
    console.error("Erreur getTeamsByStructureId:", error)
    return []
  }
}

// Récupérer le détail d'une équipe par son ID
export async function getTeamById(teamId: string, structureId?: string): Promise<TeamDetail | null> {
  try {
    const team = await prisma.teams.findUnique({
      where: { id: teamId },
      include: {
        team_members: {
          include: {
            profiles: {
              select: {
                id: true,
                username: true,
                avatar_url: true,
              },
            },
          },
        },
      },
    })

    if (!team) return null

    const formattedMembers = team.team_members.map((m) => ({
      ...m.profiles,
      role: m.role,
    })).filter((m) => m.id)

    return {
      ...team,
      created_at: team.created_at,
      members: formattedMembers,
    } as TeamDetail
  } catch (error) {
    console.error("Erreur getTeamById:", error)
    return null
  }
}

export async function addMemberToTeam(teamId: string, structureId: string, prevState: any, formData: FormData) {
  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser) return { success: false, message: "Non authentifié." }

  const email = (formData.get("email") as string)?.trim().toLowerCase()
  const role = (formData.get("role") as string) || "PLAYER"

  if (!email) {
    return { success: false, message: "L'email du membre est obligatoire." }
  }

  try {
    // 1. Vérifier si l'utilisateur existe dans Prisma (via son profil ou lookup auth)
    const targetUser = await prisma.users.findFirst({
      where: { email },
      select: { id: true },
    })

    if (targetUser) {
      const existingMember = await prisma.team_members.findUnique({
        where: {
          team_id_user_id: {
            team_id: teamId,
            user_id: targetUser.id,
          },
        },
      })

      if (existingMember) {
        return { success: false, message: "Cet utilisateur fait déjà partie de l'équipe." }
      }
    }

    // 2. Vérifier s'il existe déjà une invitation PENDING en cours
    const pendingInvite = await prisma.invitations.findFirst({
      where: {
        email,
        target_id: teamId,
        target_type: "TEAM",
        status: "PENDING",
      },
    })

    if (pendingInvite) {
      return { success: false, message: "Une invitation est déjà en attente pour cette adresse email." }
    }

    // 3. Récupérer le nom de l'équipe
    const teamData = await prisma.teams.findUnique({
      where: { id: teamId },
      select: { name: true },
    })
    const teamName = teamData?.name || "l'équipe"

    // Créer l'invitation
    await prisma.invitations.create({
      data: {
        email,
        target_type: "TEAM",
        target_id: teamId,
        invited_by: currentUser.id,
        role: role as any,
        status: "PENDING",
        token_hash: crypto.randomUUID(),
      },
    })

    // 4. Envoi de l'e-mail via Resend
    await resend.emails.send({
      from: 'HubGamers <onboarding@resend.dev>',
      to: email,
      subject: `Invitation à rejoindre l'équipe ${teamName} sur HubGamers`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2>Invitation E-sport</h2>
          <p>Bonjour,</p>
          <p>Vous avez été invité à rejoindre l'équipe <strong>${teamName}</strong> en tant que <strong>${role}</strong>.</p>
          <p>Rendez-vous dans votre espace <strong>Mes Invitations</strong> sur HubGamers pour accepter ou refuser.</p>
        </div>
      `,
    })

    revalidatePath(`/dashboard/structures/${structureId}/teams/${teamId}`)
    return { success: true, message: "Invitation envoyée avec succès !" }
  } catch (error: any) {
    console.error("Erreur addMemberToTeam:", error)
    return { success: false, message: error?.message || "Erreur lors de l'envoi de l'invitation." }
  }
}

// Fonction utilitaire interne pour vérifier si l'utilisateur a les droits de gestion sur l'équipe
async function canManageTeam(userId: string, teamId: string, structureId: string) {
  // 1. Vérifier si l'utilisateur est ADMIN ou OWNER de la structure
  const structUser = await prisma.structure_members.findUnique({
    where: {
      structure_id_user_id: {
        structure_id: structureId,
        user_id: userId,
      },
    },
    select: { role: true },
  })

  if (structUser && (structUser.role === 'ADMIN' || structUser.role === 'OWNER')) {
    return true
  }

  // 2. Vérifier si l'utilisateur est CAPTAIN ou MANAGER de l'équipe
  const teamUser = await prisma.team_members.findUnique({
    where: {
      team_id_user_id: {
        team_id: teamId,
        user_id: userId,
      },
    },
    select: { role: true },
  })

  if (teamUser && (teamUser.role === 'CAPTAIN' || teamUser.role === 'MANAGER')) {
    return true
  }

  return false
}

// Suppression d'un membre avec vérification des droits
export async function removeMemberFromTeam(teamId: string, structureId: string, userIdToRemove: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Non authentifié." }

  const authorized = await canManageTeam(user.id, teamId, structureId)
  if (!authorized) {
    return { success: false, message: "Action non autorisée. Vous devez être administrateur de la structure ou gestionnaire de l'équipe." }
  }

  try {
    await prisma.team_members.delete({
      where: {
        team_id_user_id: {
          team_id: teamId,
          user_id: userIdToRemove,
        },
      },
    })

    revalidatePath(`/dashboard/structures/${structureId}/teams/${teamId}`)
    return { success: true, message: "Membre retiré de l'équipe avec succès." }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

// Modification du rôle d'un membre avec vérification des droits
export async function updateTeamMemberRole(teamId: string, structureId: string, userIdToUpdate: string, formData: FormData) {
  const supabase = await createClient()
  const newRole = formData.get("role") as any

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Non authentifié." }

  const authorized = await canManageTeam(user.id, teamId, structureId)
  if (!authorized) {
    return { success: false, message: "Action non autorisée." }
  }

  try {
    await prisma.team_members.update({
      where: {
        team_id_user_id: {
          team_id: teamId,
          user_id: userIdToUpdate,
        },
      },
      data: { role: newRole },
    })

    revalidatePath(`/dashboard/structures/${structureId}/teams/${teamId}`)
    return { success: true, message: "Rôle mis à jour avec succès." }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export interface SearchedTeam {
  id: string
  name: string
  game?: string
  structureName?: string
}

export async function searchTeamsForTournament(
  query: string,
  excludeTeamIds: string[] = []
): Promise<SearchedTeam[]> {
  if (!query || query.trim().length < 2) {
    return []
  }

  const cleanQuery = query.trim()

  try {
    // 1. Rechercher les équipes par nom et récupérer leur structure associée
    const teamsByName = await prisma.teams.findMany({
      where: {
        name: {
          contains: cleanQuery,
          mode: 'insensitive',
        },
        id: {
          notIn: excludeTeamIds.length > 0 ? excludeTeamIds : undefined,
        },
      },
      include: {
        structure_teams: {
          include: {
            structures: {
              select: { name: true },
            },
          },
        },
      },
      take: 10,
    })

    // 2. Rechercher par nom de structure
    const structuresByName = await prisma.structures.findMany({
      where: {
        name: {
          contains: cleanQuery,
          mode: 'insensitive',
        },
      },
      include: {
        structure_teams: {
          include: {
            teams: true,
          },
        },
      },
      take: 10,
    })

    const excludeSet = new Set(excludeTeamIds)
    const resultMap = new Map<string, SearchedTeam>()

    // Ajouter les résultats par équipe
    for (const team of teamsByName) {
      if (!excludeSet.has(team.id)) {
        const structureName = team.structure_teams?.structures?.name || undefined
        resultMap.set(team.id, {
          id: team.id,
          name: team.name,
          game: team.game,
          structureName,
        })
      }
    }

    // Ajouter les résultats par structure
    for (const struct of structuresByName) {
      const structName = struct.name
      const relations = struct.structure_teams || []

      // S'assurer que structure_teams est traité correctement (relation simple ou multiple selon la définition)
      const relList = Array.isArray(relations) ? relations : [relations]

      for (const rel of relList) {
        const team = rel?.teams
        if (team && !excludeSet.has(team.id) && !resultMap.has(team.id)) {
          resultMap.set(team.id, {
            id: team.id,
            name: team.name,
            game: team.game,
            structureName: structName,
          })
        }
      }
    }

    return Array.from(resultMap.values())
  } catch (error) {
    console.error("Erreur searchTeamsForTournament:", error)
    return []
  }
}