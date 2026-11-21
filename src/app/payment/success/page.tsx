import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { CircleAlert, Info } from "lucide-react"

import { PaymentSuccessClient } from "@/components/payments/PaymentSuccessClient"
import { Container } from "@/components/shared/Container"
import { buttonVariants } from "@/components/ui/button"
import { fetchPaymentSession } from "@/lib/backend-api"
import { roleOf } from "@/lib/roles"
import { requireSession } from "@/lib/session"
import { cn } from "cn"

export const metadata: Metadata = {
  title: "Payment Status",
  description:
    "Verified Stripe payment confirmation status for your RupChorcha appointment.",
}

export const dynamic = "force-dynamic"

const STRIPE_SESSION_ID_REGEX = /^cs_[A-Za-z0-9_]+$/

function singleParam(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? ""
}

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{
    session_id?: string | string[]
  }>
}) {
  const resolvedParams = await searchParams
  const sessionId = singleParam(resolvedParams.session_id)
  const redirectTarget = sessionId
    ? `/payment/success?session_id=${encodeURIComponent(sessionId)}`
    : "/payment/success"

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
                Customer payment confirmation views belong to customer accounts.
                Review recorded payments in the admin transaction ledger.
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

  if (
    !sessionId ||
    sessionId.length < 5 ||
    sessionId.length > 255 ||
    !STRIPE_SESSION_ID_REGEX.test(sessionId)
  ) {
    return (
      <Container className="max-w-2xl">
        <section className="flex flex-col gap-5 rounded-3xl border border-border/70 bg-card p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <CircleAlert className="size-6" aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                Payment verification
              </p>
              <h1 className="font-heading text-3xl font-medium text-foreground">
                Missing or invalid checkout reference
              </h1>
              <p className="text-sm leading-6 text-muted-foreground">
                We cannot confirm a payment without a valid Stripe Checkout
                session reference. Check My Appointments for the latest payment
                status.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/customer/appointments"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-10 rounded-full px-5 text-sm"
              )}
            >
              My appointments
            </Link>
            <Link
              href="/customer"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-10 rounded-full border-border bg-transparent px-5 text-sm hover:bg-blush hover:text-plum"
              )}
            >
              Customer dashboard
            </Link>
          </div>
        </section>
      </Container>
    )
  }

  const lookupResult = await fetchPaymentSession(session.accessToken, sessionId)

  if (!lookupResult.ok) {
    if (lookupResult.kind === "blocked") {
      redirect("/sign-in?blocked=1")
    }
    if (lookupResult.kind === "unauthorized") {
      redirect(`/sign-in?redirect=${encodeURIComponent(redirectTarget)}`)
    }
  }

  return (
    <Container className="max-w-2xl">
      <PaymentSuccessClient
        sessionId={sessionId}
        initialSession={lookupResult.ok ? lookupResult.data : null}
        initialError={
          lookupResult.ok
            ? null
            : {
                kind: lookupResult.kind,
                message: lookupResult.message,
              }
        }
      />
    </Container>
  )
}
