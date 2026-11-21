"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CreditCard, Loader2Icon } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { useAuthSession } from "@/lib/auth-client"
import { startAppointmentCheckout } from "@/lib/payments-client"
import { cn } from "cn"

type PaymentCancelActionsProps = {
  appointmentId: string
  canRetry: boolean
}

function PaymentCancelActions({
  appointmentId,
  canRetry,
}: PaymentCancelActionsProps) {
  const router = useRouter()
  const { setUser } = useAuthSession()
  const [retrying, setRetrying] = React.useState(false)
  const payInFlightRef = React.useRef(false)

  async function handleRetry() {
    if (!canRetry || payInFlightRef.current || retrying) {
      return
    }

    payInFlightRef.current = true
    setRetrying(true)

    try {
      const result = await startAppointmentCheckout(appointmentId)

      if (!result.ok) {
        payInFlightRef.current = false
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

        if (result.conflict) {
          router.refresh()
        }
        return
      }

      window.location.assign(result.url)
    } catch {
      payInFlightRef.current = false
      setRetrying(false)
      toast.add({
        title: "Payment unavailable",
        description: "We could not reach RupChorcha. Please try again.",
        type: "error",
      })
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {canRetry ? (
        <Button
          type="button"
          onClick={() => void handleRetry()}
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
            variant: canRetry ? "outline" : "default",
            size: "lg",
          }),
          "h-10 rounded-full px-5 text-sm",
          canRetry &&
            "border-border bg-transparent hover:bg-blush hover:text-plum"
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
        Dashboard
      </Link>
    </div>
  )
}

export { PaymentCancelActions }
export type { PaymentCancelActionsProps }
