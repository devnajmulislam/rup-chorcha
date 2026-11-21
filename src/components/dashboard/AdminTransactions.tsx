"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Info, ReceiptText, Search } from "lucide-react"

import { DashboardPagination } from "@/components/dashboard/DashboardPagination"
import { EmptyState } from "@/components/shared/EmptyState"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type {
  AdminTransaction,
  PaginationMeta,
  TransactionCounts,
  TransactionStatus,
} from "@/lib/dashboard-types"
import {
  formatCurrency,
  formatSalonDate,
  formatSalonDateTime,
  formatTimeSlot,
} from "@/lib/format"
import { cn } from "cn"

type TransactionFilter = "all" | TransactionStatus

const TRANSACTION_FILTERS: { value: TransactionFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
]

function buildFilterHref({
  status,
  search,
  page,
}: {
  status: TransactionFilter
  search?: string
  page?: number
}): string {
  const query = new URLSearchParams()
  if (status !== "all") {
    query.set("status", status)
  }
  if (search?.trim()) {
    query.set("search", search.trim())
  }
  if (page && page > 1) {
    query.set("page", String(page))
  }
  const serialized = query.toString()
  return serialized ? `/admin/transactions?${serialized}` : "/admin/transactions"
}

function shortReference(sessionId: string) {
  if (!sessionId) {
    return "—"
  }
  if (sessionId.length <= 18) {
    return sessionId
  }

  return `…${sessionId.slice(-12)}`
}

type AdminTransactionsProps = {
  transactions: AdminTransaction[]
  meta: PaginationMeta
  counts: TransactionCounts
  totalPaidRevenueCents: number
  activeStatus: TransactionFilter
  initialSearch: string
}

function AdminTransactions({
  transactions,
  meta,
  counts,
  totalPaidRevenueCents,
  activeStatus,
  initialSearch,
}: AdminTransactionsProps) {
  const router = useRouter()
  const [searchInput, setSearchInput] = React.useState(initialSearch)
  const [prevSearchProp, setPrevSearchProp] = React.useState(initialSearch)

  if (initialSearch !== prevSearchProp) {
    setPrevSearchProp(initialSearch)
    setSearchInput(initialSearch)
  }

  React.useEffect(() => {
    const trimmedInput = searchInput.trim()
    const trimmedCurrent = initialSearch.trim()
    if (trimmedInput === trimmedCurrent) {
      return
    }

    const timer = setTimeout(() => {
      router.replace(
        buildFilterHref({
          status: activeStatus,
          search: trimmedInput,
          page: 1,
        }),
        { scroll: false }
      )
    }, 350)

    return () => clearTimeout(timer)
  }, [searchInput, initialSearch, activeStatus, router])

  const hasFiltersActive =
    activeStatus !== "all" || Boolean(initialSearch.trim())

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2 rounded-2xl border border-border/70 bg-blush/40 px-4 py-3 text-sm text-plum sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-2.5">
          <Info
            className="mt-0.5 size-4 shrink-0 text-primary"
            aria-hidden="true"
          />
          <span>
            Payment transactions are read-only and updated solely by verified
            Stripe webhook events. Unsuccessful payments cannot be marked paid
            manually.
          </span>
        </p>
        {counts.paid > 0 ? (
          <p className="shrink-0 font-medium text-plum">
            Verified revenue: {formatCurrency(totalPaidRevenueCents)}
          </p>
        ) : null}
      </div>

      {counts.all > 0 || hasFiltersActive ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-4 lg:flex-row lg:items-center lg:justify-between">
          <div
            role="group"
            aria-label="Filter transactions by payment status"
            className="flex flex-wrap items-center gap-2"
          >
            {TRANSACTION_FILTERS.map((item) => {
              const active = activeStatus === item.value

              return (
                <Link
                  key={item.value}
                  href={buildFilterHref({
                    status: item.value,
                    search: initialSearch,
                    page: 1,
                  })}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    buttonVariants({
                      size: "sm",
                      variant: active ? "default" : "outline",
                    }),
                    "rounded-full px-4",
                    !active &&
                      "border-border bg-transparent text-foreground hover:bg-blush hover:text-plum"
                  )}
                >
                  {item.label} ({counts[item.value]})
                </Link>
              )
            })}
          </div>

          <div className="relative w-full lg:w-72">
            <label htmlFor="admin-transactions-search" className="sr-only">
              Search customer, service, or Stripe session
            </label>
            <Search
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="admin-transactions-search"
              type="search"
              placeholder="Search customer, service, or session…"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              maxLength={100}
              className="h-10 rounded-xl pl-9"
            />
          </div>
        </div>
      ) : null}

      {counts.all === 0 && !hasFiltersActive ? (
        <EmptyState
          icon={ReceiptText}
          title="No payment transactions yet"
          description="Stripe checkout sessions and verified webhook updates will appear here automatically once payments are initiated."
        />
      ) : transactions.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title="No matching transactions"
          description="No transactions match the current search or payment status filter."
        >
          <Link
            href="/admin/transactions"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-10 rounded-full border-border bg-transparent px-5 text-sm hover:bg-blush hover:text-plum"
            )}
          >
            Reset filters
          </Link>
        </EmptyState>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_18px_40px_-34px_rgba(58,24,48,0.4)]">
            <Table>
              <TableHeader className="bg-blush/35">
                <TableRow className="hover:bg-blush/35">
                  <TableHead className="px-4 py-3 text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                    Customer
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                    Related service
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                    Appointment
                  </TableHead>
                  <TableHead className="px-4 py-3 text-right text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                    Amount
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                    Currency
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                    Stripe session ID
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                    Payment status
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                    Transaction date
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id} className="hover:bg-blush/25">
                    <TableCell className="px-4 py-3.5">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">
                          {tx.customerName}
                        </p>
                        {tx.customerEmail ? (
                          <p className="text-xs text-muted-foreground">
                            {tx.customerEmail}
                          </p>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3.5 text-foreground">
                      {tx.serviceName}
                    </TableCell>
                    <TableCell className="px-4 py-3.5 text-muted-foreground">
                      {tx.appointmentDate ? (
                        <>
                          {formatSalonDate(tx.appointmentDate)}
                          {tx.timeSlot ? ` · ${formatTimeSlot(tx.timeSlot)}` : ""}
                        </>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3.5 text-right font-medium text-plum tabular-nums">
                      {formatCurrency(tx.amount)}
                    </TableCell>
                    <TableCell className="px-4 py-3.5 text-xs font-medium text-muted-foreground uppercase">
                      {tx.currency}
                    </TableCell>
                    <TableCell
                      className="px-4 py-3.5 font-mono text-xs text-muted-foreground"
                      title={tx.stripeSessionId}
                    >
                      {shortReference(tx.stripeSessionId)}
                    </TableCell>
                    <TableCell className="px-4 py-3.5">
                      <StatusBadge status={tx.status} />
                    </TableCell>
                    <TableCell className="px-4 py-3.5 text-muted-foreground">
                      {tx.paidAt || tx.createdAt
                        ? formatSalonDateTime(tx.paidAt || tx.createdAt!)
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <DashboardPagination
            meta={meta}
            basePath="/admin/transactions"
            params={{
              ...(activeStatus !== "all" ? { status: activeStatus } : {}),
              ...(initialSearch.trim() ? { search: initialSearch.trim() } : {}),
            }}
          />
        </div>
      )}
    </div>
  )
}

export { AdminTransactions }
export type { AdminTransactionsProps }
