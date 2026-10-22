import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function acceptInvitation(code: string) {
    const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, message: "Non authentifié." };
        
        try {
            await prisma.invitations.update({
                where: {
                    code
                },
                data: {
                    status: 'ACCEPTED'
                }
            });
    
            return { success: true, message: "Invitation acceptée avec succès." };
        } catch (error) {
            console.error("Erreur saveTournamentRegistration:", error);
            return { success: false, message: "Impossible d'accepter l'invitation." };
        }
}