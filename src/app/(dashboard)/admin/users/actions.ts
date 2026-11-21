"use server"

import { revalidatePath } from "next/cache"

import { setAdminUserBlocked } from "@/lib/backend-api"
import { requireRole } from "@/lib/session"

type AdminUserActionResult =
  | { success: true; message: string }
  | { success: false; message: string; blocked?: boolean }

async function setCustomerBlockAction(
  userId: string,
  block: boolean
): Promise<AdminUserActionResult> {
  const session = await requireRole("admin")
  const result = await setAdminUserBlocked(session.accessToken, userId, block)

  if (!result.ok) {
    return {
      success: false,
      message: result.message,
      blocked: result.kind === "blocked",
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
