import Link from "next/link"
import { redirect } from "next/navigation"
import { CalendarDays, MessageSquare, Swords, Gamepad2, ArrowRight } from "lucide-react"
import { getMyMatchChats } from "@/app/actions/match.actions"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" | "live" | "cyber" | "warning" }> = {
  PENDING: { label: "À venir", variant: "outline" },
  READY: { label: "Prêt", variant: "warning" },
  LIVE: { label: "En direct", variant: "live" },
  AWAITING_RESULT_CONFIRMATION: { label: "À confirmer", variant: "warning" },
  COMPLETED: { label: "Terminé", variant: "outline" },
  DISPUTED: { label: "Contesté", variant: "destructive" },
  CANCELLED: { label: "Annulé", variant: "destructive" },
  BYE: { label: "Exempt", variant: "secondary" },
}

export default async function ChatsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login?authRequired=1")

  const result = await getMyMatchChats()
  const chats = result.success ? result.chats : []

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="size-5 text-brand-cyan" />
            <span className="text-xs font-bold uppercase tracking-widest text-brand-cyan">
              CHANNELS OFFICIELS DE MATCH
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase">
            Discussions des Matchs
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Échangez avec les capitaines adverses et les arbitres assignés à vos rencontres.
          </p>
        </div>
      </div>

      {!result.success ? (
        <Card className="border-destructive/30 bg-destructive/10">
          <CardContent className="py-8 text-center text-sm text-destructive font-semibold">
            {result.message}
          </CardContent>
        </Card>
      ) : chats.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/20 p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-4">
            <MessageSquare className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-white uppercase tracking-tight">
            Aucun canal de match actif
          </h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm">
            Les salons de discussion privés s'ouvriront automatiquement dès qu'un match sera planifié ou assigné.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {chats.map((chat) => {
            const statusInfo = statusLabels[chat.status] ?? { label: chat.status, variant: "outline" as const }

            return (
              <Link key={chat.id} href={`/dashboard/matches/${chat.id}`} className="block group">
                <Card className="border-white/[0.08] bg-card/75 backdrop-blur-md transition-all duration-300 hover:border-brand-cyan/40 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
                  <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-black text-white uppercase tracking-tight group-hover:text-brand-cyan transition-colors">
                          {chat.tournamentName}
                        </span>
                        <Badge variant="outline" className="text-[10px] bg-white/[0.04]">
                          {chat.role === "ARBITRE" ? "Arbitre" : chat.role === "ADMIN" ? "Admin tournoi" : "Participant"}
                        </Badge>
                        <Badge variant={statusInfo.variant} className="text-[10px]">
                          {statusInfo.label}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                          <Gamepad2 className="size-3.5 text-brand-cyan" />
                          {chat.game}
                        </span>
                        <span>·</span>
                        <span>{chat.stageName}</span>
                        <span>·</span>
                        <span>{chat.roundNumber ? `Tour ${chat.roundNumber}` : `Match #${chat.matchOrder}`}</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-semibold text-white">
                        <Swords className="h-3.5 w-3.5 text-brand-cyan shrink-0" />
                        <span className="truncate">
                          {chat.teams.length ? chat.teams.join("  vs  ") : "Équipes à déterminer"}
                        </span>
                      </div>

                      {chat.latestMessage ? (
                        <div className="rounded-lg bg-black/40 px-3 py-1.5 text-xs border border-white/[0.04] text-slate-300 flex items-center gap-2 truncate max-w-2xl">
                          <span className="font-bold text-white shrink-0">{chat.latestMessage.senderName} :</span>
                          <span className="truncate text-slate-400">{chat.latestMessage.content}</span>
                        </div>
                      ) : (
                        <p className="text-[11px] text-muted-foreground italic">Aucun message pour le moment.</p>
                      )}
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0 gap-2 text-xs text-muted-foreground border-t sm:border-t-0 pt-2 sm:pt-0 border-white/[0.06]">
                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
                        <CalendarDays className="size-3.5 text-brand-cyan" />
                        <span>
                          {chat.latestMessage
                            ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(
                                new Date(chat.latestMessage.createdAt),
                              )
                            : chat.scheduledAt
                              ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(
                                  new Date(chat.scheduledAt),
                                )
                              : "Date TBD"}
                        </span>
                      </div>
                      <span className="text-brand-cyan font-bold text-xs inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Accéder au salon <ArrowRight className="size-3" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
