// app/actions/tournament.actions.ts
'use server'

import { createClient } from "@/lib/supabase/server" // Adapte selon ton chemin d'instanciation Supabase
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getCurrentUserWithProfile } from "./auth.actions"

export interface Tournament {
  id: string
  name: string
  game: string
  platform: 'PC' | 'PLAYSTATION' | 'XBOX'
  status: 'DRAFT' | 'ONGOING' | 'COMPLETED'
  created_at: string
}

export async function getTournaments(): Promise<Tournament[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("tournaments")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Erreur lors de la récupération des tournois :", error.message)
    return []
  }

  return data as Tournament[]
}

export async function getMyTournaments(): Promise<Tournament[]> {
  const supabase = await createClient()
  const user = await getCurrentUserWithProfile();

  const { data, error } = await supabase
    .from("tournaments")
    .select("*")
    .eq("created_by", user.user?.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Erreur lors de la récupération des tournois :", error.message)
    return []
  }

  return data as Tournament[]
}

export async function createTournament(prevState: any, formData: FormData) {
  const supabase = await createClient()
  const user = await getCurrentUserWithProfile();

  const name = formData.get("name") as string
  const game = formData.get("game") as string
  const platform = formData.get("platform") as string
  const created_by = user.user?.id;

  if (!name || !game) {
    return { success: false, message: "Le nom et le jeu sont obligatoires." }
  }

  const { error } = await supabase.from("tournaments").insert({
    name,
    game,
    platform: platform || "PC",
    created_by,
    status: "DRAFT",
  })

  if (error) {
    return { success: false, message: error.message }
  }

  revalidatePath("/dashboard/tournaments")
  redirect("/dashboard/tournaments")
}