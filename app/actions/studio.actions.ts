// app/actions/studio.actions.ts
'use server'

import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Récupérer le projet studio lié à un tournoi
export async function getStudioProjectByTournamentId(tournamentId: string) {
  try {
    const project = await prisma.studio_projects.findUnique({
      where: { tournament_id: tournamentId },
      include: {
        studio_scenes: true,
      },
    })
    return project
  } catch (error) {
    console.error("Erreur getStudioProjectByTournamentId:", error)
    return null
  }
}

// Mettre à jour la configuration d'une scène d'overlay
export async function updateStudioSceneLayout(sceneId: string, layout: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Non authentifié." }

  try {
    await prisma.studio_scenes.update({
      where: { id: sceneId },
      data: { layout },
    })

    return { success: true, message: "Mise en page enregistrée !" }
  } catch (error: any) {
    console.error("Erreur updateStudioSceneLayout:", error)
    return { success: false, message: error?.message || "Erreur de sauvegarde." }
  }
}