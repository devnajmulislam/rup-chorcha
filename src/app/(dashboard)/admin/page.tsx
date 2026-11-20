import type { Metadata } from "next"
import Link from "next/link"
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
import { buttonVariants } from "@/components/ui/button"
import { getAdminOverview, type AdminOverview } from "@/lib/admin"
import { requireRole } from "@/lib/session"
import { cn } from "cn"

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "RupChorcha staff dashboard.",
}

export default async function AdminDashboardPage() {
  await requireRole("admin")

  let overview: AdminOverview | null = null

  try {
    overview = await getAdminOverview()
  } catch {
    overview = null
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

      {overview === null ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl bg-destructive/10 px-3.5 py-3 text-sm text-destructive"
        >
          <TriangleAlert
            className="mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />
          We could not load the salon overview right now. Refresh the page to try
          again.
        </p>
      ) : null}

      <section aria-labelledby="admin-overview-heading" className="flex flex-col gap-4">
        <h2 id="admin-overview-heading" className="sr-only">
          Salon overview
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            label="Total registered customers"
            value={overview?.totalCustomers ?? 0}
            icon={Users}
          />
          <StatCard
            label="Total active services"
            value={overview?.activeServices ?? 0}
            icon={Scissors}
          />
          <StatCard
            label="Total appointment requests"
            value={overview?.totalAppointments ?? 0}
            icon={CalendarDays}
          />
          <StatCard
            label="Pending appointments"
            value={overview?.pendingAppointments ?? 0}
            icon={Clock3}
            tone="pending"
          />
          <StatCard
            label="Confirmed appointments"
            value={overview?.confirmedAppointments ?? 0}
            icon={CircleCheck}
            tone="confirmed"
          />
          <StatCard
            label="Total successful payments"
            value={overview?.successfulPayments ?? 0}
            icon={CircleDollarSign}
            tone="confirmed"
            description="Paid transactions recorded by the payment flow."
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
