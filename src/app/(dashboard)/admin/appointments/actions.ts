"use server"

import { revalidatePath } from "next/cache"

import {
  cancelAdminAppointment,
  confirmPendingAppointment,
} from "@/lib/admin"
import { requireRole } from "@/lib/session"

type AdminAppointmentActionResult =
  | { success: true; message: string }
  | { success: false; message: string }

function revalidateAppointmentPaths() {
  revalidatePath("/admin")
  revalidatePath("/admin/appointments")
  revalidatePath("/customer")
  revalidatePath("/customer/appointments")
}

async function confirmAppointmentAction(
  appointmentId: string
): Promise<AdminAppointmentActionResult> {
  await requireRole("admin")

  try {
    const outcome = await confirmPendingAppointment(appointmentId)

    if (outcome === "missing") {
      return { success: false, message: "Appointment request not found." }
    }

    if (outcome === "not_pending") {
      return {
        success: false,
        message: "Only pending appointments can be confirmed.",
      }
    }
  } catch {
    return {
      success: false,
      message: "We could not confirm this appointment. Please try again.",
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
  await requireRole("admin")

  try {
    const outcome = await cancelAdminAppointment(appointmentId)

    if (outcome === "missing") {
      return { success: false, message: "Appointment request not found." }
    }

    if (outcome === "already_cancelled") {
      return {
        success: false,
        message: "This appointment is already cancelled.",
      }
    }
  } catch {
    return {
      success: false,
      message: "We could not cancel this appointment. Please try again.",
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
