"use server"

import { revalidatePath } from "next/cache"

import { cancelMyAppointment } from "@/lib/backend-api"
import { requireRole } from "@/lib/session"

type CancelAppointmentResult =
  | { success: true }
  | { success: false; message: string; code?: string; blocked?: boolean }

async function cancelAppointmentAction(
  appointmentId: string
): Promise<CancelAppointmentResult> {
  const session = await requireRole("customer")

  const result = await cancelMyAppointment(session.accessToken, appointmentId)

  if (!result.ok) {
    return {
      success: false,
      message: result.message,
      code: result.code,
      blocked: result.kind === "blocked",
    }
  }

  revalidatePath("/customer")
  revalidatePath("/customer/appointments")

  return { success: true }
}

export { cancelAppointmentAction }
export type { CancelAppointmentResult }
