"use client"

import * as React from "react"
import { Info, ReceiptText, Search } from "lucide-react"

import { EmptyState } from "@/components/shared/EmptyState"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { AdminTransaction, TransactionStatus } from "@/lib/dashboard-types"
import {
  formatCurrency,
  formatSalonDate,
  formatSalonDateTime,
} from "@/lib/format"
import { cn } from "cn"

type TransactionFilter = "all" | TransactionStatus

const TRANSACTION_FILTERS: { value: TransactionFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "failed", label: "Failed" },
]

function shortReference(sessionId: string) {
  if (sessionId.length <= 18) {
    return sessionId
  }

  return `…${sessionId.slice(-12)}`
}

type AdminTransactionsProps = {
  transactions: AdminTransaction[]
}

function AdminTransactions({ transactions }: AdminTransactionsProps) {
  const [statusFilter, setStatusFilter] =
    React.useState<TransactionFilter>("all")
  const [search, setSearch] = React.useState("")

  const counts: Record<TransactionFilter, number> = {
    all: transactions.length,
    paid: transactions.filter((tx) => tx.status === "paid").length,
    failed: transactions.filter((tx) => tx.status === "failed").length,
  }

  const normalizedQuery = search.trim().toLowerCase()
  const filteredTransactions = transactions.filter((tx) => {
    if (statusFilter !== "all" && tx.status !== statusFilter) {
      return false
    }

    if (normalizedQuery) {
      const matches =
        tx.customerName.toLowerCase().includes(normalizedQuery) ||
        tx.customerEmail.toLowerCase().includes(normalizedQuery) ||
        tx.serviceName.toLowerCase().includes(normalizedQuery) ||
        tx.stripeSessionId.toLowerCase().includes(normalizedQuery)

      if (!matches) {
        return false
      }
    }

    return true
  })

  return (
    <div className="flex flex-col gap-5">
      <p className="flex items-start gap-2.5 rounded-2xl border border-border/70 bg-blush/40 px-4 py-3 text-sm text-plum">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        <span>
          Payment transactions are read-only and updated solely by verified
          Stripe webhook events. Unsuccessful payments cannot be marked paid
          manually.
        </span>
      </p>

      {transactions.length > 0 ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-4 lg:flex-row lg:items-center lg:justify-between">
          <div
            role="group"
            aria-label="Filter transactions by payment status"
            className="flex flex-wrap items-center gap-2"
          >
            {TRANSACTION_FILTERS.map((item) => {
              const active = statusFilter === item.value

              return (
                <Button
                  key={item.value}
                  type="button"
                  size="sm"
                  variant={active ? "default" : "outline"}
                  aria-pressed={active}
                  onClick={() => setStatusFilter(item.value)}
                  className={cn(
                    "rounded-full px-4",
                    !active &&
                      "border-border bg-transparent text-foreground hover:bg-blush hover:text-plum"
                  )}
                >
                  {item.label} ({counts[item.value]})
                </Button>
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
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-10 rounded-xl pl-9"
            />
          </div>
        </div>
      ) : null}

      {transactions.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title="No payment transactions yet"
          description="Stripe checkout completions and failed attempts will appear here automatically once payments are processed."
        />
      ) : filteredTransactions.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title="No matching transactions"
          description="No transactions match the current search or payment status filter."
        >
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setStatusFilter("all")
              setSearch("")
            }}
            className="h-10 rounded-full border-border bg-transparent px-5 text-sm hover:bg-blush hover:text-plum"
          >
            Reset filters
          </Button>
        </EmptyState>
      ) : (
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
                  Appointment date
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
              {filteredTransactions.map((tx) => (
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
                    {tx.appointmentDate
                      ? formatSalonDate(tx.appointmentDate)
                      : "—"}
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
                    {formatSalonDateTime(tx.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

export { AdminTransactions }
export type { AdminTransactionsProps }
