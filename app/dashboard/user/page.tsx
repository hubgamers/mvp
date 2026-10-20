import { redirect } from "next/navigation"
import { UserRound } from "lucide-react"

import { createClient } from "@/utils/supabase/server"
import { prisma } from "@/lib/prisma"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

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

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mon profil</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Consultez les informations associées à votre compte HubGamers.
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <UserRound className="size-5" />
          </div>
          <CardTitle>Informations du compte</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <dt className="text-sm text-muted-foreground">Nom affiché</dt>
              <dd className="font-medium">
                {profile?.display_name || profile?.username || "Non renseigné"}
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="text-sm text-muted-foreground">Identifiant</dt>
              <dd className="font-medium">{profile?.username || "Non renseigné"}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-sm text-muted-foreground">Adresse e-mail</dt>
              <dd className="break-all font-medium">{user.email || "Non renseignée"}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-sm text-muted-foreground">Membre depuis</dt>
              <dd className="font-medium">
                {profile?.created_at
                  ? new Intl.DateTimeFormat("fr-FR", {
                      dateStyle: "long",
                    }).format(profile.created_at)
                  : "Non renseigné"}
              </dd>
            </div>
          </dl>
          <p className="mt-6 border-t pt-4 text-sm text-muted-foreground">
            La modification des informations du profil n’est pas encore
            disponible.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
