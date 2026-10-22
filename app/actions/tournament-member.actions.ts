'use server'

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

interface InviteMemberInput {
    tournamentId: string;
    email: string;
    role_code: string;
}

export async function inviteTournamentMember(data: InviteMemberInput) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Non authentifié." };

    try {
        // 1. Récupérer les infos du tournoi pour l'e-mail
        const tournament = await prisma.tournaments.findUnique({
            where: { id: data.tournamentId },
            select: { name: true }
        });

        // 2. Générer un code d'invitation unique
        const invitationCode = crypto.randomBytes(16).toString("hex");

        // 3. Créer l'invitation en base en associant l'e-mail cible et l'admin émetteur (inviter_id)
        await prisma.invitations.create({
            data: {
                code: invitationCode,
                inviter_id: user.id, // L'admin connecté qui envoie l'invitation
                email: data.email,   // L'e-mail de la personne invitée
                target_type_code: "TOURNAMENT", 
                target_id: data.tournamentId,
                status: "WAIT",
                max_uses: 1,
                uses_count: 0,
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expire dans 7 jours
            }
        });

        // 4. Envoyer l'e-mail via Resend
        const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invitations/${invitationCode}`;

        await resend.emails.send({
            from: 'Tournaments <onboarding@votre-domaine.com>',
            to: data.email,
            subject: `Invitation à rejoindre l'équipe de ${tournament?.name || "un tournoi"}`,
            html: `
                <div style="font-family: sans-serif; color: #333;">
                    <h2>Bonjour !</h2>
                    <p>Vous avez été invité(e) à rejoindre l'équipe d'organisation du tournoi <strong>${tournament?.name || ""}</strong>.</p>
                    <p>Cliquez sur le bouton ci-dessous pour accepter ou refuser cette invitation :</p>
                    <a href="${inviteLink}" style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                        Gérer mon invitation
                    </a>
                    <p style="font-size: 12px; color: #666; margin-top: 20px;">Ce lien est personnel et expirera dans 7 jours.</p>
                </div>
            `
        });

        revalidatePath(`/dashboard/tournaments/${data.tournamentId}`);
        return { success: true, message: "Invitation envoyée avec succès !" };
    } catch (error) {
        console.error("Erreur inviteTournamentMember:", error);
        return { success: false, message: "Impossible d'envoyer l'invitation." };
    }
}