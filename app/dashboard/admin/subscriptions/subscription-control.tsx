"use client"

import { updateAdminStripeSubscription } from "@/app/actions/admin.actions"
import { Button } from "@/components/ui/button"

export function SubscriptionControl({
  subscriptionId,
  cancelAtPeriodEnd,
}: {
  subscriptionId: string
  cancelAtPeriodEnd: boolean
}) {
  return (
    <form
      action={updateAdminStripeSubscription}
      onSubmit={(event) => {
        if (
          !cancelAtPeriodEnd &&
          !window.confirm("Programmer la résiliation de cet abonnement à la fin de la période en cours ?")
        ) {
          event.preventDefault()
        }
      }}
    >
      <input type="hidden" name="subscription_id" value={subscriptionId} />
      <input type="hidden" name="action" value={cancelAtPeriodEnd ? "resume" : "schedule_cancel"} />
      <Button type="submit" size="sm" variant={cancelAtPeriodEnd ? "secondary" : "outline"} className="h-7 text-[11px]">
        {cancelAtPeriodEnd ? "Annuler la résiliation" : "Résilier à l’échéance"}
      </Button>
    </form>
  )
}
