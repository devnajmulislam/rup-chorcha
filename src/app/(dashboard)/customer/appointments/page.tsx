import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { TriangleAlert } from "lucide-react"

import { CustomerAppointmentsView } from "@/components/dashboard/CustomerAppointmentsView"
import { PageHeader } from "@/components/shared/PageHeader"
import { RefreshRetryButton } from "@/components/shared/RefreshRetryButton"
import { buttonVariants } from "@/components/ui/button"
import {
  fetchCustomerDashboard,
  fetchMyAppointments,
  fetchMyTransactions,
} from "@/lib/backend-api"
import type {
  AppointmentStatus,
  PaginationMeta,
  TransactionCounts,
  TransactionStatus,
} from "@/lib/dashboard-types"
import { requireRole } from "@/lib/session"
import { cn } from "cn"

export const metadata: Metadata = {
  title: "My Appointments",
  description:
    "Every appointment request and Stripe payment record submitted under your RupChorcha account.",
}

export const dynamic = "force-dynamic"

const VALID_APPOINTMENT_STATUSES = new Set<AppointmentStatus>([
  "pending",
  "confirmed",
  "cancelled",
])

const VALID_TRANSACTION_STATUSES = new Set<TransactionStatus>([
  "pending",
  "paid",
  "failed",
])

const EMPTY_PAGINATION_META: PaginationMeta = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false,
}

const EMPTY_TRANSACTION_COUNTS: TransactionCounts = {
  all: 0,
  paid: 0,
  failed: 0,
  pending: 0,
}

function singleParam(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? ""
}

function parsePageParam(raw: string): number {
  const num = Number(raw)
  return Number.isInteger(num) && num > 0 ? Math.min(num, 10_000) : 1
}

export default async function CustomerAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string | string[]
    page?: string | string[]
    tab?: string | string[]
    txStatus?: string | string[]
    txPage?: string | string[]
  }>
}) {
  const session = await requireRole("customer")
  const resolvedParams = await searchParams

  const rawStatus = singleParam(resolvedParams.status).toLowerCase()
  const statusFilter: AppointmentStatus | undefined =
    VALID_APPOINTMENT_STATUSES.has(rawStatus as AppointmentStatus)
      ? (rawStatus as AppointmentStatus)
      : undefined
  const activeFilter: "all" | AppointmentStatus = statusFilter ?? "all"
  const page = parsePageParam(singleParam(resolvedParams.page))

  const rawTab = singleParam(resolvedParams.tab).toLowerCase()
  const activeTab: "appointments" | "payments" =
    rawTab === "payments" ? "payments" : "appointments"

  const rawTxStatus = singleParam(resolvedParams.txStatus).toLowerCase()
  const txStatusFilter: TransactionStatus | undefined =
    VALID_TRANSACTION_STATUSES.has(rawTxStatus as TransactionStatus)
      ? (rawTxStatus as TransactionStatus)
      : undefined
  const activeTxFilter: "all" | TransactionStatus = txStatusFilter ?? "all"
  const txPage = parsePageParam(singleParam(resolvedParams.txPage))

  const [dashboardRes, appointmentsRes, transactionsRes] = await Promise.all([
    fetchCustomerDashboard(session.accessToken),
    fetchMyAppointments(session.accessToken, {
      status: statusFilter,
      page,
      limit: 10,
    }),
    fetchMyTransactions(session.accessToken, {
      status: txStatusFilter,
      page: txPage,
      limit: 10,
    }),
  ])

  if (
    (!dashboardRes.ok && dashboardRes.kind === "blocked") ||
    (!appointmentsRes.ok && appointmentsRes.kind === "blocked") ||
    (!transactionsRes.ok && transactionsRes.kind === "blocked")
  ) {
    redirect("/sign-in?blocked=1")
  }

  if (
    (!dashboardRes.ok && dashboardRes.kind === "unauthorized") ||
    (!appointmentsRes.ok && appointmentsRes.kind === "unauthorized") ||
    (!transactionsRes.ok && transactionsRes.kind === "unauthorized")
  ) {
    redirect("/sign-in?redirect=%2Fcustomer%2Fappointments")
  }

  const errorMessage = !appointmentsRes.ok
    ? appointmentsRes.message
    : !dashboardRes.ok
      ? dashboardRes.message
      : null

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Your bookings"
        title="My appointments"
        description="Track your salon appointment requests, cancel pending bookings, and pay for confirmed appointments via Stripe Checkout."
        actions={
          <Link
            href="/services"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-10 rounded-full border-border bg-transparent px-5 text-sm hover:bg-blush hover:text-plum"
            )}
          >
            Book a service
          </Link>
        }
      />

      {errorMessage || !appointmentsRes.ok || !dashboardRes.ok ? (
        <div
          role="alert"
          className="flex flex-col items-start gap-4 rounded-2xl border border-destructive/25 bg-destructive/10 p-5 text-sm text-destructive"
        >
          <p className="flex items-start gap-2">
            <TriangleAlert
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            <span>
              {errorMessage ||
                "We could not load your appointments right now. Refresh the page to try again."}
            </span>
          </p>
          <RefreshRetryButton className="h-9 rounded-full border-destructive/30 bg-card px-4 text-xs text-foreground hover:bg-blush" />
        </div>
      ) : (
        <CustomerAppointmentsView
          appointments={appointmentsRes.data.items}
          meta={appointmentsRes.data.meta}
          counts={{
            all: dashboardRes.data.stats.totalAppointments,
            pending: dashboardRes.data.stats.pendingAppointments,
            confirmed: dashboardRes.data.stats.confirmedAppointments,
            cancelled: dashboardRes.data.stats.cancelledAppointments,
          }}
          activeFilter={activeFilter}
          activeTab={activeTab}
          transactions={transactionsRes.ok ? transactionsRes.data.items : []}
          transactionsMeta={
            transactionsRes.ok
              ? transactionsRes.data.meta
              : EMPTY_PAGINATION_META
          }
          transactionsCounts={
            transactionsRes.ok
              ? transactionsRes.data.counts
              : EMPTY_TRANSACTION_COUNTS
          }
          activeTxFilter={activeTxFilter}
          transactionsError={
            transactionsRes.ok ? null : transactionsRes.message
          }
        />
      )}
    </div>
  )
}
