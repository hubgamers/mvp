import * as React from "react"
import Link from "next/link"
import {
  Building2,
  CreditCard,
  Gamepad2,
  Home,
  Mail,
  MessageSquare,
  Trophy,
  UserRound,
  UsersRound,
} from "lucide-react"

import { NavMain } from "@/components/layout/nav-main"
import { NavUser } from "@/components/layout/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const navigation = [
  {
    label: "Espace",
    items: [
      { title: "Accueil", url: "/dashboard", icon: <Home /> },
      { title: "Chats", url: "/dashboard/chats", icon: <MessageSquare /> },
    ],
  },
  {
    label: "Organiser",
    items: [
      {
        title: "Tournois",
        url: "/dashboard/tournaments",
        icon: <Trophy />,
        items: [
          { title: "Explorer", url: "/dashboard/tournaments/explore" },
          { title: "Mes tournois", url: "/dashboard/tournaments" },
          { title: "Créer un tournoi", url: "/dashboard/tournaments/new" },
        ],
      },
      {
        title: "Structures",
        url: "/dashboard/structures",
        icon: <Building2 />,
        items: [
          { title: "Explorer", url: "/dashboard/structures/explore" },
          { title: "Mes structures", url: "/dashboard/structures" },
          { title: "Créer une structure", url: "/dashboard/structures/new" },
        ],
      },
      { title: "Équipes", url: "/dashboard/teams", icon: <UsersRound /> },
      { title: "Invitations", url: "/dashboard/invitations", icon: <Mail /> },
    ],
  },
  {
    label: "Créer",
    items: [{ title: "Studio", url: "/dashboard/studio", icon: <Gamepad2 /> }],
  },
  {
    label: "Compte",
    items: [
      { title: "Facturation", url: "/dashboard/billing", icon: <CreditCard /> },
      { title: "Profil", url: "/dashboard/user", icon: <UserRound /> },
    ],
  },
]

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: {
    name: string
    email: string
    avatar: string
  }
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="border-b border-sidebar-border px-3 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="/dashboard" />}
              size="lg"
              tooltip="HubGamers"
              className="h-12 gap-3 rounded-lg px-2 hover:bg-sidebar-accent"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground shadow-[0_0_18px_color-mix(in_srgb,var(--brand-cyan)_22%,transparent)]">
                <Gamepad2 className="size-5" />
              </span>
              <span className="grid min-w-0 flex-1 text-left leading-tight">
                <span className="truncate text-sm font-bold tracking-tight text-sidebar-foreground">
                  Hub<span className="text-brand-cyan">Gamers</span>
                </span>
                <span className="mt-1 truncate text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Espace organisateur
                </span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-2 px-2 py-4">
        {navigation.map((group) => (
          <SidebarGroup key={group.label} className="p-0">
            <SidebarGroupLabel className="h-7 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {group.label}
            </SidebarGroupLabel>
            <NavMain items={group.items} />
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
