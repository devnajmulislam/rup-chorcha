import type {
  CheckoutSessionData,
  PaymentSessionSummary,
} from "@/lib/dashboard-types"

type StartCheckoutResult =
  | {
      ok: true
      url: string
      sessionId: string
      reused: boolean
    }
  | {
      ok: false
      message: string
      code?: string
      unauthorized?: boolean
      blocked?: boolean
      conflict?: boolean
    }

type FetchPaymentSessionResult =
  | {
      ok: true
      data: PaymentSessionSummary
    }
  | {
      ok: false
      status: number
      message: string
      code?: string
      unauthorized?: boolean
      blocked?: boolean
      forbidden?: boolean
      notFound?: boolean
    }

function validStripeCheckoutUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) {
    return null
  }

  try {
    const parsed = new URL(value.trim())
    if (parsed.protocol !== "https:") {
      return null
    }
    if (
      parsed.hostname !== "checkout.stripe.com" &&
      !parsed.hostname.endsWith(".stripe.com")
    ) {
      return null
    }
    return parsed.toString()
  } catch {
    return null
  }
}

async function startAppointmentCheckout(
  appointmentId: string
): Promise<StartCheckoutResult> {
  let response: Response
  try {
    response = await fetch("/api/backend/payments/checkout", {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ appointmentId }),
    })
  } catch {
    return {
      ok: false,
      message: "We could not reach RupChorcha payment service. Please try again.",
    }
  }

  const payload = (await response.json().catch(() => null)) as {
    success?: boolean
    code?: string
    message?: string
    data?: Partial<CheckoutSessionData>
  } | null

  if (!response.ok || !payload?.success) {
    const code = payload?.code
    return {
      ok: false,
      message:
        payload?.message?.trim() ||
        "We could not start Stripe Checkout right now. Please try again.",
      code,
      unauthorized: response.status === 401,
      blocked: response.status === 403 && code === "USER_BLOCKED",
      conflict: response.status === 409,
    }
  }

  const checkoutUrl = validStripeCheckoutUrl(payload.data?.url)
  if (!checkoutUrl || !payload.data?.sessionId) {
    return {
      ok: false,
      message:
        "Payment service returned an invalid checkout redirect. Please try again.",
    }
  }

  return {
    ok: true,
    url: checkoutUrl,
    sessionId: payload.data.sessionId,
    reused: Boolean(payload.data.reused),
  }
}

async function fetchPaymentSessionFromBff(
  sessionId: string
): Promise<FetchPaymentSessionResult> {
  let response: Response
  try {
    response = await fetch(
      `/api/backend/payments/session/${encodeURIComponent(sessionId)}`,
      {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      }
    )
  } catch {
    return {
      ok: false,
      status: 503,
      code: "BACKEND_UNAVAILABLE",
      message:
        "We could not verify your payment status right now. Please try again.",
    }
  }

  const payload = (await response.json().catch(() => null)) as {
    success?: boolean
    code?: string
    message?: string
    data?: PaymentSessionSummary
  } | null

  if (!response.ok || !payload?.success || !payload.data) {
    const code = payload?.code
    return {
      ok: false,
      status: response.status,
      code,
      message:
        payload?.message?.trim() ||
        "We could not retrieve this payment session.",
      unauthorized: response.status === 401,
      blocked: response.status === 403 && code === "USER_BLOCKED",
      forbidden: response.status === 403 && code !== "USER_BLOCKED",
      notFound: response.status === 404,
    }
  }

  return {
    ok: true,
    data: payload.data,
  }
}

export { fetchPaymentSessionFromBff, startAppointmentCheckout }
export type { FetchPaymentSessionResult, StartCheckoutResult }
