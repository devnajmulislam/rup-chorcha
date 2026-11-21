import type { NextRequest } from "next/server"
import { z } from "zod"

import { authJsonError } from "@/lib/auth"
import {
  parseJsonBody,
  verifySameOriginCsrf,
  zodFieldErrors,
} from "@/lib/auth-bff"
import { proxyAuthenticatedJson } from "@/lib/backend-bff"

const checkoutRequestSchema = z
  .object({
    appointmentId: z
      .string({ error: "Appointment ID is required." })
      .trim()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid appointment ID."),
  })
  .strict()

export async function POST(request: NextRequest) {
  const csrfError = verifySameOriginCsrf(request)
  if (csrfError) {
    return csrfError
  }

  const parsedBody = await parseJsonBody(request)
  if (!parsedBody.ok) {
    return parsedBody.response
  }

  const validated = checkoutRequestSchema.safeParse(parsedBody.data)
  if (!validated.success) {
    return authJsonError({
      status: 400,
      code: "VALIDATION_ERROR",
      message:
        validated.error.issues[0]?.message ||
        "Check the appointment details and try again.",
      fieldErrors: zodFieldErrors(validated.error),
    })
  }

  return proxyAuthenticatedJson({
    request,
    backendPath: "/api/payments/checkout",
    method: "POST",
    body: {
      appointmentId: validated.data.appointmentId,
    },
    allowedRoles: ["customer"],
  })
}
