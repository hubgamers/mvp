import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { prisma } from "@/lib/prisma"
import { Mail, CheckCircle2, XCircle, Clock, Shield, UsersRound, Building2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InvitationsClient } from "./invitations-client"

export const metadata = {
  title: "Invitations & Recrutement · HubGamers",
  description: "Gérez vos invitations à des clubs, lineups esport et escouades.",
}

export default async function DashboardInvitationsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // 1. Invitations créées par l'utilisateur
  const mySentInvitations = await prisma.invitations.findMany({
    where: {
      inviter_id: user.id,
    },
    include: {
      invitation_target_types: true,
    },
    orderBy: { created_at: "desc" },
  })

  // 2. Invitations actives générales
  const activeInvitations = await prisma.invitations.findMany({
    where: {
      status: "WAIT",
      OR: [
        { expires_at: null },
        { expires_at: { gt: new Date() } },
      ],
    },
    include: {
      invitation_target_types: true,
      users: { select: { display_name: true, email: true } },
    },
    orderBy: { created_at: "desc" },
    take: 10,
  })

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8 max-w-5xl mx-auto w-full">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Mail className="size-4 text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            PORTAIL D'AFFILIATION
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
          Invitations & Recrutements
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Entrez un code reçu pour rejoindre une équipe ou acceptez les invitations directes.
        </p>
      </div>

      <InvitationsClient
        sentInvitations={mySentInvitations}
        activeInvitations={activeInvitations}
      />
    </div>
  )
}
