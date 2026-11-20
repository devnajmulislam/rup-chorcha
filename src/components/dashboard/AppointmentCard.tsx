"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  CalendarDays,
  Clock3,
  CreditCard,
  Eye,
  ImageIcon,
  Loader2Icon,
  MessageSquare,
  ReceiptText,
  XCircle,
} from "lucide-react"

import {
  cancelAppointmentAction,
  startPaymentAction,
} from "@/app/(dashboard)/customer/appointments/actions"
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
  AlertDialogTrigger,
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
import { toast } from "@/components/ui/toast"
import type { CustomerAppointment } from "@/lib/appointments"
import {
  formatCurrency,
  formatSalonDate,
  formatSalonDateTime,
  formatTimeSlot,
} from "@/lib/format"

type AppointmentCardProps = {
  appointment: CustomerAppointment
}

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

function statusNote(appointment: CustomerAppointment) {
  if (appointment.status === "pending") {
    return "Payment becomes available once the salon confirms your request."
  }

  if (appointment.status === "confirmed") {
    return appointment.paymentStatus === "paid"
      ? "Payment completed for this confirmed appointment."
      : "Confirmed appointments can no longer be cancelled from your account."
  }

  return "Cancelled appointments cannot be paid or reopened."
}

function AppointmentCard({ appointment }: AppointmentCardProps) {
  const router = useRouter()
  const [cancelOpen, setCancelOpen] = React.useState(false)
  const [cancelling, setCancelling] = React.useState(false)
  const [paying, setPaying] = React.useState(false)

  const canCancel = appointment.status === "pending"
  const canPay =
    appointment.status === "confirmed" && appointment.paymentStatus === "unpaid"

  async function handleCancel() {
    setCancelling(true)

    try {
      const result = await cancelAppointmentAction(appointment.id)

      if (!result.success) {
        toast.add({
          title: "Could not cancel request",
          description: result.message,
          type: "error",
        })
        return
      }

      toast.add({
        title: "Request cancelled",
        description: `${appointment.serviceName} on ${formatSalonDate(appointment.appointmentDate)} has been cancelled.`,
        type: "success",
      })
      setCancelOpen(false)
      router.refresh()
    } catch {
      toast.add({
        title: "Could not cancel request",
        description: "We could not reach RupChorcha. Please try again.",
        type: "error",
      })
    } finally {
      setCancelling(false)
    }
  }

  async function handlePayNow() {
    if (paying) {
      return
    }

    setPaying(true)

    try {
      const result = await startPaymentAction(appointment.id)

      if (!result.success) {
        toast.add({
          title: "Payment unavailable",
          description: result.message,
          type: "error",
        })
        return
      }

      window.location.assign(result.checkoutUrl)
    } catch {
      toast.add({
        title: "Payment unavailable",
        description: "We could not reach RupChorcha. Please try again.",
        type: "error",
      })
    } finally {
      setPaying(false)
    }
  }

  return (
    <article className="flex flex-col gap-5 rounded-2xl border border-border/70 bg-card p-4 shadow-[0_18px_40px_-34px_rgba(58,24,48,0.4)] sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl bg-blush sm:aspect-square sm:w-32">
          {appointment.serviceImage ? (
            <Image
              src={appointment.serviceImage}
              alt={appointment.serviceName}
              fill
              sizes="(min-width: 640px) 8rem, 100vw"
              className="object-cover"
            />
          ) : (
            <span className="flex size-full items-center justify-center text-plum/50">
              <ImageIcon className="size-6" aria-hidden="true" />
            </span>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex min-w-0 flex-col gap-1">
              <h3 className="font-heading text-2xl leading-tight font-medium text-foreground">
                {appointment.serviceName}
              </h3>
              <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
                {appointment.serviceCategory}
              </p>
            </div>
            <p className="font-heading text-xl font-semibold text-plum">
              {formatCurrency(appointment.servicePrice)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4 text-primary" aria-hidden="true" />
              {formatSalonDate(appointment.appointmentDate)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="size-4 text-primary" aria-hidden="true" />
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

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <StatusBadge status={appointment.status} />
            <StatusBadge status={appointment.paymentStatus} />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-border/70 pt-4">
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
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg">
                {appointment.serviceName}
              </DialogTitle>
              <DialogDescription>
                Appointment request reference {appointment.id.slice(-6)}
              </DialogDescription>
            </DialogHeader>

            <dl className="grid grid-cols-2 gap-4">
              <DetailRow label="Category" value={appointment.serviceCategory} />
              <DetailRow
                label="Price"
                value={formatCurrency(appointment.servicePrice)}
              />
              <DetailRow
                label="Date"
                value={formatSalonDate(appointment.appointmentDate)}
              />
              <DetailRow
                label="Time"
                value={formatTimeSlot(appointment.timeSlot)}
              />
              <DetailRow
                label="Appointment status"
                value={<StatusBadge status={appointment.status} />}
              />
              <DetailRow
                label="Payment status"
                value={<StatusBadge status={appointment.paymentStatus} />}
              />
              <DetailRow
                label="Requested on"
                value={formatSalonDateTime(appointment.requestedAt)}
              />
            </dl>

            {appointment.message ? (
              <div className="flex flex-col gap-1.5 rounded-xl bg-blush/50 p-3">
                <p className="inline-flex items-center gap-1.5 text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">
                  <MessageSquare className="size-3.5" aria-hidden="true" />
                  Your note
                </p>
                <p className="text-sm leading-6 text-foreground">
                  {appointment.message}
                </p>
              </div>
            ) : null}

            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                Close
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {canPay ? (
          <Button
            type="button"
            size="sm"
            className="rounded-full px-4"
            onClick={handlePayNow}
            disabled={paying}
          >
            {paying ? (
              <>
                <Loader2Icon className="animate-spin" aria-hidden="true" />
                Processing…
              </>
            ) : (
              <>
                <CreditCard aria-hidden="true" />
                Pay now
              </>
            )}
          </Button>
        ) : null}

        {canCancel ? (
          <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
            <AlertDialogTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border-destructive/30 bg-transparent text-destructive hover:bg-destructive/10 hover:text-destructive"
                />
              }
            >
              <XCircle aria-hidden="true" />
              Cancel request
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel this request?</AlertDialogTitle>
                <AlertDialogDescription>
                  {appointment.serviceName} on{" "}
                  {formatSalonDate(appointment.appointmentDate)} at{" "}
                  {formatTimeSlot(appointment.timeSlot)} will be cancelled. This
                  cannot be undone from your account.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={cancelling}>
                  Keep request
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="bg-destructive text-white hover:bg-destructive/90"
                >
                  {cancelling ? (
                    <>
                      <Loader2Icon className="animate-spin" aria-hidden="true" />
                      Cancelling
                    </>
                  ) : (
                    "Cancel request"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : null}

        <p className="text-xs leading-5 text-muted-foreground">
          {statusNote(appointment)}
        </p>
      </div>
    </article>
  )
}

export { AppointmentCard }
export type { AppointmentCardProps }
