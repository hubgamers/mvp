import { Suspense, type ReactNode } from "react"
import Link from "next/link"
import { DashboardBreadcrumbs } from "@/components/layout/dashboard-breadcrumbs"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppSidebarContent } from "@/components/layout/app-sidebar-content"
import { Clapperboard, Plus, Radio } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <SidebarProvider>
      <Suspense fallback={<div className="w-64 bg-sidebar/50 animate-pulse border-r h-screen" />}>
        <AppSidebarContent />
      </Suspense>
      <SidebarInset className="bg-background flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-white/[0.08] bg-background/85 px-4 backdrop-blur-xl transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto bg-white/10"
            />
            <Suspense fallback={<div className="h-4 w-32 animate-pulse rounded bg-muted" />}>
              <DashboardBreadcrumbs />
            </Suspense>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[11px] font-semibold tracking-wider uppercase">
                ENGINE LIVE
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="hidden md:inline-flex text-xs h-8"
              asChild
            >
              <Link href="/dashboard/studio">
                <Clapperboard className="size-3.5 mr-1.5 text-purple-400" />
                Studio OBS
              </Link>
            </Button>

            <Button size="sm" className="h-8 text-xs font-semibold" asChild>
              <Link href="/dashboard/tournaments/new">
                <Plus className="size-3.5 mr-1" />
                Nouveau tournoi
              </Link>
            </Button>
          </div>
        </header>

        <main className="flex-1">
          <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Chargement du tableau de bord…</div>}>
            {children}
          </Suspense>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
