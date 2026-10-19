// components/nav-user-wrapper.tsx
import { getCurrentUserWithProfile } from "@/app/actions/auth.actions"
import { NavUser } from "@/components/nav-user"

export async function NavUserWrapper() {
  const { user, profile } = await getCurrentUserWithProfile()

  const userData = {
    name: profile?.pseudo || profile?.name || user?.email?.split('@')[0] || "User",
    email: user?.email || "m@example.com",
    avatar: profile?.avatar || "/avatars/shadcn.jpg",
  }

  return <NavUser user={userData} />
}