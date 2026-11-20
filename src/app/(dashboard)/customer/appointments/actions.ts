"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"

import {
  cancelPendingAppointment,
  verifyPayableAppointment,
} from "@/lib/appointments"
import { requireRole } from "@/lib/session"

type CancelAppointmentResult =
  | { success: true }
  | { success: false; message: string }

type StartPaymentResult =
  | { success: true; checkoutUrl: string }
  | { success: false; message: string }

const PAY_ERROR_MESSAGES: Record<
  "not_found" | "pending" | "cancelled" | "already_paid",
  string
> = {
  not_found: "Appointment request not found.",
  pending: "Pending appointments cannot be paid until confirmed by the salon.",
  cancelled: "Cancelled appointments cannot be paid.",
  already_paid: "This appointment has already been paid.",
}

function validCheckoutUrl(value: unknown): string | null {
  if (typeof value !== "string") {
    return null
  }

  try {
    const url = new URL(value)
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : null
  } catch {
    return null
  }
}

async function cancelAppointmentAction(
  appointmentId: string
): Promise<CancelAppointmentResult> {
  const session = await requireRole("customer")

  try {
    const cancelled = await cancelPendingAppointment(
      session.user.id,
      appointmentId
    )

    if (!cancelled) {
      return {
        success: false,
        message:
          "Only your own pending appointment requests can be cancelled.",
      }
    }
  } catch {
    return {
      success: false,
      message: "We could not cancel this request. Please try again.",
    }
  }

  revalidatePath("/customer")
  revalidatePath("/customer/appointments")

  return { success: true }
}

/**
 * Validates payment eligibility on the server and asks the Express API to
 * create a Stripe Checkout Session. Never modifies `paymentStatus`, which must
 * only change after a verified Stripe webhook event.
 */
async function startPaymentAction(
  appointmentId: string
): Promise<StartPaymentResult> {
  const session = await requireRole("customer")

  let eligibility
  try {
    eligibility = await verifyPayableAppointment(session.user.id, appointmentId)
  } catch {
    return {
      success: false,
      message:
        "We could not verify this appointment right now. Please try again.",
    }
  }

  if (!eligibility.ok) {
    return {
      success: false,
      message: PAY_ERROR_MESSAGES[eligibility.reason],
    }
  }

  const apiUrl = process.env.API_URL?.trim().replace(/\/+$/, "")

  if (!apiUrl) {
    return {
      success: false,
      message:
        "Stripe checkout is not connected yet. Your appointment is confirmed and eligible for payment once checkout is enabled.",
    }
  }

  try {
    const incomingHeaders = await headers()
    const cookieHeader = incomingHeaders.get("cookie")

    const response = await fetch(`${apiUrl}/api/payments/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader ? { cookie: cookieHeader } : {}),
      },
      body: JSON.stringify({ appointmentId }),
      cache: "no-store",
    })

    const payload = (await response.json().catch(() => null)) as {
      message?: string
      url?: string
      data?: { url?: string }
    } | null

    if (!response.ok) {
      return {
        success: false,
        message:
          payload?.message?.trim() ||
          "Online Stripe checkout is currently unavailable. Please try again shortly.",
      }
    }

    const checkoutUrl = validCheckoutUrl(payload?.data?.url ?? payload?.url)

    if (!checkoutUrl) {
      return {
        success: false,
        message:
          "Online Stripe checkout is currently unavailable. Please try again shortly.",
      }
    }

    return { success: true, checkoutUrl }
  } catch {
    return {
      success: false,
      message:
        "Online Stripe checkout is currently unavailable. Please try again shortly.",
    }
  }
}

export { cancelAppointmentAction, startPaymentAction }
export type { CancelAppointmentResult, StartPaymentResult }
