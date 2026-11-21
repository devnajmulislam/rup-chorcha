"use server"

import { revalidatePath } from "next/cache"

import {
  cancelAdminAppointment,
  confirmAdminAppointment,
} from "@/lib/backend-api"
import { requireRole } from "@/lib/session"

type AdminAppointmentActionResult =
  | { success: true; message: string }
  | { success: false; message: string; blocked?: boolean }

function revalidateAppointmentPaths() {
  revalidatePath("/admin")
  revalidatePath("/admin/appointments")
  revalidatePath("/customer")
  revalidatePath("/customer/appointments")
}

async function confirmAppointmentAction(
  appointmentId: string
): Promise<AdminAppointmentActionResult> {
  const session = await requireRole("admin")
  const result = await confirmAdminAppointment(
    session.accessToken,
    appointmentId
  )

  if (!result.ok) {
    return {
      success: false,
      message: result.message,
      blocked: result.kind === "blocked",
    }
  }

  revalidateAppointmentPaths()

  return {
    success: true,
    message: "Appointment confirmed. The customer can now complete payment.",
  }
}

async function cancelAdminAppointmentAction(
  appointmentId: string
): Promise<AdminAppointmentActionResult> {
  const session = await requireRole("admin")
  const result = await cancelAdminAppointment(
    session.accessToken,
    appointmentId
  )

  if (!result.ok) {
    return {
      success: false,
      message: result.message,
      blocked: result.kind === "blocked",
    }
  }

  revalidateAppointmentPaths()

  return {
    success: true,
    message: "Appointment has been cancelled.",
  }
}

export { cancelAdminAppointmentAction, confirmAppointmentAction }
export type { AdminAppointmentActionResult }
