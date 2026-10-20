import type { User } from "@supabase/supabase-js"
import { prisma } from "@/lib/prisma"

export async function ensurePublicProfile(user: User) {
  const existingProfile = await prisma.profiles.findUnique({
    where: { id: user.id },
  })
  if (existingProfile) return existingProfile

  const emailUsername = user.email?.split("@")[0]?.slice(0, 24)
  return prisma.profiles.create({
    data: {
      id: user.id,
      username: emailUsername || `user_${user.id.slice(0, 6)}`,
      display_name: typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name
        : emailUsername || null,
      avatar_url: typeof user.user_metadata?.avatar_url === "string"
        ? user.user_metadata.avatar_url
        : null,
    },
  })
}
