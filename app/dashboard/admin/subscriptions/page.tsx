import Link from "next/link"
import { ArrowLeft, ArrowUpRight, CalendarClock, CircleDollarSign, CreditCard, ExternalLink, Search, UsersRound } from "lucide-react"
import { Prisma } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { requireAdmin } from "@/lib/admin"
import { prisma } from "@/lib/prisma"
import { SubscriptionControl } from "./subscription-control"

export const metadata = { title: "Abonnements · Administration · HubGamers" }

const pageSize = 50
const statuses = ["all", "active", "trialing", "past_due", "unpaid", "canceled", "incomplete", "incomplete_expired", "checkout_expired", "paused"] as const
const planNames: Record<string, string> = {
  "player-plus": "Player Plus",
  "player-pro": "Player Pro",
  "organizer-plus": "Organizer Plus",
  "organizer-pro": "Organizer Pro",
  "club-plus": "Club Plus",
  "club-pro": "Club Pro",
  "studio-plus": "Studio Plus",
  "studio-pro": "Studio Pro",
}

type BillingSummary = {
  currency: string
  active_count: number
  trialing_count: number
  past_due_count: number
  canceled_count: number
  mrr_cents: number
  canceled_recently: number
}
type PlanSummary = { plan_id: string; currency: string; mrr_cents: number; count: number }
type SubscriptionRow = {
  id: string
  subscription_id: string | null
  customer_id: string | null
  display_name: string
  email: string
  plan_id: string
  status: string
  currency: string
  amount: number | null
  interval: string | null
  interval_count: number
  current_period_end: Date | null
  cancel_at_period_end: boolean
  is_current: boolean
}

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 2,
  }).format(cents / 100)
}

function formatInterval(interval: string | null, intervalCount: number) {
  if (!interval) return "Période inconnue"
  const labels: Record<string, string> = { day: "jour", week: "semaine", month: "mois", year: "an" }
  const label = labels[interval] ?? interval
  const plural = label === "mois" ? label : `${label}s`
  return intervalCount > 1 ? `Tous les ${intervalCount} ${plural}` : `Par ${label}`
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    active: "Actif",
    trialing: "Essai",
    past_due: "Paiement en retard",
    unpaid: "Impayé",
    canceled: "Résilié",
    incomplete: "Incomplet",
    incomplete_expired: "Expiré",
    checkout_expired: "Checkout expiré",
    paused: "En pause",
  }
  return labels[status] ?? status
}

function statusStyle(status: string) {
  if (status === "active") return "bg-emerald-400/10 text-emerald-300"
  if (status === "trialing") return "bg-cyan-400/10 text-cyan-300"
  if (status === "past_due" || status === "unpaid") return "bg-rose-400/10 text-rose-300"
  return "bg-slate-400/10 text-slate-300"
}

function getSingleParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined
}

export default async function AdminSubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; status?: string | string[]; page?: string | string[] }>
}) {
  await requireAdmin()
  const params = await searchParams
  const query = (getSingleParam(params.q) ?? "").trim().slice(0, 100)
  const requestedStatus = getSingleParam(params.status)
  const status = statuses.includes(requestedStatus as (typeof statuses)[number]) ? requestedStatus! : "all"
  const requestedPage = Number(getSingleParam(params.page))
  const safePage = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1

  const [summaries, plans] = await Promise.all([
    prisma.$queryRaw<BillingSummary[]>`
      SELECT COALESCE(currency, 'eur') AS currency,
        count(*) FILTER (WHERE is_current AND status = 'active')::int AS active_count,
        count(*) FILTER (WHERE is_current AND status = 'trialing')::int AS trialing_count,
        count(*) FILTER (WHERE is_current AND status = 'past_due')::int AS past_due_count,
        count(*) FILTER (WHERE status = 'canceled')::int AS canceled_count,
        count(*) FILTER (WHERE status = 'canceled' AND canceled_at >= now() - interval '30 days')::int AS canceled_recently,
        COALESCE(SUM(
          CASE interval
            WHEN 'month' THEN amount::float8 / GREATEST(COALESCE(interval_count, 1), 1)
            WHEN 'year' THEN amount::float8 / 12 / GREATEST(COALESCE(interval_count, 1), 1)
            WHEN 'week' THEN amount::float8 * 52 / 12 / GREATEST(COALESCE(interval_count, 1), 1)
            WHEN 'day' THEN amount::float8 * 365 / 12 / GREATEST(COALESCE(interval_count, 1), 1)
            ELSE 0
          END
        ) FILTER (WHERE is_current AND status IN ('active', 'past_due')), 0)::float8 AS mrr_cents
      FROM public.stripe_subscriptions
      GROUP BY COALESCE(currency, 'eur')
    `,
    prisma.$queryRaw<PlanSummary[]>`
      SELECT plan_id, COALESCE(currency, 'eur') AS currency,
        count(*)::int AS count,
        COALESCE(SUM(
          CASE interval
            WHEN 'month' THEN amount::float8 / GREATEST(COALESCE(interval_count, 1), 1)
            WHEN 'year' THEN amount::float8 / 12 / GREATEST(COALESCE(interval_count, 1), 1)
            WHEN 'week' THEN amount::float8 * 52 / 12 / GREATEST(COALESCE(interval_count, 1), 1)
            WHEN 'day' THEN amount::float8 * 365 / 12 / GREATEST(COALESCE(interval_count, 1), 1)
            ELSE 0
          END
        ), 0)::float8 AS mrr_cents
      FROM public.stripe_subscriptions
      WHERE is_current AND status IN ('active', 'past_due')
      GROUP BY plan_id, COALESCE(currency, 'eur')
      ORDER BY mrr_cents DESC
    `,
  ])

  const filters = Prisma.sql`
    WHERE (${status} = 'all' OR s.status = ${status})
      AND (
        ${query} = ''
        OR u.display_name ILIKE ${`%${query}%`}
        OR u.email ILIKE ${`%${query}%`}
        OR s.plan_id ILIKE ${`%${query}%`}
      )
  `
  const countRows = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT count(*) AS count
    FROM public.stripe_subscriptions AS s
    JOIN public.users AS u ON u.id = s.user_id
    ${filters}
  `
  const totalRows = Number(countRows[0]?.count ?? 0)
  const pageCount = Math.ceil(totalRows / pageSize)
  const page = Math.min(safePage, Math.max(pageCount, 1))
  const subscriptions = await prisma.$queryRaw<SubscriptionRow[]>(
    Prisma.sql`
      SELECT s.id::text AS id, s.stripe_subscription_id AS subscription_id,
        s.stripe_customer_id AS customer_id, u.display_name, u.email, s.plan_id,
        s.status, COALESCE(s.currency, 'eur') AS currency, s.amount::float8 AS amount,
        s.interval, COALESCE(s.interval_count, 1)::int AS interval_count,
        s.current_period_end, s.cancel_at_period_end, s.is_current
      FROM public.stripe_subscriptions AS s
      JOIN public.users AS u ON u.id = s.user_id
      ${filters}
      ORDER BY s.created_at DESC
      LIMIT ${pageSize}
      OFFSET ${(page - 1) * pageSize}
    `,
  )
  const currencySummaries = summaries.length
    ? summaries
    : [{ currency: "eur", active_count: 0, trialing_count: 0, past_due_count: 0, canceled_count: 0, mrr_cents: 0, canceled_recently: 0 }]
  const maxMrrByCurrency = new Map<string, number>()
  for (const plan of plans) {
    maxMrrByCurrency.set(
      plan.currency,
      Math.max(maxMrrByCurrency.get(plan.currency) ?? 0, plan.mrr_cents),
    )
  }
  const stripeDashboardBase = process.env.STRIPE_SECRET_KEY?.includes("_test_")
    ? "https://dashboard.stripe.com/test"
    : "https://dashboard.stripe.com"

  function pageHref(targetPage: number) {
    const search = new URLSearchParams()
    if (query) search.set("q", query)
    if (status !== "all") search.set("status", status)
    search.set("page", String(targetPage))
    return `/dashboard/admin/subscriptions?${search.toString()}`
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-7 p-6 lg:p-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/dashboard/admin" className="mb-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-cyan-300">
            <ArrowLeft className="size-3.5" /> Administration
          </Link>
          <h1 className="text-3xl font-black tracking-tight text-white">Dashboard abonnements</h1>
          <p className="mt-2 text-sm text-muted-foreground">Revenus récurrents, état des paiements et gestion des contrats Stripe.</p>
        </div>
        <a href={`${stripeDashboardBase}/subscriptions`} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 px-3 text-xs font-semibold text-slate-200 hover:bg-white/[0.04]">
          Ouvrir Stripe Dashboard <ExternalLink className="size-3.5" />
        </a>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {currencySummaries.map((summary) => (
          <article key={`${summary.currency}-mrr`} className="rounded-xl border border-cyan-300/15 bg-card/80 p-5">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              MRR estimé · {summary.currency.toUpperCase()} <CircleDollarSign className="size-5 text-cyan-300" />
            </div>
            <p className="mt-3 text-3xl font-black text-white">{formatMoney(summary.mrr_cents, summary.currency)}</p>
            <p className="mt-1 text-xs text-muted-foreground">Actifs et paiements en retard, hors essais</p>
          </article>
        ))}
        <MetricCard label="Abonnements actifs" value={currencySummaries.reduce((sum, item) => sum + item.active_count, 0)} icon={<CreditCard className="size-5 text-emerald-300" />} />
        <MetricCard label="En période d’essai" value={currencySummaries.reduce((sum, item) => sum + item.trialing_count, 0)} icon={<UsersRound className="size-5 text-cyan-300" />} />
        <MetricCard label="Paiements en retard" value={currencySummaries.reduce((sum, item) => sum + item.past_due_count, 0)} icon={<CalendarClock className="size-5 text-rose-300" />} />
        <MetricCard label="Résiliés · 30 derniers jours" value={currencySummaries.reduce((sum, item) => sum + item.canceled_recently, 0)} icon={<ArrowUpRight className="size-5 text-amber-300" />} />
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <article className="rounded-xl border border-white/10 bg-card/80 p-5">
          <h2 className="font-bold text-white">Revenu mensuel par offre</h2>
          <p className="mt-1 text-xs text-muted-foreground">Montant récurrent normalisé par mois, par devise.</p>
          {plans.length ? (
            <div className="mt-5 grid gap-4">
              {plans.map((plan) => (
                <div key={`${plan.plan_id}-${plan.currency}`}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                    <span className="font-medium text-slate-200">{planNames[plan.plan_id] ?? plan.plan_id} <span className="text-muted-foreground">· {plan.count} actif(s)</span></span>
                    <span className="shrink-0 text-cyan-200">{formatMoney(plan.mrr_cents, plan.currency)} / mois</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                    <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" style={{ width: `${Math.max((plan.mrr_cents / Math.max(maxMrrByCurrency.get(plan.currency) ?? 0, 1)) * 100, 2)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-5 rounded-lg border border-dashed border-white/10 p-6 text-center text-sm text-muted-foreground">Aucun revenu récurrent actif pour le moment.</p>
          )}
        </article>
        <article className="rounded-xl border border-white/10 bg-card/80 p-5">
          <h2 className="font-bold text-white">Santé des abonnements</h2>
          <p className="mt-1 text-xs text-muted-foreground">État synchronisé depuis les événements Stripe reçus.</p>
          <div className="mt-5 grid gap-3">
            <StatusRow label="Actifs" value={currencySummaries.reduce((sum, item) => sum + item.active_count, 0)} tone="bg-emerald-400" />
            <StatusRow label="En essai" value={currencySummaries.reduce((sum, item) => sum + item.trialing_count, 0)} tone="bg-cyan-400" />
            <StatusRow label="Paiement en retard" value={currencySummaries.reduce((sum, item) => sum + item.past_due_count, 0)} tone="bg-rose-400" />
            <StatusRow label="Résiliés (historique)" value={currencySummaries.reduce((sum, item) => sum + item.canceled_count, 0)} tone="bg-slate-400" />
          </div>
          <p className="mt-4 text-[11px] text-muted-foreground">Les données reflètent la dernière synchronisation webhook. Vérifiez Stripe pour les changements encore en attente.</p>
        </article>
      </section>

      <section className="overflow-hidden rounded-xl border border-white/10 bg-card/80">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] p-5">
          <div>
            <h2 className="font-bold text-white">Tous les abonnements</h2>
            <p className="mt-1 text-xs text-muted-foreground">{totalRows.toLocaleString("fr-FR")} résultats · annulation en fin de période, réversible avant échéance</p>
          </div>
          <form method="get" action="/dashboard/admin/subscriptions" className="flex flex-wrap gap-2">
            <Input name="q" defaultValue={query} maxLength={100} placeholder="Nom, e-mail ou offre" className="w-52" />
            <select name="status" defaultValue={status} aria-label="Filtrer par statut" className="h-9 rounded-lg border border-input bg-input px-3 text-sm text-foreground">
              {statuses.map((value) => <option key={value} value={value}>{value === "all" ? "Tous les statuts" : statusLabel(value)}</option>)}
            </select>
            <Button type="submit" variant="secondary" size="sm"><Search className="size-4" /> Filtrer</Button>
          </form>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] border-collapse text-left text-xs">
            <thead className="bg-white/[0.025] text-[10px] uppercase tracking-wide text-slate-400">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Client</th>
                <th scope="col" className="px-4 py-3 font-semibold">Offre</th>
                <th scope="col" className="px-4 py-3 font-semibold">Montant</th>
                <th scope="col" className="px-4 py-3 font-semibold">Statut</th>
                <th scope="col" className="px-4 py-3 font-semibold">Prochaine échéance</th>
                <th scope="col" className="px-4 py-3 font-semibold">Gestion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {subscriptions.map((subscription) => {
                const hasStripeSubscription = Boolean(subscription.subscription_id)
                const canManage = hasStripeSubscription && subscription.is_current && ["active", "trialing", "past_due"].includes(subscription.status) && Boolean(process.env.STRIPE_SECRET_KEY)
                const dashboardUrl = hasStripeSubscription
                  ? `${stripeDashboardBase}/subscriptions/${encodeURIComponent(subscription.subscription_id!)}`
                  : subscription.customer_id
                    ? `${stripeDashboardBase}/customers/${encodeURIComponent(subscription.customer_id)}`
                    : null
                return (
                  <tr key={subscription.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-100">{subscription.display_name}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">{subscription.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-200">{planNames[subscription.plan_id] ?? subscription.plan_id}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">{formatInterval(subscription.interval, subscription.interval_count)}</p>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-200">
                      {subscription.amount === null ? "—" : formatMoney(subscription.amount, subscription.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusStyle(subscription.status)}`}>{statusLabel(subscription.status)}</span>
                      {subscription.cancel_at_period_end && <p className="mt-1.5 text-[10px] text-amber-200">Résiliation programmée</p>}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {subscription.current_period_end?.toLocaleDateString("fr-FR") ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {canManage && (
                          <SubscriptionControl
                            subscriptionId={subscription.subscription_id!}
                            cancelAtPeriodEnd={subscription.cancel_at_period_end}
                          />
                        )}
                        {dashboardUrl && (
                          <a href={dashboardUrl} target="_blank" rel="noreferrer" aria-label="Ouvrir dans Stripe" className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-white/[0.06] hover:text-white">
                            <ExternalLink className="size-3.5" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {!subscriptions.length && <p className="px-5 py-10 text-center text-sm text-muted-foreground">Aucun abonnement ne correspond aux filtres.</p>}
        </div>
        {pageCount > 1 && (
          <nav aria-label="Pagination des abonnements" className="flex items-center justify-end gap-3 border-t border-white/[0.08] p-4">
            <Button asChild size="sm" variant="outline" disabled={page <= 1}><Link href={pageHref(page - 1)}>Précédent</Link></Button>
            <span className="text-xs text-muted-foreground">Page {page} / {pageCount}</span>
            <Button asChild size="sm" variant="outline" disabled={page >= pageCount}><Link href={pageHref(page + 1)}>Suivant</Link></Button>
          </nav>
        )}
      </section>
    </div>
  )
}

function MetricCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <article className="rounded-xl border border-white/10 bg-card/80 p-5">
      <div className="flex items-center justify-between text-sm text-muted-foreground">{label}{icon}</div>
      <p className="mt-3 text-3xl font-black text-white">{value.toLocaleString("fr-FR")}</p>
    </article>
  )
}

function StatusRow({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.015] px-3 py-2.5">
      <span className="flex items-center gap-2 text-xs text-slate-300"><span className={`size-2 rounded-full ${tone}`} />{label}</span>
      <span className="text-sm font-bold text-white">{value.toLocaleString("fr-FR")}</span>
    </div>
  )
}
