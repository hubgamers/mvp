import Link from "next/link"
import { ArrowRight, ChartNoAxesCombined, CheckSquare, ContactRound, Database, ShieldCheck, UsersRound } from "lucide-react"
import { requireAdmin } from "@/lib/admin"
import { prisma } from "@/lib/prisma"

export const metadata = {
  title: "Administration · HubGamers",
  description: "Espace privé d'administration HubGamers.",
}

type RecentTask = {
  id: string
  title: string
  status: string
  priority: string
  due_date: Date | null
}

export default async function AdminPage() {
  await requireAdmin()

  const [users, tournaments, clubs, openTasks, recentTasks] = await Promise.all([
    prisma.users.count(),
    prisma.tournaments.count(),
    prisma.clubs.count({ where: { deleted: false } }),
    prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT count(*) AS count FROM admin.tasks WHERE status != 'done'
    `,
    prisma.$queryRaw<RecentTask[]>`
      SELECT id::text, title, status, priority, due_date
      FROM admin.tasks
      ORDER BY (status = 'done') ASC, due_date ASC NULLS LAST, created_at DESC
      LIMIT 5
    `,
  ])

  const stats = [
    { label: "Utilisateurs", value: users, icon: UsersRound, color: "text-cyan-300" },
    { label: "Tournois", value: tournaments, icon: ShieldCheck, color: "text-amber-300" },
    { label: "Structures", value: clubs, icon: ContactRound, color: "text-emerald-300" },
    { label: "Tâches ouvertes", value: Number(openTasks[0]?.count ?? 0), icon: CheckSquare, color: "text-violet-300" },
  ]

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-6 lg:p-8">
      <section className="relative overflow-hidden rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-950/60 via-slate-950 to-violet-950/40 p-7 md:p-9">
        <div className="absolute -right-12 -top-20 size-72 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
              <ShieldCheck className="size-4" /> Console privée
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Administration</h1>
            <p className="mt-2 max-w-xl text-sm text-slate-300">
              Vue d’ensemble de HubGamers, suivi CRM et pilotage des tâches.
            </p>
          </div>
          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-300">
            Accès administrateur vérifié
          </span>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <article key={label} className="rounded-xl border border-white/10 bg-card/80 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{label}</p>
              <Icon className={`size-5 ${color}`} />
            </div>
            <p className="mt-3 text-3xl font-bold text-white">{value.toLocaleString("fr-FR")}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <article className="rounded-xl border border-white/10 bg-card/80 p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-white">À suivre</h2>
              <p className="mt-1 text-xs text-muted-foreground">Tâches prioritaires et prochaines échéances</p>
            </div>
            <Link href="/dashboard/admin/tasks" className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-300 hover:text-cyan-200">
              Toutes les tâches <ArrowRight className="size-3.5" />
            </Link>
          </div>
          {recentTasks.length ? (
            <ul className="divide-y divide-white/[0.07]">
              {recentTasks.map((task) => (
                <li key={task.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-100">{task.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {task.due_date ? `Échéance ${task.due_date.toLocaleDateString("fr-FR")}` : "Sans échéance"}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${task.status === "done" ? "bg-emerald-400/10 text-emerald-300" : task.priority === "high" ? "bg-rose-400/10 text-rose-300" : "bg-cyan-400/10 text-cyan-300"}`}>
                    {task.status === "done" ? "Terminée" : task.priority === "high" ? "Prioritaire" : task.status === "in_progress" ? "En cours" : "À faire"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-lg border border-dashed border-white/10 px-4 py-8 text-center text-sm text-muted-foreground">
              Aucune tâche pour le moment.
            </p>
          )}
        </article>

        <article className="rounded-xl border border-white/10 bg-card/80 p-5">
          <h2 className="font-bold text-white">Accès rapides</h2>
          <p className="mt-1 text-xs text-muted-foreground">Outils de gestion réservés à l’administration</p>
          <div className="mt-5 grid gap-3">
            <Link href="/dashboard/admin/crm" className="group flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] p-4 hover:border-cyan-300/30 hover:bg-cyan-300/[0.04]">
              <span className="flex items-center gap-3">
                <ContactRound className="size-5 text-cyan-300" />
                <span><span className="block text-sm font-semibold text-white">CRM utilisateurs</span><span className="mt-1 block text-xs text-muted-foreground">Contacts, statut et notes privées</span></span>
              </span>
              <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/dashboard/admin/tasks" className="group flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] p-4 hover:border-violet-300/30 hover:bg-violet-300/[0.04]">
              <span className="flex items-center gap-3">
                <CheckSquare className="size-5 text-violet-300" />
                <span><span className="block text-sm font-semibold text-white">Tableau de tâches</span><span className="mt-1 block text-xs text-muted-foreground">Créer et suivre le travail à faire</span></span>
              </span>
              <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/dashboard/admin/subscriptions" className="group flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] p-4 hover:border-emerald-300/30 hover:bg-emerald-300/[0.04]">
              <span className="flex items-center gap-3">
                <ChartNoAxesCombined className="size-5 text-emerald-300" />
                <span><span className="block text-sm font-semibold text-white">Dashboard abonnements</span><span className="mt-1 block text-xs text-muted-foreground">MRR, paiements et contrats Stripe</span></span>
              </span>
              <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/dashboard/admin/database" className="group flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] p-4 hover:border-amber-300/30 hover:bg-amber-300/[0.04]">
              <span className="flex items-center gap-3">
                <Database className="size-5 text-amber-300" />
                <span><span className="block text-sm font-semibold text-white">Toutes les tables</span><span className="mt-1 block text-xs text-muted-foreground">Recherche et consultation des données</span></span>
              </span>
              <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </article>
      </section>
    </div>
  )
}
