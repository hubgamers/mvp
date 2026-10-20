// app/actions/team.actions.ts
'use server'

import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { Resend } from "resend"
import { ensurePublicProfile } from "@/lib/profiles"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function createTeamForStructure(structureId: string, prevState: any, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Non authentifié." }

  const structureMembership = await prisma.structure_members.findUnique({
    where: { structure_id_user_id: { structure_id: structureId, user_id: user.id } },
    select: { role: true },
  })
  if (!structureMembership || !["OWNER", "ADMIN"].includes(structureMembership.role)) {
    return { success: false, message: "Seuls les administrateurs peuvent ajouter une équipe à cette structure." }
  }
  try {
    await ensurePublicProfile(user)
  } catch (error) {
    console.error("Erreur de synchronisation du profil utilisateur:", error)
    return { success: false, message: "Erreur de synchronisation du profil utilisateur." }
  }

  const name = formData.get("name") as string
  const game = formData.get("game") as string
  const platform = (formData.get("platform") as string) || "PC"
  const description = String(formData.get("description") || "").trim()
  const isPublic = formData.get("is_public") === "true"

  if (!name || !game) {
    return { success: false, message: "Le nom de l'équipe et le jeu sont obligatoires." }
  }
  if (!["PC", "PLAYSTATION", "XBOX", "SWITCH", "MOBILE", "CROSS_PLATFORM", "OTHER"].includes(platform)) {
    return { success: false, message: "Plateforme invalide." }
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
          platform: platform as TeamDetail["platform"],
          created_by: user.id,
          description: description || null,
          is_public: isPublic,
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
  created_by?: string
  description?: string | null
  logo_url?: string | null
  memberCount?: number
  tournaments?: Array<{ id: string; name: string; status: string; starts_at: Date | null }>
  structure?: {
    id: string
    name: string
  }
  members?: Array<{
    id: string
    username: string | null
    avatar_url: string | null
    role: string
  }>
  isAdmin?: boolean
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
            _count: { select: { team_members: true } },
          },
        },
        structures: { select: { id: true, name: true } },
      },
    })

    if (!data || data.length === 0) return []

    return data
      .map((item) => item.teams ? {
        ...item.teams,
        structure: item.structures,
        memberCount: item.teams._count.team_members,
      } : null)
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
        structure_teams: {
          include: { structures: { select: { id: true, name: true } } },
        },
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
        tournament_registrations: {
          include: {
            tournaments: {
              select: { id: true, name: true, status: true, starts_at: true },
            },
          },
        },
      },
    })

    if (!team || team.deleted_at) return null
    if (structureId && team.structure_teams?.structure_id !== structureId) return null
    const { data: { user } } = await (await createClient()).auth.getUser()
    if (
      !team.is_public &&
      team.created_by !== user?.id &&
      !team.team_members.some((member) => member.user_id === user?.id)
    ) {
      return null
    }

    const formattedMembers = team.team_members.map((m) => ({
      ...m.profiles,
      role: m.role,
    })).filter((m) => m.id)
    const isAdmin = user
      ? await canManageTeam(user.id, teamId, structureId ?? team.structure_teams?.structure_id)
      : false

    return {
      ...team,
      created_at: team.created_at,
      structure: team.structure_teams ? {
        id: team.structure_teams.structures.id,
        name: team.structure_teams.structures.name,
      } : undefined,
      members: formattedMembers,
      tournaments: team.tournament_registrations.map((registration) => registration.tournaments),
      isAdmin,
    }
  } catch (error) {
    console.error("Erreur getTeamById:", error)
    return null
  }
}

export async function addMemberToTeam(teamId: string, structureId: string, prevState: any, formData: FormData) {
  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser) return { success: false, message: "Non authentifié." }
  if (!(await canManageTeam(currentUser.id, teamId, structureId))) {
    return { success: false, message: "Action non autorisée. Vous devez gérer cette équipe." }
  }

  const email = (formData.get("email") as string)?.trim().toLowerCase()
  const role = (formData.get("role") as string) || "PLAYER"

  if (!email) {
    return { success: false, message: "L'email du membre est obligatoire." }
  }
  if (!["PLAYER", "CAPTAIN", "MANAGER"].includes(role)) {
    return { success: false, message: "Rôle d'équipe invalide." }
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

    if (structureId) revalidatePath(`/dashboard/structures/${structureId}/teams/${teamId}`)
    revalidatePath(`/dashboard/teams/${teamId}`)
    revalidatePath("/dashboard/teams")
    return { success: true, message: "Invitation envoyée avec succès !" }
  } catch (error: any) {
    console.error("Erreur addMemberToTeam:", error)
    return { success: false, message: error?.message || "Erreur lors de l'envoi de l'invitation." }
  }
}

// Fonction utilitaire interne pour vérifier si l'utilisateur a les droits de gestion sur l'équipe
async function canManageTeam(userId: string, teamId: string, structureId?: string) {
  const team = await prisma.teams.findUnique({
    where: { id: teamId },
    select: { created_by: true, structure_teams: { select: { structure_id: true } } },
  })
  if (!team || (structureId && team.structure_teams?.structure_id !== structureId)) {
    return false
  }
  if (team.created_by === userId) return true

  // 1. Vérifier si l'utilisateur est ADMIN ou OWNER de la structure
  const structUser = structureId ? await prisma.structure_members.findUnique({
    where: {
      structure_id_user_id: {
        structure_id: structureId,
        user_id: userId,
      },
    },
    select: { role: true },
  }) : null

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

    if (structureId) revalidatePath(`/dashboard/structures/${structureId}/teams/${teamId}`)
    revalidatePath(`/dashboard/teams/${teamId}`)
    revalidatePath("/dashboard/teams")
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

  if (!["PLAYER", "CAPTAIN", "MANAGER"].includes(String(newRole))) {
    return { success: false, message: "Rôle d'équipe invalide." }
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

    if (structureId) revalidatePath(`/dashboard/structures/${structureId}/teams/${teamId}`)
    revalidatePath(`/dashboard/teams/${teamId}`)
    revalidatePath("/dashboard/teams")
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
        is_public: true,
        deleted_at: null,
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
        deleted_at: null,
        name: {
          contains: cleanQuery,
          mode: 'insensitive',
        },
      },
      include: {
        structure_teams: {
          include: {
            teams: { where: { is_public: true, deleted_at: null } },
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

export async function getMyTeams(): Promise<TeamDetail[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  try {
    const teams = await prisma.teams.findMany({
      where: {
        deleted_at: null,
        OR: [
          { created_by: user.id },
          { team_members: { some: { user_id: user.id } } },
        ],
      },
      include: {
        structure_teams: {
          include: { structures: { select: { id: true, name: true } } },
        },
        _count: { select: { team_members: true } },
      },
      orderBy: { created_at: "desc" },
    })

    return teams.map((team) => ({
      id: team.id,
      name: team.name,
      game: team.game,
      platform: team.platform,
      created_at: team.created_at,
      created_by: team.created_by,
      description: team.description,
      logo_url: team.logo_url,
      memberCount: team._count.team_members,
      structure: team.structure_teams ? {
        id: team.structure_teams.structures.id,
        name: team.structure_teams.structures.name,
      } : undefined,
    }))
  } catch (error) {
    console.error("Erreur getMyTeams:", error)
    return []
  }
}