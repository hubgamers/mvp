import Link from "next/link"
import { redirect } from "next/navigation"
import { CalendarDays, MessageSquare, Swords } from "lucide-react"
import { getMyMatchChats } from "@/app/actions/match.actions"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/server"

const statusLabels: Record<string, string> = {
  PENDING: "À venir",
  READY: "Prêt",
  LIVE: "En direct",
  AWAITING_RESULT_CONFIRMATION: "Résultat à confirmer",
  COMPLETED: "Terminé",
  DISPUTED: "Contesté",
  CANCELLED: "Annulé",
  BYE: "Exempt",
}

export default async function ChatsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login?authRequired=1")

  const result = await getMyMatchChats()
  const chats = result.success ? result.chats : []

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Chats</h1>
        <p className="text-sm text-muted-foreground">
          Retrouvez les discussions de vos matchs et des tournois que vous organisez.
        </p>
      </div>
      <Separator />

      {!result.success ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-destructive">
            {result.message}
          </CardContent>
        </Card>
      ) : chats.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="font-medium">Aucun chat de match pour le moment.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Les matchs de vos équipes et les chats de vos tournois apparaîtront ici.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {chats.map((chat) => (
            <Link key={chat.id} href={`/dashboard/matches/${chat.id}`} className="block">
              <Card className="transition-colors hover:border-primary/50 hover:bg-muted/20">
                <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold">{chat.tournamentName}</h2>
                      <Badge variant="outline">
                        {chat.role === "ARBITRE" ? "Arbitre" : chat.role === "ADMIN" ? "Admin tournoi" : "Mon match"}
                      </Badge>
                      <Badge variant="secondary">{statusLabels[chat.status] ?? chat.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {chat.game} · {chat.stageName}
                      {chat.roundNumber ? ` · Tour ${chat.roundNumber}` : ` · Match ${chat.matchOrder}`}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <Swords className="h-4 w-4 text-muted-foreground" />
                      <span>{chat.teams.length ? chat.teams.join(" vs ") : "Équipes à déterminer"}</span>
                    </div>
                    {chat.latestMessage ? (
                      <p className="truncate text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{chat.latestMessage.senderName} :</span>{" "}
                        {chat.latestMessage.content}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Aucun message pour le moment.</p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    {chat.latestMessage
                      ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(
                          new Date(chat.latestMessage.createdAt),
                        )
                      : chat.scheduledAt
                        ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(
                            new Date(chat.scheduledAt),
                          )
                        : "Date à définir"}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
