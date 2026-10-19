import { AppSidebar } from "@/components/app-sidebar"
import { getCurrentUserWithProfile } from "@/app/actions/auth.actions"
import { connection } from "next/server"

export async function AppSidebarContent() {
    await connection()
    const { user, profile } = await getCurrentUserWithProfile()

    const userData = {
        name: profile?.pseudo || profile?.name || user?.email?.split('@')[0] || "User",
        email: user?.email || "",
        avatar: profile?.avatar || "/avatars/shadcn.jpg",
    }

    return <AppSidebar user={userData} />
}