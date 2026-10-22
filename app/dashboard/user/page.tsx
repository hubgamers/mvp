import { redirect } from "next/navigation"
import { UserRound, Shield, Calendar, Mail, AtSign, Trophy } from "lucide-react"
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

export default async function UserPage() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  if (!user) {
    redirect("/login")
  }

  const profile = await prisma.profiles.findUnique({
    where: { id: user.id },
    select: {
      username: true,
      display_name: true,
      created_at: true,
    },
  })

  const displayName = profile?.display_name || profile?.username || "Gamer"

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <UserRound className="size-5 text-brand-cyan" />
            <span className="text-xs font-bold uppercase tracking-widest text-brand-cyan">
              PASSEPORT ESPORT DU JOUEUR
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase">
            Mon Profil
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Consultez les informations d'identité certifiées associées à votre compte compétitif.
          </p>
        </div>

        <Badge variant="cyber" className="self-start sm:self-auto text-xs px-3 py-1">
          COMPTE VÉRIFIÉ ✓
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3 max-w-4xl">
        {/* Profile Card / Gamer ID */}
        <Card className="md:col-span-1 border-white/[0.08] bg-card/85 text-center flex flex-col items-center justify-center p-6 space-y-4">
          <div className="size-20 rounded-2xl bg-gradient-to-br from-brand-cyan to-blue-600 flex items-center justify-center text-slate-950 font-black text-2xl shadow-[0_0_25px_rgba(0,242,254,0.35)] border-2 border-white/20">
            {displayName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-black text-white">{displayName}</h2>
            <p className="text-xs text-brand-cyan font-mono">@{profile?.username || "user"}</p>
          </div>
          <div className="pt-2 w-full border-t border-white/[0.08] flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="size-3.5 text-emerald-400" />
            <span>Membre officiel HubGamers</span>
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
                  <UserRound className="size-3.5 text-brand-cyan" />
                  Pseudo en jeu (Display)
                </span>
                <span className="font-bold text-white text-sm">
                  {profile?.display_name || profile?.username || "Non renseigné"}
                </span>
              </div>

              <div className="rounded-xl bg-black/40 p-3.5 border border-white/[0.06]">
                <span className="text-muted-foreground flex items-center gap-1.5 mb-1">
                  <AtSign className="size-3.5 text-purple-400" />
                  Identifiant unique (Handle)
                </span>
                <span className="font-mono font-bold text-white text-sm">
                  {profile?.username || "Non renseigné"}
                </span>
              </div>

              <div className="rounded-xl bg-black/40 p-3.5 border border-white/[0.06]">
                <span className="text-muted-foreground flex items-center gap-1.5 mb-1">
                  <Mail className="size-3.5 text-emerald-400" />
                  Email certifié
                </span>
                <span className="font-medium text-white text-xs break-all">
                  {user.email || "Non renseignée"}
                </span>
              </div>

              <div className="rounded-xl bg-black/40 p-3.5 border border-white/[0.06]">
                <span className="text-muted-foreground flex items-center gap-1.5 mb-1">
                  <Calendar className="size-3.5 text-amber-400" />
                  Date d'enregistrement
                </span>
                <span className="font-medium text-white text-xs">
                  {profile?.created_at
                    ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(profile.created_at)
                    : "Récemment"}
                </span>
              </div>
            </div>

            <div className="rounded-lg bg-white/[0.02] p-3 border border-white/[0.05] text-xs text-muted-foreground flex items-center gap-2">
              <Trophy className="size-4 text-amber-400 shrink-0" />
              <span>
                Vos statistiques de victoires et trophées de tournois seront synchronisés prochainement sur votre carte de joueur.
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
