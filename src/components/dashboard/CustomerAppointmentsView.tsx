"use client"

import Link from "next/link"
import { CalendarDays, CalendarX, ReceiptText } from "lucide-react"

import { AppointmentCard } from "@/components/dashboard/AppointmentCard"
import { DashboardPagination } from "@/components/dashboard/DashboardPagination"
import { EmptyState } from "@/components/shared/EmptyState"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { buttonVariants } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type {
  AdminAppointmentCounts,
  AppointmentStatus,
  CustomerAppointment,
  CustomerTransaction,
  PaginationMeta,
} from "@/lib/dashboard-types"
import {
  formatCurrency,
  formatSalonDate,
  formatSalonDateTime,
} from "@/lib/format"
import { cn } from "cn"

type StatusFilter = "all" | AppointmentStatus

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
]

function shortReference(sessionId: string) {
  if (sessionId.length <= 16) {
    return sessionId
  }

  return `…${sessionId.slice(-10)}`
}

function buildFilterHref(status: StatusFilter): string {
  return status === "all"
    ? "/customer/appointments"
    : `/customer/appointments?status=${status}`
}

type CustomerAppointmentsViewProps = {
  appointments: CustomerAppointment[]
  meta: PaginationMeta
  counts: AdminAppointmentCounts
  activeFilter: StatusFilter
  transactions: CustomerTransaction[]
}

function CustomerAppointmentsView({
  appointments,
  meta,
  counts,
  activeFilter,
  transactions,
}: CustomerAppointmentsViewProps) {
  return (
    <Tabs defaultValue="appointments" className="gap-6">
      <TabsList className="h-auto rounded-full border border-border/70 bg-card p-1">
        <TabsTrigger
          value="appointments"
          className="rounded-full px-4 py-1.5 text-sm data-active:bg-blush data-active:text-plum data-active:shadow-none"
        >
          <CalendarDays className="size-4" aria-hidden="true" />
          Appointments ({counts.all})
        </TabsTrigger>
        <TabsTrigger
          value="payments"
          className="rounded-full px-4 py-1.5 text-sm data-active:bg-blush data-active:text-plum data-active:shadow-none"
        >
          <ReceiptText className="size-4" aria-hidden="true" />
          Payments ({transactions.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="appointments" className="flex flex-col gap-5">
        {counts.all === 0 ? (
          <EmptyState
            icon={CalendarX}
            title="No appointment requests yet"
            description="Once you request a service, it will appear here with its date, time, price, and status."
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
          <>
            <div
              role="group"
              aria-label="Filter appointments by status"
              className="flex flex-wrap items-center gap-2"
            >
              {STATUS_FILTERS.map((item) => {
                const active = activeFilter === item.value

                return (
                  <Link
                    key={item.value}
                    href={buildFilterHref(item.value)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      buttonVariants({
                        size: "sm",
                        variant: active ? "default" : "outline",
                      }),
                      "rounded-full px-4",
                      !active &&
                        "border-border bg-card text-foreground hover:bg-blush hover:text-plum"
                    )}
                  >
                    {item.label} ({counts[item.value]})
                  </Link>
                )
              })}
            </div>

            {appointments.length === 0 ? (
              <EmptyState
                icon={CalendarX}
                title={
                  activeFilter === "all"
                    ? "No appointments on this page"
                    : `No ${activeFilter} appointments`
                }
                description="No appointment requests match this filter right now."
              >
                <Link
                  href="/customer/appointments"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "h-10 rounded-full border-border bg-transparent px-5 text-sm hover:bg-blush hover:text-plum"
                  )}
                >
                  Show all appointments
                </Link>
              </EmptyState>
            ) : (
              <div className="flex flex-col gap-4">
                {appointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                  />
                ))}
                <DashboardPagination
                  meta={meta}
                  basePath="/customer/appointments"
                  params={
                    activeFilter === "all" ? {} : { status: activeFilter }
                  }
                />
              </div>
            )}
          </>
        )}
      </TabsContent>

      <TabsContent value="payments">
        {transactions.length === 0 ? (
          <EmptyState
            icon={ReceiptText}
            title="No payment history yet"
            description="Payments for confirmed appointments will appear here once completed through Stripe checkout."
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_18px_40px_-34px_rgba(58,24,48,0.4)]">
            <Table>
              <TableHeader className="bg-blush/35">
                <TableRow className="hover:bg-blush/35">
                  <TableHead className="px-4 py-3 text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                    Service
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                    Appointment date
                  </TableHead>
                  <TableHead className="px-4 py-3 text-right text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                    Amount
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                    Session ref
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                    Status
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                    Transaction date
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id} className="hover:bg-blush/25">
                    <TableCell className="px-4 py-3.5 font-medium text-foreground">
                      {tx.serviceName}
                    </TableCell>
                    <TableCell className="px-4 py-3.5 text-muted-foreground">
                      {tx.appointmentDate
                        ? formatSalonDate(tx.appointmentDate)
                        : "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3.5 text-right font-medium text-plum tabular-nums">
                      {formatCurrency(tx.amount)} {tx.currency}
                    </TableCell>
                    <TableCell className="px-4 py-3.5 font-mono text-xs text-muted-foreground">
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
      </TabsContent>
    </Tabs>
  )
}

export { CustomerAppointmentsView }
export type { CustomerAppointmentsViewProps }
