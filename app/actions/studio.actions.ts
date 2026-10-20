'use server'

import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function getMyStudioProjects() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  try {
    return await prisma.studio_projects.findMany({
      where: {
        OR: [
          { created_by: user.id },
          { tournaments: { created_by: user.id } },
        ],
      },
      include: {
        tournaments: { select: { id: true, name: true, game: true, starts_at: true } },
        studio_scenes: { select: { id: true, name: true, is_enabled: true } },
      },
      orderBy: { updated_at: "desc" },
    })
  } catch (error) {
    console.error("Erreur getMyStudioProjects:", error)
    return []
  }
}

export async function getPublicStudioProjects() {
  try {
    return await prisma.studio_projects.findMany({
      where: { studio_public_tokens: { some: { is_active: true } } },
      select: {
        id: true,
        name: true,
        tournaments: { select: { name: true, game: true } },
        studio_scenes: {
          where: { is_enabled: true },
          select: { id: true, name: true, scene_type: true },
        },
      },
      orderBy: { updated_at: "desc" },
    })
  } catch (error) {
    console.error("Erreur getPublicStudioProjects:", error)
    return []
  }
}

export async function getStudioProjectByTournamentId(tournamentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  try {
    return await prisma.studio_projects.findFirst({
      where: {
        tournament_id: tournamentId,
        OR: [
          { created_by: user.id },
          { tournaments: { created_by: user.id } },
        ],
      },
      include: {
        tournaments: { select: { id: true, name: true, game: true } },
        studio_scenes: { orderBy: { created_at: "asc" } },
      },
    })
  } catch (error) {
    console.error("Erreur getStudioProjectByTournamentId:", error)
    return null
  }
}

export async function getStudioProjectById(projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  try {
    return await prisma.studio_projects.findFirst({
      where: {
        id: projectId,
        OR: [
          { created_by: user.id },
          { tournaments: { created_by: user.id } },
        ],
      },
      include: {
        tournaments: { select: { id: true, name: true, game: true } },
        studio_scenes: { orderBy: { created_at: "asc" } },
      },
    })
  } catch (error) {
    console.error("Erreur getStudioProjectById:", error)
    return null
  }
}

export async function updateStudioProjectTheme(
  projectId: string,
  prevState: { success: boolean; message: string } | null,
  formData: FormData
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Non authentifié." }

  const primary = String(formData.get("primary") || "")
  const secondary = String(formData.get("secondary") || "")
  const background = String(formData.get("background") || "")
  const colors = [primary, secondary, background]
  if (colors.some((color) => !/^#[0-9a-fA-F]{6}$/.test(color))) {
    return { success: false, message: "Utilisez des couleurs hexadécimales au format #RRGGBB." }
  }

  try {
    const project = await prisma.studio_projects.findFirst({
      where: {
        id: projectId,
        OR: [
          { created_by: user.id },
          { tournaments: { created_by: user.id } },
        ],
      },
      select: { id: true },
    })
    if (!project) {
      return { success: false, message: "Projet introuvable ou action non autorisée." }
    }

    await prisma.studio_projects.update({
      where: { id: project.id },
      data: {
        theme: { primary, secondary, background },
      },
    })
    revalidatePath(`/dashboard/studio/${projectId}`)
    return { success: true, message: "Thème du studio enregistré." }
  } catch (error) {
    console.error("Erreur updateStudioProjectTheme:", error)
    return { success: false, message: "Erreur lors de l'enregistrement du thème." }
  }
}

export async function createStudioProject(
  prevState: { success: boolean; message: string } | null,
  formData: FormData
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Non authentifié." }

  const tournamentId = String(formData.get("tournament_id") || "")
  const name = String(formData.get("name") || "").trim()
  if (!tournamentId || !name) {
    return { success: false, message: "Sélectionnez un tournoi et nommez votre projet." }
  }

  let projectId: string
  try {
    const tournament = await prisma.tournaments.findFirst({
      where: { id: tournamentId, created_by: user.id, deleted_at: null },
      select: { id: true },
    })
    if (!tournament) {
      return { success: false, message: "Tournoi introuvable ou action non autorisée." }
    }

    const existingProject = await prisma.studio_projects.findUnique({
      where: { tournament_id: tournamentId },
      select: { id: true },
    })
    if (existingProject) {
      return { success: false, message: "Un projet Studio existe déjà pour ce tournoi." }
    }

    const project = await prisma.studio_projects.create({
      data: {
        tournament_id: tournamentId,
        name,
        created_by: user.id,
        studio_scenes: {
          create: [
            { name: "Match en direct", slug: "match", scene_type: "MATCH", is_default: true },
            { name: "Arbre du tournoi", slug: "bracket", scene_type: "BRACKET" },
            { name: "Classement", slug: "standings", scene_type: "STANDINGS" },
            { name: "Compte à rebours", slug: "countdown", scene_type: "COUNTDOWN" },
          ],
        },
      },
      select: { id: true },
    })
    projectId = project.id
  } catch (error) {
    console.error("Erreur createStudioProject:", error)
    return { success: false, message: "Erreur lors de la création du projet Studio." }
  }

  revalidatePath("/dashboard/studio")
  revalidatePath(`/dashboard/tournaments/${tournamentId}`)
  redirect(`/dashboard/studio/${projectId}`)
}

export async function updateStudioSceneLayout(sceneId: string, layout: unknown) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Non authentifié." }

  if (!layout || typeof layout !== "object" || Array.isArray(layout)) {
    return { success: false, message: "La configuration doit être un objet JSON." }
  }

  try {
    const scene = await prisma.studio_scenes.findFirst({
      where: {
        id: sceneId,
        studio_projects: {
          OR: [
            { created_by: user.id },
            { tournaments: { created_by: user.id } },
          ],
        },
      },
      select: { project_id: true },
    })
    if (!scene) {
      return { success: false, message: "Scène introuvable ou action non autorisée." }
    }

    await prisma.studio_scenes.update({
      where: { id: sceneId },
      data: { layout: layout as Prisma.InputJsonValue },
    })
    revalidatePath(`/dashboard/studio/${scene.project_id}`)
    return { success: true, message: "Mise en page enregistrée." }
  } catch (error) {
    console.error("Erreur updateStudioSceneLayout:", error)
    return { success: false, message: "Erreur lors de l'enregistrement de la scène." }
  }
}
