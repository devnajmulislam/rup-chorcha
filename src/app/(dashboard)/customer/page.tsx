import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import {
  ArrowRight,
  CalendarDays,
  CircleCheck,
  CircleX,
  Clock3,
  TriangleAlert,
} from "lucide-react"

import { StatCard } from "@/components/dashboard/StatCard"
import { EmptyState } from "@/components/shared/EmptyState"
import { PageHeader } from "@/components/shared/PageHeader"
import { RefreshRetryButton } from "@/components/shared/RefreshRetryButton"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { buttonVariants } from "@/components/ui/button"
import { fetchCustomerDashboard } from "@/lib/backend-api"
import {
  formatCurrency,
  formatSalonDate,
  formatTimeSlot,
} from "@/lib/format"
import { requireRole } from "@/lib/session"
import { cn } from "cn"

export const metadata: Metadata = {
  title: "Customer Dashboard",
  description: "Your RupChorcha appointment overview.",
}

export const dynamic = "force-dynamic"

export default async function CustomerDashboardPage() {
  const session = await requireRole("customer")
  const dashboardResult = await fetchCustomerDashboard(session.accessToken)

  if (!dashboardResult.ok) {
    if (dashboardResult.kind === "blocked") {
      redirect("/sign-in?blocked=1")
    }
    if (dashboardResult.kind === "unauthorized") {
      redirect("/sign-in?redirect=%2Fcustomer")
    }

    return (
      <div className="flex flex-col gap-8">
        <PageHeader
          eyebrow="Customer dashboard"
          title="Welcome back"
          description="Your appointment requests, confirmations, and payment status at a glance."
          actions={
            <Link
              href="/services"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-10 rounded-full px-5 text-sm"
              )}
            >
              Browse services
            </Link>
          }
        />

        <div
          role="alert"
          className="flex flex-col items-start gap-4 rounded-2xl border border-destructive/25 bg-destructive/10 p-5 text-sm text-destructive"
        >
          <p className="flex items-start gap-2">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{dashboardResult.message}</span>
          </p>
          <RefreshRetryButton className="h-9 rounded-full border-destructive/30 bg-card px-4 text-xs text-foreground hover:bg-blush" />
        </div>
      </div>
    )
  }

  const { profile, stats, upcomingAppointments, recentAppointments } =
    dashboardResult.data
  const displayAppointments =
    upcomingAppointments.length > 0 ? upcomingAppointments : recentAppointments
  const firstName = profile.name?.trim().split(/\s+/)[0] ?? ""

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Customer dashboard"
        title={firstName ? `Welcome back, ${firstName}` : "Welcome back"}
        description="Your appointment requests, confirmations, and payment status at a glance."
        actions={
          <Link
            href="/services"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-10 rounded-full px-5 text-sm"
            )}
          >
            Browse services
          </Link>
        }
      />

      <section aria-labelledby="overview-heading" className="flex flex-col gap-4">
        <h2 id="overview-heading" className="sr-only">
          Appointment overview
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total appointment requests"
            value={stats.totalAppointments}
            icon={CalendarDays}
          />
          <StatCard
            label="Pending appointments"
            value={stats.pendingAppointments}
            icon={Clock3}
            tone="pending"
          />
          <StatCard
            label="Confirmed appointments"
            value={stats.confirmedAppointments}
            icon={CircleCheck}
            tone="confirmed"
          />
          <StatCard
            label="Cancelled appointments"
            value={stats.cancelledAppointments}
            icon={CircleX}
            tone="cancelled"
          />
        </div>
      </section>

      <section
        aria-labelledby="recent-appointments-heading"
        className="flex flex-col gap-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2
            id="recent-appointments-heading"
            className="font-heading text-2xl font-medium text-foreground"
          >
            {upcomingAppointments.length > 0
              ? "Upcoming appointments"
              : "Recent appointments"}
          </h2>
          {stats.totalAppointments > 0 ? (
            <Link
              href="/customer/appointments"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              View all appointments
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          ) : null}
        </div>

        {stats.totalAppointments === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No appointments yet"
            description="Explore the RupChorcha menu and request your first salon visit whenever you are ready."
          >
            <Link
              href="/services"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-10 rounded-full px-5 text-sm"
              )}
            >
              Browse services
            </Link>
          </EmptyState>
        ) : (
          <ul className="divide-y divide-border/70 rounded-2xl border border-border/70 bg-card shadow-[0_18px_40px_-34px_rgba(58,24,48,0.4)]">
            {displayAppointments.slice(0, 5).map((appointment) => (
              <li
                key={appointment.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
              >
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-heading text-xl leading-tight font-medium text-foreground">
                      {appointment.serviceName}
                    </p>
                    <span className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
                      {appointment.serviceCategory}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatSalonDate(appointment.appointmentDate)} ·{" "}
                    {formatTimeSlot(appointment.timeSlot)} ·{" "}
                    {formatCurrency(appointment.servicePrice)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={appointment.status} />
                  <StatusBadge status={appointment.paymentStatus} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
