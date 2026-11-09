import { notFound } from "next/navigation"
import { User } from "lucide-react"
import { searchUserFromId } from "@/app/actions/user.actions"
import { MessageButton } from "./message-button"


export default async function UserProfilePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    // Récupération des données du profil visité
    const profileUser = await (await searchUserFromId(id)).user
    if (!profileUser) notFound()


    return (
        <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6 lg:p-8">
            <div className="rounded-xl border border-white/10 bg-black/40 p-6 backdrop-blur-md">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">

                    {/* Entête du profil */}
                    <div className="flex items-center gap-4">
                        <div className="flex size-16 items-center justify-center rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-400">
                            <User className="size-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                                {profileUser.display_name}
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                Membre depuis le {profileUser.created_at
                                    ? new Date(profileUser.created_at).toLocaleDateString("fr-FR")
                                    : "une date inconnue"}
                            </p>
                        </div>
                    </div>

                    {/* Bouton d'action */}
                    <MessageButton recipientId={profileUser.id} />
                </div>
            </div>
        </div>
    )
}