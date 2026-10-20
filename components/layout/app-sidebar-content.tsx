import { connection } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { prisma } from "@/lib/prisma"
import { AppSidebar } from "./app-sidebar"

export async function AppSidebarContent() {
  await connection()
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  const profile = user
    ? await prisma.profiles.findUnique({
        where: { id: user.id },
        select: { username: true, display_name: true, avatar_url: true },
      })
    : null

  const userData = {
    name:
      profile?.display_name ||
      profile?.username ||
      user?.email?.split("@")[0] ||
      "Utilisateur",
    email: user?.email || "",
    avatar: profile?.avatar_url || "",
  }

  return <AppSidebar user={userData} />
}