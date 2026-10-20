// app/actions/tournament.actions.ts
'use server'

import { createClient } from "@/lib/supabase/server" // Adapte selon ton chemin d'instanciation Supabase
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getCurrentUserWithProfile } from "./auth.actions"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

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


/**
 * BOUTON 1 : Inviter une équipe (Status = PENDING)
 * L'équipe reçoit une notification / invitation qu'elle doit accepter.
 */
export async function inviteTeamToTournament(prevState: any, formData: FormData) {
  const supabase = await createClient()

  const tournamentId = formData.get("tournamentId") as string
  const teamId = formData.get("teamId") as string

  if (!tournamentId || !teamId) {
    return { success: false, message: "Informations manquantes pour l'invitation." }
  }

  // 1. Récupérer l'utilisateur connecté (celui qui invite)
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, message: "Vous devez être connecté." }
  }

  // 2. Récupérer l'e-mail de contact de l'équipe ciblée (via ses membres)
  const { data: teamData, error: teamError } = await supabase
    .from("teams")
    .select(`
      id,
      name,
      teams_users (
        user:users (
          email
        )
      )
    `)
    .eq("id", teamId)
    .single()

  if (teamError || !teamData) {
    return { success: false, message: "Équipe introuvable." }
  }

  // Récupérer le premier e-mail disponible de l'équipe
  const teamEmail = (teamData.teams_users as any)?.[0]?.user?.email

  if (!teamEmail) {
    return { success: false, message: "Aucun e-mail de contact trouvé pour cette équipe." }
  }

  // 3. Insérer l'invitation dans la table `invitations` avec type 'TOURNAMENT'
  // Note : target_id stocke l'ID du tournoi (ou de l'équipe, à ajuster selon ton entité cible principale)
  const { error: inviteError } = await supabase
    .from("invitations")
    .insert({
      email: teamEmail,
      type: "TOURNAMENT",
      target_id: tournamentId, // L'ID du tournoi (ou teamId si target_id cible l'équipe)
      invited_by: user.id,
      role: "PLAYER", // Rôle par défaut dans l'équipe pour ce tournoi
      status: "PENDING",
    })

  if (inviteError) {
    console.error("Erreur insertion invitation tournoi:", inviteError.message)
    if (inviteError.code === "23505") {
      return { success: false, message: "Une invitation a déjà été envoyée à cette équipe pour ce tournoi." }
    }
    return { success: false, message: "Erreur lors de la création de l'invitation." }
  }

  // 4. (Optionnel) Créer aussi une ligne PENDING dans les inscriptions du tournoi pour l'affichage visuel
  await supabase
    .from("tournament_registrations")
    .upsert({
      tournament_id: tournamentId,
      team_id: teamId,
      status: "PENDING",
    }, { onConflict: "tournament_id,team_id" })

  revalidatePath(`/dashboard/tournaments/${tournamentId}`)

  return {
    success: true,
    message: "Invitation créée avec succès dans la table des invitations !",
  }
}

/**
 * BOUTON 2 : Ajouter directement une équipe (Status = ACCEPTED)
 * Suppose avoir reçu leur accord au préalable.
 */
export async function addTeamToTournament(prevState: any, formData: FormData) {
  const supabase = await createClient()
  const tournamentId = formData.get("tournamentId") as string
  const teamId = formData.get("teamId") as string

  if (!tournamentId || !teamId) {
    return { success: false, message: "Informations manquantes." }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Non autorisé." }

  // Upsert ou Insert direct en statut ACCEPTED
  const { error } = await supabase
    .from("tournament_registrations")
    .upsert({
      tournament_id: tournamentId,
      team_id: teamId,
      status: "ACCEPTED", // <--- Ajout direct validé
    }, { onConflict: "tournament_id,team_id" })

  if (error) {
    return { success: false, message: "Impossible d'ajouter l'équipe au tournoi." }
  }

  revalidatePath(`/dashboard/tournaments/${tournamentId}`)
  return { success: true, message: "L'équipe a été ajoutée directement au tournoi !" }
}

/**
 * OPTION : Inviter par email via Resend
 */
export async function inviteTeamByEmail(prevState: any, formData: FormData) {
  const supabase = await createClient()
  const tournamentId = formData.get("tournamentId") as string
  const email = formData.get("email") as string

  if (!tournamentId || !email) return { success: false, message: "Email requis." }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Non autorisé." }

  const { data: tournament } = await supabase
    .from("tournaments")
    .select("name, game")
    .eq("id", tournamentId)
    .single()

  try {
    await resend.emails.send({
      from: "HubGamers <onboarding@resend.dev>",
      to: [email],
      subject: `Invitation au tournoi : ${tournament?.name || "HubGamers"}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Invitation au tournoi ${tournament?.name}</h2>
          <p>Vous avez été invité à inscrire votre équipe sur <strong>${tournament?.game}</strong>.</p>
        </div>
      `,
    })

    return { success: true, message: "Invitation envoyée par email avec succès !" }
  } catch {
    return { success: false, message: "Erreur d'envoi d'email." }
  }
}
