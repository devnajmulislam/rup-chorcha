import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { TriangleAlert } from "lucide-react"

import { AdminTransactions } from "@/components/dashboard/AdminTransactions"
import { PageHeader } from "@/components/shared/PageHeader"
import { RefreshRetryButton } from "@/components/shared/RefreshRetryButton"
import { fetchAdminTransactions } from "@/lib/backend-api"
import type { TransactionStatus } from "@/lib/dashboard-types"
import { requireRole } from "@/lib/session"

export const metadata: Metadata = {
  title: "Transactions",
  description:
    "Read-only log of RupChorcha Stripe checkout transactions and verified payment statuses.",
}

export const dynamic = "force-dynamic"

const VALID_STATUSES = new Set<TransactionStatus>([
  "pending",
  "paid",
  "failed",
])

function singleParam(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? ""
}

function parsePageParam(raw: string): number {
  const num = Number(raw)
  return Number.isInteger(num) && num > 0 ? Math.min(num, 10_000) : 1
}

export default async function AdminTransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string | string[]
    search?: string | string[]
    page?: string | string[]
  }>
}) {
  const session = await requireRole("admin")
  const resolved = await searchParams

  const rawStatus = singleParam(resolved.status).toLowerCase()
  const statusFilter: TransactionStatus | undefined = VALID_STATUSES.has(
    rawStatus as TransactionStatus
  )
    ? (rawStatus as TransactionStatus)
    : undefined
  const activeStatus: "all" | TransactionStatus = statusFilter ?? "all"
  const search = singleParam(resolved.search).slice(0, 100)
  const page = parsePageParam(singleParam(resolved.page))

  const result = await fetchAdminTransactions(session.accessToken, {
    status: statusFilter,
    search,
    page,
    limit: 10,
  })

  if (!result.ok) {
    if (result.kind === "blocked") {
      redirect("/sign-in?blocked=1")
    }
    if (result.kind === "unauthorized") {
      redirect("/sign-in?redirect=%2Fadmin%2Ftransactions")
    }

    return (
      <div className="flex flex-col gap-8">
        <PageHeader
          eyebrow="Payment ledger"
          title="Transactions"
          description="Read-only record of Stripe payment sessions across all customer appointments."
        />
        <div
          role="alert"
          className="flex flex-col items-start gap-4 rounded-2xl border border-destructive/25 bg-destructive/10 p-5 text-sm text-destructive"
        >
          <p className="flex items-start gap-2">
            <TriangleAlert
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            <span>{result.message}</span>
          </p>
          <RefreshRetryButton className="h-9 rounded-full border-destructive/30 bg-card px-4 text-xs text-foreground hover:bg-blush" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Payment ledger"
        title="Transactions"
        description="Read-only record of Stripe payment sessions across all customer appointments."
      />

      <AdminTransactions
        transactions={result.data.items}
        meta={result.data.meta}
        counts={result.data.counts}
        totalPaidRevenueCents={result.data.totalPaidRevenueCents}
        activeStatus={activeStatus}
        initialSearch={search}
      />
    </div>
  )
}
