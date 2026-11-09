import type { User } from "@supabase/supabase-js"
import { prisma } from "@/lib/prisma"

export async function ensurePublicProfile(user: User) {
  const existingProfile = await prisma.users.findUnique({
    where: { id: user.id },
  })
  if (existingProfile) return existingProfile

  if (!user.email) {
    throw new Error("Cannot create a user profile without an email address.")
  }

  const displayName = typeof user.user_metadata?.full_name === "string"
    ? user.user_metadata.full_name
    : user.email.split("@")[0]
  return prisma.users.create({
    data: {
      id: user.id,
      email: user.email,
      display_name: displayName,
    },
  })
}
