import type { NextRequest } from "next/server"

import { authJsonError } from "@/lib/auth"
import { verifySameOriginCsrf } from "@/lib/auth-bff"
import { proxyAuthenticatedJson } from "@/lib/backend-bff"

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const csrfError = verifySameOriginCsrf(request)
  if (csrfError) {
    return csrfError
  }

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
    backendPath: `/api/appointments/my/${encodeURIComponent(appointmentId)}/cancel`,
    method: "PATCH",
    allowedRoles: ["customer"],
  })
}
