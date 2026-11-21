import type { NextRequest } from "next/server"

import { authJsonError } from "@/lib/auth"
import {
  parseJsonBody,
  verifySameOriginCsrf,
  zodFieldErrors,
} from "@/lib/auth-bff"
import { proxyAuthenticatedJson } from "@/lib/backend-bff"
import { bookingRequestSchema } from "@/lib/booking"

export async function POST(request: NextRequest) {
  const csrfError = verifySameOriginCsrf(request)
  if (csrfError) {
    return csrfError
  }

  const parsedJson = await parseJsonBody(request)
  if (!parsedJson.ok) {
    return parsedJson.response
  }

  const validated = bookingRequestSchema.safeParse(parsedJson.data)
  if (!validated.success) {
    return authJsonError({
      status: 400,
      code: "VALIDATION_ERROR",
      message: "Check the highlighted booking details and try again.",
      fieldErrors: zodFieldErrors(validated.error),
    })
  }

  return proxyAuthenticatedJson({
    request,
    backendPath: "/api/appointments",
    method: "POST",
    body: {
      serviceId: validated.data.serviceId,
      appointmentDate: validated.data.appointmentDate,
      timeSlot: validated.data.timeSlot,
      message: validated.data.message,
    },
    allowedRoles: ["customer"],
  })
}
