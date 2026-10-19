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

export interface TournamentDetail {
  id: string
  name: string
  game: string
  platform: 'PC' | 'PLAYSTATION' | 'XBOX'
  status: 'DRAFT' | 'ONGOING' | 'COMPLETED'
  created_at: string
  created_by: string
  creator?: {
    id: string
    email: string
    avatar_url?: string
  }
  registrations?: Array<{
    id: string
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CHECKED_IN'
    registered_at: string
    team: {
      id: string
      name: string
      game: string
      platform: 'PC' | 'PLAYSTATION' | 'XBOX'
    }
  }>
}

export async function getTournamentById(id: string): Promise<TournamentDetail | null> {
  const supabase = await createClient()

  // Récupération du tournoi et de son créateur
  const { data: tournament, error: tournamentError } = await supabase
    .from("tournaments")
    .select(`
      *,
      creator:users!tournaments_created_by_fkey (
        id,
        email,
        avatar_url
      )
    `)
    .eq("id", id)
    .single()

  if (tournamentError || !tournament) {
    console.error("Erreur récupération tournoi:", tournamentError?.message)
    return null
  }

  // Récupération des équipes inscrites au tournoi
  const { data: registrations, error: regError } = await supabase
    .from("tournament_registrations")
    .select(`
      id,
      status,
      registered_at,
      team:teams (
        id,
        name,
        game,
        platform
      )
    `)
    .eq("tournament_id", id)

  if (regError) {
    console.error("Erreur récupération inscriptions:", regError.message)
  }

  return {
    ...tournament,
    registrations: registrations || [],
  } as TournamentDetail
}

export async function updateTournament(tournamentId: string, prevState: any, formData: FormData) {
  const supabase = await createClient()

  const name = formData.get("name") as string
  const game = formData.get("game") as string
  const platform = formData.get("platform") as 'PC' | 'PLAYSTATION' | 'XBOX'
  const status = formData.get("status") as 'DRAFT' | 'ONGOING' | 'COMPLETED'

  if (!name || !game) {
    return { success: false, message: "Le nom et le jeu sont obligatoires." }
  }

  const { error } = await supabase
    .from("tournaments")
    .update({
      name,
      game,
      platform,
      status,
    })
    .eq("id", tournamentId)

  if (error) {
    return { success: false, message: error.message }
  }

  revalidatePath(`/dashboard/tournaments/${tournamentId}`)
  revalidatePath("/dashboard/tournaments")
  redirect(`/dashboard/tournaments/${tournamentId}`)
}