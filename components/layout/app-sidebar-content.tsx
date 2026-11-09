import { connection } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { prisma } from "@/lib/prisma"
import { isAdminEmail } from "@/lib/admin"
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
    ? await prisma.users.findUnique({
        where: { id: user.id },
        select: { display_name: true},
      })
    : null

  const userData = {
    name:
      profile?.display_name ||
      user?.email?.split("@")[0] ||
      "Utilisateur",
    email: user?.email || "",
    avatar:  "",
  }

  return <AppSidebar user={userData} isAdmin={isAdminEmail(user?.email)} />
}