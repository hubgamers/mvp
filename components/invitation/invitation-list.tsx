// components/invitations/invitations-list.tsx
'use client'

import { respondToInvitation } from "@/app/actions/invitation.actions"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Users, Check, X } from "lucide-react"

interface InvitationItem {
  id: string
  type: 'STRUCTURE' | 'TEAM'
  role: string
  targetName: string
}

interface InvitationsListProps {
  invitations: InvitationItem[]
}

export function InvitationsList({ invitations }: InvitationsListProps) {
  if (invitations.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed rounded-lg text-muted-foreground">
        Vous n'avez aucune invitation en attente pour le moment.
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {invitations.map((item) => {
        const acceptAction = respondToInvitation.bind(null, item.id, 'ACCEPTED')
        const refuseAction = respondToInvitation.bind(null, item.id, 'REFUSED')

        return (
          <Card key={item.id} className="flex flex-col sm:flex-row items-center justify-between p-4 gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full text-primary">
                {item.type === 'TEAM' ? <Users className="h-6 w-6" /> : <Shield className="h-6 w-6" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg">{item.targetName}</h3>
                  <Badge variant="outline">{item.type}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Rôle proposé : <span className="font-semibold text-foreground">{item.role}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <form action={acceptAction} className="flex-1 sm:flex-initial">
                <Button type="submit" size="sm" className="w-full gap-1 bg-green-600 hover:bg-green-700">
                  <Check className="h-4 w-4" /> Accepter
                </Button>
              </form>
              <form action={refuseAction} className="flex-1 sm:flex-initial">
                <Button type="submit" size="sm" variant="outline" className="w-full gap-1 text-red-500 hover:text-red-600">
                  <X className="h-4 w-4" /> Refuser
                </Button>
              </form>
            </div>
          </Card>
        )
      })}
    </div>
  )
}