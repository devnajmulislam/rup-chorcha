"use server"

import { revalidatePath } from "next/cache"

import { setCustomerBlockedStatus } from "@/lib/admin"
import { requireRole } from "@/lib/session"

type AdminUserActionResult =
  | { success: true; message: string }
  | { success: false; message: string }

async function setCustomerBlockAction(
  userId: string,
  block: boolean
): Promise<AdminUserActionResult> {
  await requireRole("admin")

  try {
    const outcome = await setCustomerBlockedStatus(userId, block)

    if (outcome === "missing") {
      return { success: false, message: "Customer account not found." }
    }

    if (outcome === "forbidden_admin") {
      return {
        success: false,
        message: "Admin accounts cannot be blocked here.",
      }
    }
  } catch {
    return {
      success: false,
      message: "We could not update this customer's access. Please try again.",
    }
  }

  revalidatePath("/admin")
  revalidatePath("/admin/users")

  return {
    success: true,
    message: block
      ? "Customer blocked. Active sessions have been revoked."
      : "Customer unblocked and may sign in again.",
  }
}

export { setCustomerBlockAction }
export type { AdminUserActionResult }
