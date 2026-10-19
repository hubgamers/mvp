// app/dashboard/invitations/page.tsx
import { getMyInvitations } from "@/app/actions/invitation.actions"
import { InvitationsList } from "@/components/invitation/invitation-list"
import { Separator } from "@/components/ui/separator"

export default async function InvitationsPage() {
  const invitations = await getMyInvitations()

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 max-w-4xl mx-auto w-full">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mes Invitations</h1>
        <p className="text-sm text-muted-foreground">
          Gérez vos demandes de participation aux structures et équipes e-sport.
        </p>
      </div>

      <Separator />

      <InvitationsList invitations={invitations} />
    </div>
  )
}