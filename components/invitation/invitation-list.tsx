'use client'

import { respondToInvitation } from "@/app/actions/invitation.actions"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Users, Trophy, Check, X, MailOpen } from "lucide-react"

interface InvitationItem {
  id: string
  type: 'STRUCTURE' | 'TEAM' | 'TOURNAMENT'
  role: string | null
  targetName: string
  teamName?: string
}

interface InvitationsListProps {
  invitations: InvitationItem[]
}

export function InvitationsList({ invitations }: InvitationsListProps) {
  if (invitations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/20 p-12 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-3">
          <MailOpen className="size-7" />
        </div>
        <h3 className="text-base font-bold text-white uppercase tracking-tight">
          Aucune invitation en attente
        </h3>
        <p className="mt-1 text-xs text-muted-foreground max-w-sm">
          Lorsque des clubs ou organisateurs vous inviteront à rejoindre une structure ou un tournoi, ils s'afficheront ici.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      {invitations.map((item) => {
        const acceptAction = async () => {
          await respondToInvitation(item.id, "ACCEPTED")
        }
        const refuseAction = async () => {
          await respondToInvitation(item.id, "DECLINED")
        }

        const iconConfig =
          item.type === "TOURNAMENT"
            ? {
                icon: Trophy,
                color: "text-brand-cyan",
                bg: "bg-brand-cyan/10 border-brand-cyan/20",
                badgeVariant: "cyber" as const,
                label: "TOURNOI",
              }
            : item.type === "TEAM"
              ? {
                  icon: Users,
                  color: "text-purple-400",
                  bg: "bg-purple-500/10 border-purple-500/20",
                  badgeVariant: "violet" as const,
                  label: "ÉQUIPE",
                }
              : {
                  icon: Shield,
                  color: "text-emerald-400",
                  bg: "bg-emerald-500/10 border-emerald-500/20",
                  badgeVariant: "success" as const,
                  label: "STRUCTURE",
                }

        const IconComponent = iconConfig.icon

        return (
          <Card
            key={item.id}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4 border-white/[0.08] bg-card/80 backdrop-blur-md transition-all hover:border-white/20"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl border ${iconConfig.bg} ${iconConfig.color} shrink-0`}>
                <IconComponent className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-white">{item.targetName}</h3>
                  <Badge variant={iconConfig.badgeVariant} className="text-[10px]">
                    {iconConfig.label}
                  </Badge>
                </div>
                {item.type === "TOURNAMENT" && item.teamName ? (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Invitation pour votre équipe <strong className="text-white font-bold">{item.teamName}</strong>
                  </p>
                ) : item.type === "TOURNAMENT" && (item.role === "ADMIN" || item.role === "ARBITRE") ? (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Rôle proposé :{" "}
                    <strong className="text-brand-cyan font-bold">
                      {item.role === "ADMIN" ? "Administrateur" : "Arbitre Officiel"}
                    </strong>
                  </p>
                ) : item.role ? (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Rôle proposé : <strong className="text-white font-bold">{item.role}</strong>
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <form action={acceptAction} className="flex-1 sm:flex-initial">
                <Button
                  type="submit"
                  size="sm"
                  className="w-full text-xs font-bold uppercase tracking-wider bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                >
                  <Check className="h-4 w-4 mr-1" /> Accepter
                </Button>
              </form>
              <form action={refuseAction} className="flex-1 sm:flex-initial">
                <Button
                  type="submit"
                  size="sm"
                  variant="outline"
                  className="w-full text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-300 hover:border-red-500/40"
                >
                  <X className="h-4 w-4 mr-1" /> Décliner
                </Button>
              </form>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
