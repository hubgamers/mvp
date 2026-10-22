import { redirect } from "next/navigation"
import { UserRound, Shield, Calendar, Mail, AtSign, Trophy, Gamepad2 } from "lucide-react"
import { createClient } from "@/utils/supabase/server"
import { prisma } from "@/lib/prisma"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserGameAccountsClient } from "./user-game-accounts-client"

export const metadata = {
  title: "Mon Profil Joueur · HubGamers",
  description: "Passeport esport du joueur et comptes de jeux officiels.",
}

export default async function UserPage() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/login")
  }

  const userRecord = await prisma.users.findUnique({
    where: { id: user.id },
    include: {
      user_game_accounts: true,
      clubs_members: {
        include: { clubs: true },
      },
      rosters_members: {
        include: { rosters: true },
      },
    },
  })

  const displayName = userRecord?.display_name || user.email?.split("@")[0] || "Gamer"

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8 max-w-5xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <UserRound className="size-5 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
              PASSEPORT ESPORT DU JOUEUR
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase">
            Mon Profil & Comptes de Jeu
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Consultez les informations d'identité certifiées et vos identifiants en jeu (Riot ID, Steam ID, PSN).
          </p>
        </div>

        <Badge variant="outline" className="self-start sm:self-auto text-xs px-3 py-1 bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
          COMPTE VÉRIFIÉ ✓
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card / Gamer ID */}
        <Card className="md:col-span-1 border-white/[0.08] bg-card/85 text-center flex flex-col items-center justify-center p-6 space-y-4">
          <div className="size-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 font-black text-2xl shadow-[0_0_25px_rgba(0,242,254,0.35)] border-2 border-white/20">
            {displayName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-black text-white">{displayName}</h2>
            <p className="text-xs text-cyan-400 font-mono">@{user.email?.split("@")[0] || "gamer"}</p>
          </div>
          <div className="pt-2 w-full border-t border-white/[0.08] flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="size-3.5 text-emerald-400" />
            <span>Membre certifié HubGamers</span>
          </div>
        </Card>

        {/* Account Details */}
        <Card className="md:col-span-2 border-white/[0.08] bg-card/85">
          <CardHeader>
            <CardTitle className="text-base font-bold uppercase tracking-wider">
              Détails du compte & Identité
            </CardTitle>
            <CardDescription>
              Informations utilisées pour vos inscriptions aux tournois et la signature de vos rosters.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 text-xs">
              <div className="rounded-xl bg-black/40 p-3.5 border border-white/[0.06]">
                <span className="text-muted-foreground flex items-center gap-1.5 mb-1">
                  <UserRound className="size-3.5 text-cyan-400" />
                  Pseudo public
                </span>
                <span className="font-bold text-white text-sm">
                  {displayName}
                </span>
              </div>

              <div className="rounded-xl bg-black/40 p-3.5 border border-white/[0.06]">
                <span className="text-muted-foreground flex items-center gap-1.5 mb-1">
                  <Mail className="size-3.5 text-emerald-400" />
                  Email certifié
                </span>
                <span className="font-medium text-white text-xs break-all">
                  {user.email || "Non renseigné"}
                </span>
              </div>

              <div className="rounded-xl bg-black/40 p-3.5 border border-white/[0.06]">
                <span className="text-muted-foreground flex items-center gap-1.5 mb-1">
                  <Calendar className="size-3.5 text-amber-400" />
                  Date d'inscription
                </span>
                <span className="font-medium text-white text-xs">
                  {userRecord?.created_at
                    ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(userRecord.created_at)
                    : "Récemment"}
                </span>
              </div>

              <div className="rounded-xl bg-black/40 p-3.5 border border-white/[0.06]">
                <span className="text-muted-foreground flex items-center gap-1.5 mb-1">
                  <Trophy className="size-3.5 text-purple-400" />
                  Lineups actives
                </span>
                <span className="font-medium text-white text-xs">
                  {userRecord?.rosters_members.length || 0} équipe(s)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comptes de jeux reliés */}
      <Card className="border-white/[0.08] bg-card/85">
        <CardHeader>
          <CardTitle className="text-base font-bold uppercase tracking-wider flex items-center gap-2">
            <Gamepad2 className="size-4 text-cyan-400" />
            Comptes de Jeux & Plateformes Associées
          </CardTitle>
          <CardDescription>
            Indiquez vos identifiants officiels pour chaque jeu (Valorant, LoL, CS2, EA FC). Ces pseudos sont vérifiés lors des matchs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserGameAccountsClient
            accounts={userRecord?.user_game_accounts || []}
          />
        </CardContent>
      </Card>
    </div>
  )
}
