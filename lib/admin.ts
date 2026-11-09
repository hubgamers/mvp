import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"

export function isAdminEmail(email: string | null | undefined) {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  return Boolean(adminEmail && email?.trim().toLowerCase() === adminEmail)
}

export async function requireAdmin() {
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

  if (!process.env.ADMIN_EMAIL?.trim()) {
    throw new Error("La variable ADMIN_EMAIL doit être configurée pour activer l'espace admin.")
  }

  if (!isAdminEmail(user.email)) {
    redirect("/dashboard")
  }

  return user
}
