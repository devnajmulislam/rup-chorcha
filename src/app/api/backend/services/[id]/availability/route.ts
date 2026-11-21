import type { NextRequest } from "next/server"

import { authJsonError } from "@/lib/auth"
import { proxyAuthenticatedJson } from "@/lib/backend-bff"
import { isValidDateString, OBJECT_ID_REGEX } from "@/lib/booking"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const serviceId = id.trim()

  if (!OBJECT_ID_REGEX.test(serviceId)) {
    return authJsonError({
      status: 400,
      code: "INVALID_SERVICE_ID",
      message: "Invalid service ID.",
    })
  }

  const dateParam = request.nextUrl.searchParams.get("date")?.trim() ?? ""
  if (!isValidDateString(dateParam)) {
    return authJsonError({
      status: 400,
      code: "VALIDATION_ERROR",
      message: "Select a valid appointment date (YYYY-MM-DD).",
      fieldErrors: {
        appointmentDate: "Select a valid appointment date.",
      },
    })
  }

  return proxyAuthenticatedJson({
    request,
    backendPath: `/api/services/${encodeURIComponent(serviceId)}/availability?date=${encodeURIComponent(dateParam)}`,
    method: "GET",
    allowedRoles: ["customer"],
  })
}
