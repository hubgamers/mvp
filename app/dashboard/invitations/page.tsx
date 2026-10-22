import { getMyInvitations } from "@/app/actions/invitation.actions"
import { InvitationsList } from "@/components/invitation/invitation-list"
import { Mail, CheckCircle2 } from "lucide-react"

export default async function InvitationsPage() {
  const invitations = await getMyInvitations()

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8 max-w-4xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Mail className="size-5 text-brand-cyan" />
            <span className="text-xs font-bold uppercase tracking-widest text-brand-cyan">
              CENTRE DE RECRUTEMENT
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase">
            Invitations Reçues
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gérez vos invitations d'équipe, de structure et vos nominations au staff arbitral.
          </p>
        </div>
      </div>

      <InvitationsList invitations={invitations} />
    </div>
  )
}
