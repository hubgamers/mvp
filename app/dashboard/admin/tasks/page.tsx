import Link from "next/link"
import { ArrowLeft, CalendarDays, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createAdminTask, deleteAdminTask, updateAdminTaskStatus } from "@/app/actions/admin.actions"
import { requireAdmin } from "@/lib/admin"
import { prisma } from "@/lib/prisma"

export const metadata = { title: "Tâches · Administration · HubGamers" }

type AdminTask = {
  id: string
  title: string
  description: string | null
  status: "todo" | "in_progress" | "done"
  priority: "low" | "medium" | "high"
  due_date: Date | null
}

const columns: Array<{ status: AdminTask["status"]; label: string; tone: string }> = [
  { status: "todo", label: "À faire", tone: "text-slate-200" },
  { status: "in_progress", label: "En cours", tone: "text-cyan-300" },
  { status: "done", label: "Terminées", tone: "text-emerald-300" },
]

const priorityLabels: Record<AdminTask["priority"], string> = {
  low: "Basse",
  medium: "Normale",
  high: "Haute",
}

export default async function AdminTasksPage() {
  await requireAdmin()
  const tasks = await prisma.$queryRaw<AdminTask[]>`
    SELECT id::text, title, description, status, priority, due_date
    FROM admin.tasks
    ORDER BY due_date ASC NULLS LAST, created_at DESC
  `

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-7 p-6 lg:p-8">
      <header>
        <Link href="/dashboard/admin" className="mb-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-cyan-300">
          <ArrowLeft className="size-3.5" /> Administration
        </Link>
        <h1 className="text-3xl font-black tracking-tight text-white">Tableau de tâches</h1>
        <p className="mt-2 text-sm text-muted-foreground">Organisez et suivez les tâches de l’équipe HubGamers.</p>
      </header>

      <form action={createAdminTask} className="grid gap-3 rounded-xl border border-cyan-300/15 bg-card/80 p-5 md:grid-cols-2 xl:grid-cols-[1.4fr_1fr_150px_170px_auto] xl:items-end">
        <label className="grid gap-1.5 text-xs font-medium text-slate-300">
          Nouvelle tâche
          <Input name="title" required maxLength={160} placeholder="Ex. Préparer le lancement" />
        </label>
        <label className="grid gap-1.5 text-xs font-medium text-slate-300">
          Détails
          <Input name="description" maxLength={2000} placeholder="Contexte ou prochaine étape" />
        </label>
        <label className="grid gap-1.5 text-xs font-medium text-slate-300">
          Priorité
          <select name="priority" defaultValue="medium" className="h-9 rounded-lg border border-input bg-input px-3 text-sm text-foreground">
            <option value="low">Basse</option><option value="medium">Normale</option><option value="high">Haute</option>
          </select>
        </label>
        <label className="grid gap-1.5 text-xs font-medium text-slate-300">
          Échéance
          <Input type="date" name="due_date" />
        </label>
        <Button type="submit" className="h-9"><Plus className="size-4" /> Ajouter</Button>
      </form>

      <section className="grid items-start gap-4 lg:grid-cols-3">
        {columns.map((column) => {
          const columnTasks = tasks.filter((task) => task.status === column.status)
          return (
            <div key={column.status} className="min-h-52 rounded-xl border border-white/10 bg-white/[0.015] p-3">
              <div className="mb-3 flex items-center justify-between px-1">
                <h2 className={`text-sm font-bold ${column.tone}`}>{column.label}</h2>
                <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] text-muted-foreground">{columnTasks.length}</span>
              </div>
              <div className="grid gap-3">
                {columnTasks.map((task) => (
                  <article key={task.id} className="rounded-lg border border-white/10 bg-card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-sm font-semibold text-white">{task.title}</h3>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] ${task.priority === "high" ? "bg-rose-400/10 text-rose-300" : task.priority === "low" ? "bg-slate-400/10 text-slate-300" : "bg-amber-300/10 text-amber-200"}`}>
                        {priorityLabels[task.priority]}
                      </span>
                    </div>
                    {task.description && <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">{task.description}</p>}
                    {task.due_date && (
                      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
                        <CalendarDays className="size-3.5" /> {task.due_date.toLocaleDateString("fr-FR")}
                      </p>
                    )}
                    <form action={updateAdminTaskStatus} className="mt-4 flex gap-2">
                      <input type="hidden" name="id" value={task.id} />
                      <select name="status" defaultValue={task.status} aria-label={`Statut de ${task.title}`} className="h-8 min-w-0 flex-1 rounded-md border border-input bg-input px-2 text-xs text-foreground">
                        {columns.map(({ status, label }) => <option key={status} value={status}>{label}</option>)}
                      </select>
                      <Button type="submit" variant="secondary" size="sm" className="h-8">Déplacer</Button>
                    </form>
                    <form action={deleteAdminTask} className="mt-2">
                      <input type="hidden" name="id" value={task.id} />
                      <Button type="submit" variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive">Supprimer</Button>
                    </form>
                  </article>
                ))}
                {!columnTasks.length && (
                  <p className="rounded-lg border border-dashed border-white/10 px-3 py-6 text-center text-xs text-muted-foreground">
                    {column.status === "todo" ? "Aucune tâche à faire." : "Aucune tâche dans cette colonne."}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </section>
    </div>
  )
}
