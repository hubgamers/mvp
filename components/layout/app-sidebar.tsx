import * as React from "react"

import { NavMain } from "@/components/layout/nav-main"
import { NavProjects } from "@/components/layout/nav-projects"
import { NavUser } from "@/components/layout/nav-user"
import { TeamSwitcher } from "@/components/layout/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { GalleryVerticalEndIcon, AudioLinesIcon, TerminalIcon, BotIcon, BookOpenIcon, FrameIcon, PieChartIcon, MapIcon, TrophyIcon, MailCheckIcon, UsersRoundIcon } from "lucide-react"

const data = {
  teams: [
    { name: "HubGamers", logo: <GalleryVerticalEndIcon />, plan: "MVP" },
    { name: "Acme Corp.", logo: <AudioLinesIcon />, plan: "Startup" },
    { name: "Evil Corp.", logo: <TerminalIcon />, plan: "Free" },
  ],
  navMain: [
    {
      title: "Tournois",
      url: "/dashboard/tournaments",
      icon: <TrophyIcon />,
      isActive: false,
      items: [
        { title: "Créer", url: "/dashboard/tournaments/new" },
        { title: "Explorer", url: "/dashboard/tournaments/explore" },
        { title: "Mes tournois", url: "/dashboard/tournaments" },
      ],
    },
    {
      title: "Structures",
      url: "/dashboard/structures",
      icon: <BotIcon />,
      items: [
        { title: "Créer", url: "/dashboard/structures/new" },
        { title: "Explorer", url: "/dashboard/structures/explore" },
        { title: "Mes structures", url: "/dashboard/structures" },
      ],
    },
    {
      title: "Équipes",
      url: "/dashboard/teams",
      icon: <UsersRoundIcon />,
      items: [
        { title: "Mes équipes", url: "/dashboard/teams" },
      ],
    },
    {
      title: "Studio",
      url: "/dashboard/studio",
      icon: <BookOpenIcon />,
      items: [
        { title: "Explorer", url: "/dashboard/studio/explore" },
        { title: "Mon studio", url: "/dashboard/studio" },
      ],
    },
    {
      title: "Invitations",
      url: "/dashboard/invitations",
      icon: <MailCheckIcon />,
      items: [
        { title: "Voir mes invitations", url: "/dashboard/invitations" },
      ]
    },
  ],
  projects: [
    { name: "Design Engineering", url: "#", icon: <FrameIcon /> },
    { name: "Sales & Marketing", url: "#", icon: <PieChartIcon /> },
    { name: "Travel", url: "#", icon: <MapIcon /> },
  ],
}

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
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}