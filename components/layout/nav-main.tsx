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
              className="relative h-10 gap-3 rounded-lg px-3 text-[13px] font-semibold text-slate-300 hover:bg-white/[0.05] hover:text-white data-active:bg-brand-cyan/10 data-active:text-brand-cyan data-active:before:absolute data-active:before:inset-y-1.5 data-active:before:left-0 data-active:before:w-1 data-active:before:rounded-r-full data-active:before:bg-brand-cyan data-active:before:shadow-[0_0_10px_rgba(0,242,254,0.6)]"
            >
              {item.icon}
              <span className="tracking-wide">{item.title}</span>
            </SidebarMenuButton>
            {item.items?.length ? (
              <SidebarMenuSub className="ml-5 mt-1 border-white/[0.08] pl-3 space-y-1">
                {item.items.map((subItem) => {
                  const isSubItemActive = pathname === subItem.url

                  return (
                    <SidebarMenuSubItem key={subItem.url}>
                      <SidebarMenuSubButton
                        render={<Link href={subItem.url} />}
                        isActive={isSubItemActive}
                        aria-current={isSubItemActive ? "page" : undefined}
                        className="h-8 text-xs text-slate-400 hover:text-white data-active:bg-white/[0.06] data-active:text-brand-cyan font-medium"
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
