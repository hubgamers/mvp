import Link from "next/link"
import { ArrowLeft, ChevronLeft, ChevronRight, Database, Search } from "lucide-react"
import { Prisma } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { requireAdmin } from "@/lib/admin"
import { prisma } from "@/lib/prisma"

export const metadata = { title: "Tables · Administration · HubGamers" }

const pageSize = 25
const maskedColumn = /(token|secret|password|api[_-]?key|authorization|stripe_metadata|checkout_metadata)/i

type TableInfo = { table_schema: string; table_name: string }
type ColumnInfo = { column_name: string; data_type: string; is_primary: boolean }
type TableRow = Record<string, string | null>

function quoteIdentifier(identifier: string) {
  return `"${identifier.replaceAll('"', '""')}"`
}

function getPage(value: string | undefined) {
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 1
}

function getSingleParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined
}

function buildPageHref(schema: string, table: string, page: number, query: string) {
  const params = new URLSearchParams({ table: `${schema}.${table}`, page: String(page) })
  if (query) params.set("q", query)
  return `/dashboard/admin/database?${params.toString()}`
}

export default async function AdminDatabasePage({
  searchParams,
}: {
  searchParams: Promise<{ table?: string | string[]; q?: string | string[]; page?: string | string[] }>
}) {
  await requireAdmin()
  const params = await searchParams
  const query = (getSingleParam(params.q) ?? "").trim().slice(0, 100)
  const requestedTable = getSingleParam(params.table)

  const tables = await prisma.$queryRaw<TableInfo[]>`
    SELECT table_schema, table_name
    FROM information_schema.tables
    WHERE table_schema IN ('public', 'admin')
      AND table_type = 'BASE TABLE'
    ORDER BY table_schema, table_name
  `

  const selectedTable = tables.find(
    (table) => `${table.table_schema}.${table.table_name}` === requestedTable,
  )

  let columns: ColumnInfo[] = []
  let rows: TableRow[] = []
  let totalRows = 0
  let currentPage = 1
  let pageCount = 0

  if (selectedTable) {
    columns = await prisma.$queryRaw<ColumnInfo[]>`
      SELECT c.column_name, c.data_type,
        EXISTS (
          SELECT 1
          FROM information_schema.table_constraints AS tc
          JOIN information_schema.key_column_usage AS kcu
            ON kcu.constraint_catalog = tc.constraint_catalog
            AND kcu.constraint_schema = tc.constraint_schema
            AND kcu.constraint_name = tc.constraint_name
          WHERE tc.constraint_type = 'PRIMARY KEY'
            AND tc.table_schema = c.table_schema
            AND tc.table_name = c.table_name
            AND kcu.column_name = c.column_name
        ) AS is_primary
      FROM information_schema.columns AS c
      WHERE c.table_schema = ${selectedTable.table_schema}
        AND c.table_name = ${selectedTable.table_name}
      ORDER BY c.ordinal_position
    `

    const searchableColumns = columns.filter(
      (column) => !maskedColumn.test(column.column_name),
    )
    const where =
      query && searchableColumns.length
        ? Prisma.sql`WHERE (${Prisma.join(
            searchableColumns.map(
              (column) =>
                Prisma.sql`${Prisma.raw(quoteIdentifier(column.column_name))}::text ILIKE ${`%${query}%`}`,
            ),
            " OR ",
          )})`
        : Prisma.empty
    const qualifiedTable = `${quoteIdentifier(selectedTable.table_schema)}.${quoteIdentifier(selectedTable.table_name)}`
    const counts = await prisma.$queryRaw<Array<{ count: bigint }>>(
      Prisma.sql`SELECT count(*) AS count FROM ${Prisma.raw(qualifiedTable)} ${where}`,
    )
    totalRows = Number(counts[0]?.count ?? 0)
    pageCount = Math.ceil(totalRows / pageSize)
    currentPage = Math.min(getPage(getSingleParam(params.page)), Math.max(pageCount, 1))

    if (totalRows) {
      const selectedColumns = columns.map((column) =>
        maskedColumn.test(column.column_name)
          ? Prisma.sql`'[masqué]'::text AS ${Prisma.raw(quoteIdentifier(column.column_name))}`
          : Prisma.sql`${Prisma.raw(quoteIdentifier(column.column_name))}::text AS ${Prisma.raw(quoteIdentifier(column.column_name))}`,
      )
      const primaryColumns = columns
        .filter((column) => column.is_primary)
        .map((column) => quoteIdentifier(column.column_name))
      const orderBy = primaryColumns.length
        ? Prisma.raw(`ORDER BY ${primaryColumns.join(", ")}`)
        : Prisma.empty

      rows = await prisma.$queryRaw<TableRow[]>(
        Prisma.sql`
          SELECT ${Prisma.join(selectedColumns)}
          FROM ${Prisma.raw(qualifiedTable)}
          ${where}
          ${orderBy}
          LIMIT ${pageSize}
          OFFSET ${(currentPage - 1) * pageSize}
        `,
      )
    }
  }

  const tableValue = selectedTable
    ? `${selectedTable.table_schema}.${selectedTable.table_name}`
    : ""

  return (
    <div className="mx-auto flex w-full max-w-[96rem] flex-col gap-7 p-6 lg:p-8">
      <header>
        <Link href="/dashboard/admin" className="mb-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-cyan-300">
          <ArrowLeft className="size-3.5" /> Administration
        </Link>
        <h1 className="text-3xl font-black tracking-tight text-white">Tables de données</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Exploration paginée des tables applicatives des schémas public et admin. Consultation uniquement.
        </p>
      </header>

      <form method="get" action="/dashboard/admin/database" className="grid gap-3 rounded-xl border border-white/10 bg-card/80 p-4 sm:grid-cols-[minmax(220px,1fr)_minmax(220px,2fr)_auto]">
        <label className="grid gap-1.5 text-xs font-medium text-slate-300">
          Table
          <select
            name="table"
            defaultValue={tableValue}
            className="h-9 w-full rounded-lg border border-input bg-input px-3 text-sm text-foreground"
          >
            <option value="">Choisir une table…</option>
            {tables.map((table) => (
              <option key={`${table.table_schema}.${table.table_name}`} value={`${table.table_schema}.${table.table_name}`}>
                {table.table_schema}.{table.table_name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-xs font-medium text-slate-300">
          Recherche dans les colonnes
          <Input name="q" defaultValue={query} maxLength={100} placeholder="Filtrer les résultats de la table" />
        </label>
        <Button type="submit" className="self-end"><Search className="size-4" /> Afficher</Button>
      </form>

      {!selectedTable ? (
        <div className="rounded-xl border border-dashed border-white/10 p-12 text-center">
          <Database className="mx-auto size-8 text-cyan-300" />
          <p className="mt-3 text-sm font-medium text-white">Sélectionnez une table pour consulter ses données.</p>
          <p className="mt-1 text-xs text-muted-foreground">{tables.length} tables disponibles dans les schémas applicatifs.</p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <p className="text-slate-200">
              <span className="font-semibold">{selectedTable.table_schema}.{selectedTable.table_name}</span>
              <span className="ml-2 text-xs text-muted-foreground">{totalRows.toLocaleString("fr-FR")} lignes · {columns.length} colonnes</span>
            </p>
            {pageCount > 1 && (
              <nav aria-label="Pagination des résultats" className="flex items-center gap-2">
                <Button asChild size="sm" variant="outline" disabled={currentPage <= 1}>
                  <Link href={buildPageHref(selectedTable.table_schema, selectedTable.table_name, currentPage - 1, query)} aria-label="Page précédente">
                    <ChevronLeft className="size-4" /> Précédent
                  </Link>
                </Button>
                <span className="text-xs text-muted-foreground">Page {currentPage} / {pageCount}</span>
                <Button asChild size="sm" variant="outline" disabled={currentPage >= pageCount}>
                  <Link href={buildPageHref(selectedTable.table_schema, selectedTable.table_name, currentPage + 1, query)} aria-label="Page suivante">
                    Suivant <ChevronRight className="size-4" />
                  </Link>
                </Button>
              </nav>
            )}
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/10 bg-card/80">
            {rows.length ? (
              <table className="w-full min-w-max border-collapse text-left text-xs">
                <thead className="bg-white/[0.04] text-[11px] uppercase tracking-wide text-slate-300">
                  <tr>{columns.map((column) => (
                    <th key={column.column_name} scope="col" className="whitespace-nowrap border-b border-white/10 px-3 py-3 font-semibold">
                      {column.is_primary && <span className="mr-1 text-cyan-300" title="Clé primaire">◆</span>}
                      {column.column_name}
                      <span className="ml-1.5 font-normal normal-case text-slate-500">{column.data_type}</span>
                    </th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {rows.map((row, rowIndex) => (
                    <tr key={`${currentPage}-${rowIndex}`} className="hover:bg-white/[0.025]">
                      {columns.map((column) => (
                        <td key={column.column_name} title={row[column.column_name] ?? "NULL"} className="max-w-72 truncate px-3 py-2.5 font-mono text-[11px] text-slate-300">
                          {row[column.column_name] ?? <span className="text-slate-600">NULL</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="px-5 py-12 text-center text-sm text-muted-foreground">Aucune ligne ne correspond à cette recherche.</p>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Les colonnes de type clé, secret ou métadonnées Stripe sont masquées. Les tables des schémas internes de Supabase ne sont pas incluses.
          </p>
        </>
      )}
    </div>
  )
}
