"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  CalendarDays,
  CalendarX,
  CircleCheck,
  Clock3,
  Eye,
  Loader2Icon,
  Mail,
  MessageSquare,
  Phone,
  ReceiptText,
  Search,
  UserRound,
  XCircle,
} from "lucide-react"

import {
  cancelAdminAppointmentAction,
  confirmAppointmentAction,
} from "@/app/(dashboard)/admin/appointments/actions"
import { EmptyState } from "@/components/shared/EmptyState"
import { StatusBadge } from "@/components/shared/StatusBadge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import type { AdminAppointment } from "@/lib/admin"
import type { AppointmentStatus } from "@/lib/appointments"
import {
  formatCurrency,
  formatSalonDate,
  formatSalonDateTime,
  formatTimeSlot,
} from "@/lib/format"
import { cn } from "cn"

type StatusFilter = "all" | AppointmentStatus

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
]

function DetailRow({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="text-sm text-foreground">{value}</dd>
    </div>
  )
}

type AdminAppointmentsProps = {
  appointments: AdminAppointment[]
}

function AdminAppointments({ appointments }: AdminAppointmentsProps) {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all")
  const [search, setSearch] = React.useState("")
  const [confirmingId, setConfirmingId] = React.useState<string | null>(null)
  const [cancelTarget, setCancelTarget] =
    React.useState<AdminAppointment | null>(null)
  const [cancelling, setCancelling] = React.useState(false)

  const counts: Record<StatusFilter, number> = {
    all: appointments.length,
    pending: appointments.filter((item) => item.status === "pending").length,
    confirmed: appointments.filter((item) => item.status === "confirmed").length,
    cancelled: appointments.filter((item) => item.status === "cancelled").length,
  }

  const normalizedQuery = search.trim().toLowerCase()
  const filteredAppointments = appointments.filter((item) => {
    if (statusFilter !== "all" && item.status !== statusFilter) {
      return false
    }

    if (normalizedQuery) {
      const matchesCustomer =
        item.customerName.toLowerCase().includes(normalizedQuery) ||
        item.customerEmail.toLowerCase().includes(normalizedQuery)
      const matchesService = item.serviceName
        .toLowerCase()
        .includes(normalizedQuery)

      if (!matchesCustomer && !matchesService) {
        return false
      }
    }

    return true
  })

  async function handleConfirm(appointment: AdminAppointment) {
    setConfirmingId(appointment.id)

    try {
      const result = await confirmAppointmentAction(appointment.id)

      if (!result.success) {
        toast.add({
          title: "Could not confirm appointment",
          description: result.message,
          type: "error",
        })
        return
      }

      toast.add({
        title: "Appointment confirmed",
        description: result.message,
        type: "success",
      })
      router.refresh()
    } catch {
      toast.add({
        title: "Could not confirm appointment",
        description: "We could not reach RupChorcha. Please try again.",
        type: "error",
      })
    } finally {
      setConfirmingId(null)
    }
  }

  async function handleCancel() {
    if (!cancelTarget) {
      return
    }

    setCancelling(true)

    try {
      const result = await cancelAdminAppointmentAction(cancelTarget.id)

      if (!result.success) {
        toast.add({
          title: "Could not cancel appointment",
          description: result.message,
          type: "error",
        })
        return
      }

      toast.add({
        title: "Appointment cancelled",
        description: `${cancelTarget.serviceName} for ${cancelTarget.customerName} has been cancelled.`,
        type: "success",
      })
      setCancelTarget(null)
      router.refresh()
    } catch {
      toast.add({
        title: "Could not cancel appointment",
        description: "We could not reach RupChorcha. Please try again.",
        type: "error",
      })
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {appointments.length > 0 ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-4 lg:flex-row lg:items-center lg:justify-between">
          <div
            role="group"
            aria-label="Filter appointments by status"
            className="flex flex-wrap items-center gap-2"
          >
            {STATUS_FILTERS.map((item) => {
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
            <label htmlFor="admin-appointments-search" className="sr-only">
              Search by customer or service
            </label>
            <Search
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="admin-appointments-search"
              type="search"
              placeholder="Search customer or service…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-10 rounded-xl pl-9"
            />
          </div>
        </div>
      ) : null}

      {appointments.length === 0 ? (
        <EmptyState
          icon={CalendarX}
          title="No appointment requests yet"
          description="Customer appointment requests will appear here as soon as bookings are submitted."
        />
      ) : filteredAppointments.length === 0 ? (
        <EmptyState
          icon={CalendarX}
          title="No matching appointments"
          description="No appointments match the current status or search filter."
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
        <ul className="flex flex-col gap-3">
          {filteredAppointments.map((appointment) => {
            const busy = confirmingId === appointment.id
            const canConfirm = appointment.status === "pending"
            const canCancel =
              appointment.status === "pending" ||
              appointment.status === "confirmed"

            return (
              <li
                key={appointment.id}
                className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-4 shadow-[0_18px_40px_-34px_rgba(58,24,48,0.4)] sm:p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-heading text-2xl leading-tight font-medium text-foreground">
                        {appointment.serviceName}
                      </h3>
                      <span className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
                        {appointment.serviceCategory}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-foreground">
                      <span className="inline-flex items-center gap-1.5 font-medium">
                        <UserRound
                          className="size-4 text-primary"
                          aria-hidden="true"
                        />
                        {appointment.customerName}
                      </span>
                      {appointment.customerEmail ? (
                        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                          <Mail
                            className="size-3.5 text-rose"
                            aria-hidden="true"
                          />
                          {appointment.customerEmail}
                        </span>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays
                          className="size-4 text-primary"
                          aria-hidden="true"
                        />
                        {formatSalonDate(appointment.appointmentDate)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3
                          className="size-4 text-primary"
                          aria-hidden="true"
                        />
                        {formatTimeSlot(appointment.timeSlot)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <ReceiptText
                          className="size-4 text-primary"
                          aria-hidden="true"
                        />
                        Requested {formatSalonDateTime(appointment.requestedAt)}
                      </span>
                    </div>

                    {appointment.message ? (
                      <p className="mt-1 inline-flex items-start gap-1.5 rounded-xl bg-blush/40 px-3 py-2 text-xs leading-5 text-foreground">
                        <MessageSquare
                          className="mt-0.5 size-3.5 shrink-0 text-primary"
                          aria-hidden="true"
                        />
                        <span className="line-clamp-2">
                          {appointment.message}
                        </span>
                      </p>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 flex-row items-center justify-between gap-3 sm:flex-col sm:items-end">
                    <p className="font-heading text-2xl font-semibold text-plum">
                      {formatCurrency(appointment.servicePrice)}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={appointment.status} />
                      <StatusBadge status={appointment.paymentStatus} />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t border-border/70 pt-3.5">
                  <Dialog>
                    <DialogTrigger
                      render={
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full border-border bg-transparent"
                        />
                      }
                    >
                      <Eye aria-hidden="true" />
                      View details
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="text-lg">
                          {appointment.serviceName}
                        </DialogTitle>
                        <DialogDescription>
                          Appointment request reference {appointment.id.slice(-6)}
                        </DialogDescription>
                      </DialogHeader>

                      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <DetailRow
                          label="Customer"
                          value={appointment.customerName}
                        />
                        <DetailRow
                          label="Email"
                          value={appointment.customerEmail || "—"}
                        />
                        <DetailRow
                          label="Phone"
                          value={
                            appointment.customerPhone ? (
                              <span className="inline-flex items-center gap-1.5">
                                <Phone className="size-3.5" aria-hidden="true" />
                                {appointment.customerPhone}
                              </span>
                            ) : (
                              "Not provided"
                            )
                          }
                        />
                        <DetailRow
                          label="Service category"
                          value={appointment.serviceCategory}
                        />
                        <DetailRow
                          label="Appointment date"
                          value={formatSalonDate(appointment.appointmentDate)}
                        />
                        <DetailRow
                          label="Appointment time"
                          value={formatTimeSlot(appointment.timeSlot)}
                        />
                        <DetailRow
                          label="Service price"
                          value={formatCurrency(appointment.servicePrice)}
                        />
                        <DetailRow
                          label="Booking requested"
                          value={formatSalonDateTime(appointment.requestedAt)}
                        />
                        <DetailRow
                          label="Appointment status"
                          value={<StatusBadge status={appointment.status} />}
                        />
                        <DetailRow
                          label="Payment status"
                          value={
                            <StatusBadge status={appointment.paymentStatus} />
                          }
                        />
                      </dl>

                      <div className="flex flex-col gap-1.5 rounded-xl bg-blush/50 p-3">
                        <p className="inline-flex items-center gap-1.5 text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">
                          <MessageSquare
                            className="size-3.5"
                            aria-hidden="true"
                          />
                          Customer message
                        </p>
                        <p className="text-sm leading-6 text-foreground">
                          {appointment.message || "No message provided."}
                        </p>
                      </div>

                      <DialogFooter>
                        <DialogClose render={<Button variant="outline" />}>
                          Close
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {canConfirm ? (
                    <Button
                      type="button"
                      size="sm"
                      className="rounded-full px-4"
                      onClick={() => handleConfirm(appointment)}
                      disabled={busy}
                    >
                      {busy ? (
                        <>
                          <Loader2Icon
                            className="animate-spin"
                            aria-hidden="true"
                          />
                          Confirming…
                        </>
                      ) : (
                        <>
                          <CircleCheck aria-hidden="true" />
                          Confirm
                        </>
                      )}
                    </Button>
                  ) : null}

                  {canCancel ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-full border-destructive/30 bg-transparent text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setCancelTarget(appointment)}
                      disabled={busy}
                    >
                      <XCircle aria-hidden="true" />
                      Cancel appointment
                    </Button>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <AlertDialog
        open={Boolean(cancelTarget)}
        onOpenChange={(open) => {
          if (!open && !cancelling) {
            setCancelTarget(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this appointment?</AlertDialogTitle>
            <AlertDialogDescription>
              {cancelTarget
                ? `${cancelTarget.serviceName} for ${cancelTarget.customerName} on ${formatSalonDate(cancelTarget.appointmentDate)} at ${formatTimeSlot(cancelTarget.timeSlot)} will be cancelled.${
                    cancelTarget.paymentStatus === "paid"
                      ? " This appointment is already paid; cancelling does not issue an automatic Stripe refund."
                      : ""
                  }`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>
              Keep appointment
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={cancelling}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {cancelling ? (
                <>
                  <Loader2Icon className="animate-spin" aria-hidden="true" />
                  Cancelling…
                </>
              ) : (
                "Cancel appointment"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export { AdminAppointments }
export type { AdminAppointmentsProps }
