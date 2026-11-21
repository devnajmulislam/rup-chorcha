import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { CalendarDays, CircleX, Info } from "lucide-react"

import { PaymentCancelActions } from "@/components/payments/PaymentCancelActions"
import { Container } from "@/components/shared/Container"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { buttonVariants } from "@/components/ui/button"
import { fetchMyAppointmentById } from "@/lib/backend-api"
import type { CustomerAppointment } from "@/lib/dashboard-types"
import { formatCurrency, formatSalonDate, formatTimeSlot } from "@/lib/format"
import { roleOf } from "@/lib/roles"
import { requireSession } from "@/lib/session"
import { cn } from "cn"

export const metadata: Metadata = {
  title: "Checkout Cancelled",
  description:
    "Your Stripe payment checkout was cancelled before completion. Your RupChorcha appointment was not charged.",
}

export const dynamic = "force-dynamic"

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/

function singleParam(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? ""
}

export default async function PaymentCancelPage({
  searchParams,
}: {
  searchParams: Promise<{
    appointmentId?: string | string[]
  }>
}) {
  const resolvedParams = await searchParams
  const appointmentId = singleParam(resolvedParams.appointmentId)
  const redirectTarget = appointmentId
    ? `/payment/cancel?appointmentId=${encodeURIComponent(appointmentId)}`
    : "/payment/cancel"

  const session = await requireSession(redirectTarget)

  if (roleOf(session.user) !== "customer") {
    return (
      <Container className="max-w-2xl">
        <section className="flex flex-col gap-5 rounded-3xl border border-border/70 bg-card p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-blush text-primary">
              <Info className="size-6" aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                Customer checkout page
              </p>
              <h1 className="font-heading text-3xl font-medium text-foreground">
                Signed in as administrator
              </h1>
              <p className="text-sm leading-6 text-muted-foreground">
                Appointment payments apply only to customer accounts.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/transactions"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-10 rounded-full px-5 text-sm"
              )}
            >
              View admin transactions
            </Link>
            <Link
              href="/admin"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-10 rounded-full border-border bg-transparent px-5 text-sm hover:bg-blush hover:text-plum"
              )}
            >
              Admin dashboard
            </Link>
          </div>
        </section>
      </Container>
    )
  }

  let appointment: CustomerAppointment | null = null
  if (OBJECT_ID_REGEX.test(appointmentId)) {
    const apptResult = await fetchMyAppointmentById(
      session.accessToken,
      appointmentId
    )
    if (!apptResult.ok) {
      if (apptResult.kind === "blocked") {
        redirect("/sign-in?blocked=1")
      }
      if (apptResult.kind === "unauthorized") {
        redirect(`/sign-in?redirect=${encodeURIComponent(redirectTarget)}`)
      }
    } else {
      appointment = apptResult.data
    }
  }

  const canRetry = Boolean(
    appointment &&
      appointment.status === "confirmed" &&
      appointment.paymentStatus === "unpaid"
  )

  return (
    <Container className="max-w-2xl">
      <section className="flex flex-col gap-6 rounded-3xl border border-border/70 bg-card p-6 shadow-sm sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-warning/10 text-warning">
            <CircleX className="size-6" aria-hidden="true" />
          </span>

          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
              Checkout cancelled
            </p>
            <h1 className="font-heading text-3xl font-medium text-foreground">
              Payment was cancelled
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              You left Stripe Checkout before completing payment. Your appointment
              has not been marked paid and remains unchanged.
            </p>
          </div>
        </div>

        {appointment ? (
          <div className="rounded-2xl border border-border/70 bg-ivory p-5">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">
                  Service
                </dt>
                <dd className="text-sm font-medium text-foreground">
                  {appointment.serviceName}
                </dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">
                  Amount due
                </dt>
                <dd className="text-sm font-medium text-plum">
                  {formatCurrency(appointment.servicePrice)}
                </dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">
                  Appointment date & time
                </dt>
                <dd className="inline-flex items-center gap-1.5 text-sm text-foreground">
                  <CalendarDays
                    className="size-4 text-primary"
                    aria-hidden="true"
                  />
                  {formatSalonDate(appointment.appointmentDate)} ·{" "}
                  {formatTimeSlot(appointment.timeSlot)}
                </dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">
                  Current status
                </dt>
                <dd className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={appointment.status} />
                  <StatusBadge status={appointment.paymentStatus} />
                </dd>
              </div>
            </dl>
          </div>
        ) : null}

        <PaymentCancelActions
          appointmentId={appointment?.id ?? ""}
          canRetry={canRetry}
        />
      </section>
    </Container>
  )
}
