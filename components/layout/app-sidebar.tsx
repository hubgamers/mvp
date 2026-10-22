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
  Clapperboard,
  Sparkles,
  UserPlus,
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
    label: "Espace Général",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: <Home className="size-4 text-brand-cyan" /> },
      { title: "Match Chats", url: "/dashboard/chats", icon: <MessageSquare className="size-4" /> },
    ],
  },
  {
    label: "Compétitions",
    items: [
      {
        title: "Tournois",
        url: "/dashboard/tournaments",
        icon: <Trophy className="size-4 text-amber-400" />,
        items: [
          { title: "Explorer les tournois", url: "/dashboard/tournaments/explore" },
          { title: "Mes compétitions", url: "/dashboard/tournaments" },
          { title: "Nouveau tournoi", url: "/dashboard/tournaments/new" },
        ],
      },
      {
        title: "Structures",
        url: "/dashboard/structures",
        icon: <Building2 className="size-4 text-emerald-400" />,
        items: [
          { title: "Explorer les clubs", url: "/dashboard/structures/explore" },
          { title: "Mes structures", url: "/dashboard/structures" },
          { title: "Nouvelle structure", url: "/dashboard/structures/new" },
        ],
      },
      { title: "Mes Équipes & Lineups", url: "/dashboard/teams", icon: <UsersRound className="size-4 text-purple-400" /> },
      {
        title: "Squads & LFG",
        url: "/dashboard/squads",
        icon: <UserPlus className="size-4 text-cyan-400" />,
        items: [
          { title: "Explorer les escouades", url: "/dashboard/squads/explore" },
          { title: "Mes escouades", url: "/dashboard/squads" },
          { title: "Créer une escouade", url: "/dashboard/squads/new" },
        ],
      },
      { title: "Invitations Reçues", url: "/dashboard/invitations", icon: <Mail className="size-4" /> },
    ],
  },
  {
    label: "Diffusion Live",
    items: [
      { title: "Studio Broadcast OBS", url: "/dashboard/studio", icon: <Clapperboard className="size-4 text-purple-400" /> },
    ],
  },
  {
    label: "Administration",
    items: [
      { title: "Abonnement & Factures", url: "/dashboard/billing", icon: <CreditCard className="size-4" /> },
      { title: "Profil Joueur", url: "/dashboard/user", icon: <UserRound className="size-4" /> },
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
    <Sidebar collapsible="icon" className="border-r border-white/[0.08] bg-[#0a0e17]" {...props}>
      <SidebarHeader className="border-b border-white/[0.08] px-3 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="/dashboard" />}
              size="lg"
              tooltip="HubGamers"
              className="h-12 gap-3 rounded-xl px-2.5 hover:bg-white/[0.04] transition-colors"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-cyan to-blue-600 text-slate-950 font-black shadow-[0_0_20px_rgba(0,242,254,0.35)]">
                <Gamepad2 className="size-5 text-brand-ink" />
              </span>
              <span className="grid min-w-0 flex-1 text-left leading-tight">
                <span className="truncate text-base font-black tracking-tight text-white flex items-center">
                  HUB<span className="text-brand-cyan">GAMERS</span>
                </span>
                <span className="mt-0.5 truncate text-[9px] font-bold uppercase tracking-[0.2em] text-brand-cyan">
                  ESPORT OS · PRO
                </span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-2 px-2.5 py-4">
        {navigation.map((group) => (
          <SidebarGroup key={group.label} className="p-0 mb-3">
            <SidebarGroupLabel className="h-7 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              {group.label}
            </SidebarGroupLabel>
            <NavMain items={group.items} />
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-white/[0.08] p-3 bg-black/20">
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
