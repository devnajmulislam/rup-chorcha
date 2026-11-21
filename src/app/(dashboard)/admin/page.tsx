import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import {
  CalendarDays,
  CircleCheck,
  CircleDollarSign,
  Clock3,
  Scissors,
  TriangleAlert,
  Users,
} from "lucide-react"

import { StatCard } from "@/components/dashboard/StatCard"
import { PageHeader } from "@/components/shared/PageHeader"
import { RefreshRetryButton } from "@/components/shared/RefreshRetryButton"
import { buttonVariants } from "@/components/ui/button"
import { fetchAdminDashboard } from "@/lib/backend-api"
import { formatCurrency } from "@/lib/format"
import { requireRole } from "@/lib/session"
import { cn } from "cn"

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "RupChorcha staff dashboard.",
}

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  const session = await requireRole("admin")
  const dashboardResult = await fetchAdminDashboard(session.accessToken)

  if (!dashboardResult.ok) {
    if (dashboardResult.kind === "blocked") {
      redirect("/sign-in?blocked=1")
    }
    if (dashboardResult.kind === "unauthorized") {
      redirect("/sign-in?redirect=%2Fadmin")
    }

    return (
      <div className="flex flex-col gap-8">
        <PageHeader
          eyebrow="Staff access"
          title="Admin overview"
          description="The health of the salon at a glance: customers, the active menu, appointment requests, and successful payments."
          actions={
            <Link
              href="/admin/services"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-10 rounded-full px-5 text-sm"
              )}
            >
              Manage services
            </Link>
          }
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
            <span>{dashboardResult.message}</span>
          </p>
          <RefreshRetryButton className="h-9 rounded-full border-destructive/30 bg-card px-4 text-xs text-foreground hover:bg-blush" />
        </div>
      </div>
    )
  }

  const { overview } = dashboardResult.data
  const paymentsDescription = overview.hasRecordedTransactions
    ? `${formatCurrency(overview.totalRevenueCents)} recorded across paid Stripe transactions.`
    : "No Stripe transaction records recorded yet."

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Staff access"
        title="Admin overview"
        description="The health of the salon at a glance: customers, the active menu, appointment requests, and successful payments."
        actions={
          <Link
            href="/admin/services"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-10 rounded-full px-5 text-sm"
            )}
          >
            Manage services
          </Link>
        }
      />

      <section aria-labelledby="admin-overview-heading" className="flex flex-col gap-4">
        <h2 id="admin-overview-heading" className="sr-only">
          Salon overview
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            label="Total registered customers"
            value={overview.totalCustomers}
            icon={Users}
            description={
              overview.blockedCustomers > 0
                ? `${overview.activeCustomers} active · ${overview.blockedCustomers} blocked`
                : undefined
            }
          />
          <StatCard
            label="Total active services"
            value={overview.activeServices}
            icon={Scissors}
            description={
              overview.inactiveServices > 0
                ? `${overview.totalServices} total (${overview.inactiveServices} inactive)`
                : undefined
            }
          />
          <StatCard
            label="Total appointment requests"
            value={overview.totalAppointments}
            icon={CalendarDays}
          />
          <StatCard
            label="Pending appointments"
            value={overview.pendingAppointments}
            icon={Clock3}
            tone="pending"
          />
          <StatCard
            label="Confirmed appointments"
            value={overview.confirmedAppointments}
            icon={CircleCheck}
            tone="confirmed"
          />
          <StatCard
            label="Total successful payments"
            value={overview.successfulPayments}
            icon={CircleDollarSign}
            tone="confirmed"
            description={paymentsDescription}
          />
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm leading-6 text-muted-foreground">
          <Link
            href="/admin/services"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Manage services
          </Link>
          <Link
            href="/admin/services/new"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Add service
          </Link>
          <Link
            href="/admin/services/update"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Update service
          </Link>
          <Link
            href="/admin/appointments"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Manage appointments
          </Link>
          <Link
            href="/admin/users"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Manage users
          </Link>
          <Link
            href="/admin/transactions"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            View transactions
          </Link>
        </div>
      </section>
    </div>
  )
}
