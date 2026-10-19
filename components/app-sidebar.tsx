import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { GalleryVerticalEndIcon, AudioLinesIcon, TerminalIcon, TerminalSquareIcon, BotIcon, BookOpenIcon, Settings2Icon, FrameIcon, PieChartIcon, MapIcon, LayoutDashboardIcon, TrophyIcon } from "lucide-react"

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
      title: "Studio",
      url: "#",
      icon: <BookOpenIcon />,
      items: [
        { title: "Explorer", url: "/dashboard/studio/explore" },
        { title: "Mon studio", url: "/dashboard/studio" },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: <Settings2Icon />,
      items: [
        { title: "General", url: "#" },
        { title: "Team", url: "#" },
        { title: "Billing", url: "#" },
        { title: "Limits", url: "#" },
      ],
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