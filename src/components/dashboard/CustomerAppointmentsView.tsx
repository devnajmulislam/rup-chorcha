"use client"

import * as React from "react"
import Link from "next/link"
import { CalendarDays, CalendarX, ReceiptText } from "lucide-react"

import { AppointmentCard } from "@/components/dashboard/AppointmentCard"
import { EmptyState } from "@/components/shared/EmptyState"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button, buttonVariants } from "@/components/ui/button"
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
  AppointmentStatus,
  CustomerAppointment,
  CustomerTransaction,
} from "@/lib/appointments"
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

type CustomerAppointmentsViewProps = {
  appointments: CustomerAppointment[]
  transactions: CustomerTransaction[]
}

function CustomerAppointmentsView({
  appointments,
  transactions,
}: CustomerAppointmentsViewProps) {
  const [filter, setFilter] = React.useState<StatusFilter>("all")

  const counts: Record<StatusFilter, number> = {
    all: appointments.length,
    pending: appointments.filter((item) => item.status === "pending").length,
    confirmed: appointments.filter((item) => item.status === "confirmed").length,
    cancelled: appointments.filter((item) => item.status === "cancelled").length,
  }

  const filteredAppointments =
    filter === "all"
      ? appointments
      : appointments.filter((item) => item.status === filter)

  return (
    <Tabs defaultValue="appointments" className="gap-6">
      <TabsList className="h-auto rounded-full border border-border/70 bg-card p-1">
        <TabsTrigger
          value="appointments"
          className="rounded-full px-4 py-1.5 text-sm data-active:bg-blush data-active:text-plum data-active:shadow-none"
        >
          <CalendarDays className="size-4" aria-hidden="true" />
          Appointments ({appointments.length})
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
        {appointments.length === 0 ? (
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
                const active = filter === item.value

                return (
                  <Button
                    key={item.value}
                    type="button"
                    size="sm"
                    variant={active ? "default" : "outline"}
                    aria-pressed={active}
                    onClick={() => setFilter(item.value)}
                    className={cn(
                      "rounded-full px-4",
                      !active &&
                        "border-border bg-card text-foreground hover:bg-blush hover:text-plum"
                    )}
                  >
                    {item.label} ({counts[item.value]})
                  </Button>
                )
              })}
            </div>

            {filteredAppointments.length === 0 ? (
              <EmptyState
                icon={CalendarX}
                title={`No ${filter} appointments`}
                description="No appointment requests match this status right now."
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFilter("all")}
                  className="h-10 rounded-full border-border bg-transparent px-5 text-sm hover:bg-blush hover:text-plum"
                >
                  Show all appointments
                </Button>
              </EmptyState>
            ) : (
              <div className="flex flex-col gap-4">
                {filteredAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                  />
                ))}
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
