// app/actions/structure.actions.ts
'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export interface Structure {
  id: string
  name: string
  created_by: string
  created_at: string
  creator?: {
    id: string
    email: string
    avatar_url?: string
  }
  members_count?: number
  teams?: Team[]
}

export interface Team {
  id: string
  name: string
  game: string
  platform: 'PC' | 'PLAYSTATION' | 'XBOX'
  role?: 'MANAGER' | 'CAPTAIN' | 'PLAYER'
  created_at?: string
}

// Récupérer toutes les structures
export async function getStructures(): Promise<Structure[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("structures")
    .select(`
      *,
      creator:users!structures_created_by_fkey (
        id,
        email,
        avatar_url
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Erreur récupération structures:", error.message)
    return []
  }

  return data as Structure[]
}

// Récupérer une structure par son ID
export async function getStructureById(id: string) {
  const supabase = await createClient()

  const { data: structure, error } = await supabase
    .from("structures")
    .select(`
      *,
      creator:users!structures_created_by_fkey (
        id,
        email,
        avatar_url
      )
    `)
    .eq("id", id)
    .single()

  if (error || !structure) return null

  // Récupérer les équipes de cette structure
  const { data: teamsData } = await supabase
    .from("structures_teams")
    .select(`
      role,
      team:teams (*)
    `)
    .eq("structure_id", id)

  return {
    ...structure,
    teams: teamsData?.map((item: any) => ({ ...item.team, role: item.role })) || [],
  }
}

// Créer une structure
export async function createStructure(prevState: any, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, message: "Vous devez être connecté." }
  }

  const name = formData.get("name") as string

  if (!name) {
    return { success: false, message: "Le nom de la structure est obligatoire." }
  }

  const { error } = await supabase.from("structures").insert({
    name,
    created_by: user.id,
  })

  if (error) {
    return { success: false, message: error.message }
  }

  revalidatePath("/dashboard/structures")
  redirect("/dashboard/structures")
}

// Modifier une structure
export async function updateStructure(structureId: string, prevState: any, formData: FormData) {
  const supabase = await createClient()

  const name = formData.get("name") as string

  if (!name) {
    return { success: false, message: "Le nom de la structure est obligatoire." }
  }

  const { error } = await supabase
    .from("structures")
    .update({ name })
    .eq("id", structureId)

  if (error) {
    return { success: false, message: error.message }
  }

  revalidatePath(`/dashboard/structures/${structureId}`)
  revalidatePath("/dashboard/structures")
  redirect(`/dashboard/structures/${structureId}`)
}