// app/actions/invitation.actions.ts
'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

// 1. Récupérer les invitations pour l'utilisateur connecté
export async function getMyInvitations() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !user.email) return []

  const { data: invitations } = await supabase
    .from("invitations")
    .select("*")
    .eq("email", user.email)
    .eq("status", "PENDING")

  if (!invitations) return []

  // Résolution dynamique des noms (Structure ou Équipe)
  const enrichedInvitations = await Promise.all(
    invitations.map(async (inv) => {
      let targetName = "Inconnu"
      if (inv.type === 'TEAM') {
        const { data } = await supabase.from("teams").select("name").eq("id", inv.target_id).single()
        if (data) targetName = data.name
      } else if (inv.type === 'STRUCTURE') {
        const { data } = await supabase.from("structures").select("name").eq("id", inv.target_id).single()
        if (data) targetName = data.name
      }
      return {
        id: inv.id,
        type: inv.type,
        role: inv.role,
        targetName,
      }
    })
  )

  return enrichedInvitations
}

// 2. Répondre à une invitation (Accepter / Refuser)
export async function respondToInvitation(invitationId: string, action: 'ACCEPTED' | 'REFUSED') {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !user.email) return { success: false, message: "Non authentifié." }

  // 1. Récupérer l'invitation ET VERIFIER QU'ELLE EST STRICTEMENT 'PENDING'
  const { data: invite, error: fetchError } = await supabase
    .from("invitations")
    .select("*")
    .eq("id", invitationId)
    .eq("email", user.email)
    .eq("status", "PENDING") // <-- SÉCURITÉ : Empêche la réutilisation d'une invitation déjà traitée
    .single()

  if (fetchError || !invite) {
    return { success: false, message: "Invitation invalide, expirée ou déjà traitée." }
  }

  // 2. Traitement de l'acceptation
  if (action === 'ACCEPTED') {
    if (invite.type === 'TEAM') {
      // Ajout dans le roster de l'équipe
      const { error: teamJoinError } = await supabase
        .from("teams_users")
        .insert({ team_id: invite.target_id, user_id: user.id, role: invite.role })

      if (teamJoinError && teamJoinError.code !== '23505') {
        return { success: false, message: teamJoinError.message }
      }

      // Rattachement automatique à la structure si nécessaire
      const { data: structTeam } = await supabase
        .from("structures_teams")
        .select("structure_id")
        .eq("team_id", invite.target_id)
        .single()

      if (structTeam) {
        await supabase
          .from("structures_users")
          .insert({ structure_id: structTeam.structure_id, user_id: user.id, role: 'USER' })
          .select()
      }
    } else if (invite.type === 'STRUCTURE') {
      const { error: structJoinError } = await supabase
        .from("structures_users")
        .insert({ structure_id: invite.target_id, user_id: user.id, role: invite.role })

      if (structJoinError && structJoinError.code !== '23505') {
        return { success: false, message: structJoinError.message }
      }
    }
  }

  // 3. Passation de l'invitation à 'ACCEPTED' ou 'REFUSED'
  // Une fois le statut changé, elle ne sera PLUS JAMAIS sélectionnable par `eq("status", "PENDING")`
  const { error: updateError } = await supabase
    .from("invitations")
    .update({ status: action })
    .eq("id", invitationId)

  if (updateError) {
    return { success: false, message: updateError.message }
  }

  revalidatePath("/dashboard/invitations")
  return { success: true, message: action === 'ACCEPTED' ? "Invitation acceptée !" : "Invitation refusée." }
}