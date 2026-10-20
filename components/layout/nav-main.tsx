"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: React.ReactNode
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const pathname = usePathname()

  return (
    <SidebarMenu className="gap-1">
      {items.map((item) => {
        const isActive =
          item.url === "/dashboard"
            ? pathname === item.url
            : pathname === item.url || pathname.startsWith(`${item.url}/`)

        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              render={<Link href={item.url} />}
              isActive={isActive}
              tooltip={item.title}
              className="relative h-10 gap-3 rounded-lg px-3 text-[13px] font-medium text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground data-active:before:absolute data-active:before:inset-y-2 data-active:before:left-0 data-active:before:w-0.5 data-active:before:rounded-full data-active:before:bg-brand-cyan"
            >
              {item.icon}
              <span>{item.title}</span>
            </SidebarMenuButton>
            {item.items?.length ? (
              <SidebarMenuSub className="ml-5 mt-1 border-sidebar-border/80 pl-3">
                {item.items.map((subItem) => {
                  const isSubItemActive = pathname === subItem.url

                  return (
                    <SidebarMenuSubItem key={subItem.url}>
                      <SidebarMenuSubButton
                        render={<Link href={subItem.url} />}
                        isActive={isSubItemActive}
                        aria-current={isSubItemActive ? "page" : undefined}
                        className="h-8 text-xs text-sidebar-foreground/75 hover:text-sidebar-accent-foreground data-active:bg-sidebar-accent/70 data-active:text-sidebar-accent-foreground"
                      >
                        <span>{subItem.title}</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  )
                })}
              </SidebarMenuSub>
            ) : null}
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}
