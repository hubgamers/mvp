import Link from "next/link"
import { ArrowLeft, Search, UsersRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { updateCrmContact } from "@/app/actions/admin.actions"
import { requireAdmin } from "@/lib/admin"
import { prisma } from "@/lib/prisma"

export const metadata = { title: "CRM · Administration · HubGamers" }

type CrmContact = {
  id: string
  display_name: string
  email: string
  created_at: Date | null
  status: string
  notes: string | null
}

const statusLabels: Record<string, string> = {
  new: "Nouveau",
  lead: "Prospect",
  active: "Actif",
  customer: "Client",
  churned: "Inactif",
}

export default async function AdminCrmPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  await requireAdmin()
  const { q = "" } = await searchParams
  const query = q.trim().slice(0, 100)

  const contacts = await prisma.$queryRaw<CrmContact[]>`
    SELECT u.id::text AS id, u.display_name, u.email, u.created_at,
           COALESCE(c.status, 'new') AS status, c.notes
    FROM public.users AS u
    LEFT JOIN admin.crm_contacts AS c ON c.user_id = u.id
    WHERE ${query} = ''
       OR u.display_name ILIKE ${`%${query}%`}
       OR u.email ILIKE ${`%${query}%`}
    ORDER BY u.created_at DESC NULLS LAST
    LIMIT 100
  `

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-7 p-6 lg:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/dashboard/admin" className="mb-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-cyan-300">
            <ArrowLeft className="size-3.5" /> Administration
          </Link>
          <h1 className="text-3xl font-black tracking-tight text-white">CRM utilisateurs</h1>
          <p className="mt-2 text-sm text-muted-foreground">Notes et suivi privés pour les comptes HubGamers.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-card px-3 py-1.5 text-xs text-muted-foreground">
          <UsersRound className="size-3.5 text-cyan-300" /> {contacts.length} contacts affichés
        </span>
      </header>

      <form method="get" action="/dashboard/admin/crm" className="flex max-w-xl gap-2">
        <Input name="q" defaultValue={query} placeholder="Rechercher un nom ou un e-mail" aria-label="Rechercher un contact" />
        <Button type="submit" variant="secondary"><Search className="size-4" /> Rechercher</Button>
      </form>

      {contacts.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {contacts.map((contact) => (
            <article key={contact.id} className="rounded-xl border border-white/10 bg-card/80 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate font-bold text-white">{contact.display_name}</h2>
                  <p className="mt-1 break-all text-xs text-muted-foreground">{contact.email}</p>
                </div>
                <span className="rounded-full border border-cyan-300/15 bg-cyan-300/[0.07] px-2.5 py-1 text-[11px] font-medium text-cyan-200">
                  {statusLabels[contact.status] ?? contact.status}
                </span>
              </div>
              <p className="mt-3 text-[11px] text-slate-500">
                Inscrit le {contact.created_at?.toLocaleDateString("fr-FR") ?? "date inconnue"}
              </p>
              <form action={updateCrmContact} className="mt-4 grid gap-3 border-t border-white/[0.07] pt-4">
                <input type="hidden" name="user_id" value={contact.id} />
                <label className="grid gap-1.5 text-xs font-medium text-slate-300">
                  Statut CRM
                  <select name="status" defaultValue={contact.status} className="h-9 rounded-lg border border-input bg-input px-3 text-sm text-foreground">
                    {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
                <label className="grid gap-1.5 text-xs font-medium text-slate-300">
                  Notes privées
                  <Textarea name="notes" defaultValue={contact.notes ?? ""} maxLength={2000} placeholder="Contexte, échanges, prochaines actions…" className="min-h-20" />
                </label>
                <Button type="submit" size="sm" className="justify-self-start">Enregistrer le contact</Button>
              </form>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-white/10 p-12 text-center text-sm text-muted-foreground">
          Aucun utilisateur ne correspond à cette recherche.
        </div>
      )}
      <p className="text-xs text-muted-foreground">La liste est limitée aux 100 comptes les plus récents. Affinez la recherche pour retrouver un contact.</p>
    </div>
  )
}
