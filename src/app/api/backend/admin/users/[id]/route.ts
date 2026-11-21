import type { NextRequest } from "next/server"

import { authJsonError } from "@/lib/auth"
import { proxyAuthenticatedJson } from "@/lib/backend-bff"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const userId = id?.trim() ?? ""
  if (!userId) {
    return authJsonError({
      status: 400,
      code: "INVALID_USER_ID",
      message: "Customer ID is required.",
    })
  }

  return proxyAuthenticatedJson({
    request,
    backendPath: `/api/admin/users/${encodeURIComponent(userId)}`,
    method: "GET",
    allowedRoles: ["admin"],
  })
}
