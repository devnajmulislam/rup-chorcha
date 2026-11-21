"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  CalendarDays,
  CircleAlert,
  CircleCheck,
  CircleX,
  Clock3,
  CreditCard,
  Loader2Icon,
  ReceiptText,
  RefreshCw,
} from "lucide-react"

import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button, buttonVariants } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { useAuthSession } from "@/lib/auth-client"
import type { PaymentSessionSummary } from "@/lib/dashboard-types"
import {
  formatCurrency,
  formatSalonDate,
  formatSalonDateTime,
  formatTimeSlot,
} from "@/lib/format"
import {
  fetchPaymentSessionFromBff,
  startAppointmentCheckout,
} from "@/lib/payments-client"
import { cn } from "cn"

type PaymentSuccessClientProps = {
  sessionId: string
  initialSession: PaymentSessionSummary | null
  initialError?: {
    kind: string
    message: string
  } | null
}

const MAX_AUTO_POLLS = 12
const POLL_INTERVAL_MS = 2500

function shortReference(sessionId: string) {
  if (sessionId.length <= 22) {
    return sessionId
  }

  return `…${sessionId.slice(-14)}`
}

function failedReasonCopy(reason: string | null): string {
  switch (reason) {
    case "session_expired":
      return "This Stripe checkout session expired before payment completed. No charge was confirmed."
    case "async_payment_failed":
      return "Stripe reported that this payment attempt did not succeed."
    case "appointment_not_confirmed":
      return "This appointment is no longer confirmed for payment."
    default:
      return "This payment session was not completed. Your appointment remains unpaid."
  }
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

function PaymentSuccessClient({
  sessionId,
  initialSession,
  initialError = null,
}: PaymentSuccessClientProps) {
  const router = useRouter()
  const { setUser } = useAuthSession()

  const [session, setSession] = React.useState<PaymentSessionSummary | null>(
    initialSession
  )
  const [errorState, setErrorState] = React.useState<{
    kind: string
    message: string
  } | null>(initialError)
  const [checking, setChecking] = React.useState(false)
  const [pollAttempts, setPollAttempts] = React.useState(0)
  const [retrying, setRetrying] = React.useState(false)
  const retryInFlightRef = React.useRef(false)

  const checkSessionStatus = React.useCallback(async () => {
    setChecking(true)
    const result = await fetchPaymentSessionFromBff(sessionId)
    setChecking(false)

    if (!result.ok) {
      if (result.blocked) {
        setUser(null)
        router.replace("/sign-in?blocked=1")
        return
      }
      if (result.unauthorized) {
        setUser(null)
        router.replace(
          `/sign-in?redirect=${encodeURIComponent(
            `/payment/success?session_id=${sessionId}`
          )}`
        )
        return
      }
      setErrorState({
        kind: result.forbidden
          ? "forbidden"
          : result.notFound
            ? "not_found"
            : "error",
        message: result.message,
      })
      return
    }

    setErrorState(null)
    setSession(result.data)
    if (result.data.isFinal) {
      router.refresh()
    }
  }, [router, sessionId, setUser])

  React.useEffect(() => {
    if (
      !session ||
      session.status !== "pending" ||
      session.isFinal ||
      errorState ||
      pollAttempts >= MAX_AUTO_POLLS
    ) {
      return
    }

    let cancelled = false
    const timer = setTimeout(() => {
      if (cancelled) {
        return
      }
      setPollAttempts((count) => count + 1)
      void checkSessionStatus()
    }, POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [checkSessionStatus, errorState, pollAttempts, session])

  async function handleRetryPayment() {
    if (
      !session?.appointment ||
      retryInFlightRef.current ||
      retrying ||
      session.appointment.status !== "confirmed" ||
      session.appointment.paymentStatus !== "unpaid"
    ) {
      return
    }

    retryInFlightRef.current = true
    setRetrying(true)

    try {
      const result = await startAppointmentCheckout(session.appointment.id)

      if (!result.ok) {
        retryInFlightRef.current = false
        setRetrying(false)

        if (result.blocked) {
          setUser(null)
          router.replace("/sign-in?blocked=1")
          return
        }
        if (result.unauthorized) {
          setUser(null)
          router.replace("/sign-in?redirect=%2Fcustomer%2Fappointments")
          return
        }

        toast.add({
          title: "Payment unavailable",
          description: result.message,
          type: "error",
        })
        return
      }

      window.location.assign(result.url)
    } catch {
      retryInFlightRef.current = false
      setRetrying(false)
      toast.add({
        title: "Payment unavailable",
        description: "We could not reach RupChorcha. Please try again.",
        type: "error",
      })
    }
  }

  if (errorState || !session) {
    return (
      <section
        aria-live="polite"
        className="flex flex-col gap-5 rounded-3xl border border-border/70 bg-card p-6 shadow-sm sm:p-8"
      >
        <div className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <CircleAlert className="size-6" aria-hidden="true" />
          </span>
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
              Payment verification
            </p>
            <h1 className="font-heading text-3xl font-medium text-foreground">
              {errorState?.kind === "forbidden"
                ? "Payment session unavailable"
                : errorState?.kind === "not_found"
                  ? "Payment session not found"
                  : "Could not verify payment"}
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              {errorState?.message ||
                "We could not verify this Stripe Checkout session right now."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {errorState?.kind !== "forbidden" && errorState?.kind !== "not_found" ? (
            <Button
              type="button"
              onClick={() => void checkSessionStatus()}
              disabled={checking}
              className="h-10 rounded-full px-5 text-sm"
            >
              {checking ? (
                <Loader2Icon className="animate-spin" aria-hidden="true" />
              ) : (
                <RefreshCw aria-hidden="true" />
              )}
              Check status again
            </Button>
          ) : null}
          <Link
            href="/customer/appointments"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-10 rounded-full border-border bg-transparent px-5 text-sm hover:bg-blush hover:text-plum"
            )}
          >
            Back to My Appointments
          </Link>
          <Link
            href="/customer"
            className={cn(
              buttonVariants({ variant: "ghost", size: "lg" }),
              "h-10 rounded-full px-4 text-sm text-plum hover:bg-blush"
            )}
          >
            Customer dashboard
          </Link>
        </div>
      </section>
    )
  }

  const appointment = session.appointment
  const isPaid = session.status === "paid"
  const isFailed = session.status === "failed"
  const canRetryPayment =
    isFailed &&
    appointment?.status === "confirmed" &&
    appointment?.paymentStatus === "unpaid"

  return (
    <section
      aria-live="polite"
      className="flex flex-col gap-6 rounded-3xl border border-border/70 bg-card p-6 shadow-sm sm:p-8"
    >
      <div className="flex items-start gap-4">
        <span
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-full",
            isPaid
              ? "bg-success/10 text-success"
              : isFailed
                ? "bg-destructive/10 text-destructive"
                : "bg-warning/10 text-warning"
          )}
        >
          {isPaid ? (
            <CircleCheck className="size-6" aria-hidden="true" />
          ) : isFailed ? (
            <CircleX className="size-6" aria-hidden="true" />
          ) : (
            <Clock3 className="size-6" aria-hidden="true" />
          )}
        </span>

        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
            {isPaid
              ? "Verified payment"
              : isFailed
                ? "Payment not completed"
                : "Awaiting Stripe webhook"}
          </p>
          <h1 className="font-heading text-3xl font-medium text-foreground">
            {isPaid
              ? "Payment confirmed"
              : isFailed
                ? "Payment could not be completed"
                : "Verifying your payment"}
          </h1>
          <p className="text-sm leading-6 text-muted-foreground">
            {isPaid
              ? "Stripe webhook confirmation has been received and your appointment is marked paid."
              : isFailed
                ? failedReasonCopy(session.failureReason)
                : pollAttempts >= MAX_AUTO_POLLS
                  ? "We are still waiting for Stripe webhook confirmation. Your card is only marked paid once Stripe verifies the webhook event."
                  : "You returned from Stripe Checkout. Checking with RupChorcha for verified Stripe webhook confirmation…"}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-ivory p-5">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DetailRow
            label="Transaction status"
            value={<StatusBadge status={session.status} />}
          />
          <DetailRow
            label="Amount"
            value={`${formatCurrency(session.amount)} ${session.currency}`}
          />
          {appointment ? (
            <>
              <DetailRow label="Service" value={appointment.serviceName} />
              <DetailRow
                label="Appointment status"
                value={
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={appointment.status} />
                    <StatusBadge status={appointment.paymentStatus} />
                  </div>
                }
              />
              <DetailRow
                label="Appointment date & time"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays
                      className="size-4 text-primary"
                      aria-hidden="true"
                    />
                    {appointment.appointmentDate
                      ? `${formatSalonDate(appointment.appointmentDate)} · ${formatTimeSlot(appointment.timeSlot)}`
                      : formatTimeSlot(appointment.timeSlot)}
                  </span>
                }
              />
            </>
          ) : null}
          <DetailRow
            label="Stripe session"
            value={
              <span className="font-mono text-xs" title={session.sessionId}>
                {shortReference(session.sessionId)}
              </span>
            }
          />
          {session.paidAt ? (
            <DetailRow
              label="Confirmed at"
              value={formatSalonDateTime(session.paidAt)}
            />
          ) : null}
        </dl>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {session.status === "pending" ? (
          <Button
            type="button"
            onClick={() => void checkSessionStatus()}
            disabled={checking}
            className="h-10 rounded-full px-5 text-sm"
          >
            {checking ? (
              <Loader2Icon className="animate-spin" aria-hidden="true" />
            ) : (
              <RefreshCw aria-hidden="true" />
            )}
            Check status again
          </Button>
        ) : null}

        {isPaid ? (
          <Link
            href="/customer/appointments?tab=payments"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-10 rounded-full px-5 text-sm"
            )}
          >
            <ReceiptText aria-hidden="true" />
            View payment history
          </Link>
        ) : null}

        {canRetryPayment ? (
          <Button
            type="button"
            onClick={() => void handleRetryPayment()}
            disabled={retrying}
            className="h-10 rounded-full px-5 text-sm"
          >
            {retrying ? (
              <Loader2Icon className="animate-spin" aria-hidden="true" />
            ) : (
              <CreditCard aria-hidden="true" />
            )}
            {retrying ? "Redirecting…" : "Retry payment"}
          </Button>
        ) : null}

        <Link
          href="/customer/appointments"
          className={cn(
            buttonVariants({
              variant: isPaid || canRetryPayment ? "outline" : "default",
              size: "lg",
            }),
            "h-10 rounded-full px-5 text-sm",
            (isPaid || canRetryPayment) &&
              "border-border bg-transparent hover:bg-blush hover:text-plum"
          )}
        >
          My appointments
        </Link>

        <Link
          href="/customer"
          className={cn(
            buttonVariants({ variant: "ghost", size: "lg" }),
            "h-10 rounded-full px-4 text-sm text-plum hover:bg-blush"
          )}
        >
          Dashboard
        </Link>
      </div>
    </section>
  )
}

export { PaymentSuccessClient }
export type { PaymentSuccessClientProps }
