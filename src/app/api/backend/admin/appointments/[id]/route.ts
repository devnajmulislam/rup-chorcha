import type { NextRequest } from "next/server"

import { authJsonError } from "@/lib/auth"
import { proxyAuthenticatedJson } from "@/lib/backend-bff"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const appointmentId = id?.trim() ?? ""
  if (!appointmentId) {
    return authJsonError({
      status: 400,
      code: "INVALID_APPOINTMENT_ID",
      message: "Appointment ID is required.",
    })
  }

  return proxyAuthenticatedJson({
    request,
    backendPath: `/api/admin/appointments/${encodeURIComponent(appointmentId)}`,
    method: "GET",
    allowedRoles: ["admin"],
  })
}
