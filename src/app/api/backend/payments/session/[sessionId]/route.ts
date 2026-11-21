import type { NextRequest } from "next/server"

import { authJsonError } from "@/lib/auth"
import { proxyAuthenticatedJson } from "@/lib/backend-bff"

const STRIPE_SESSION_ID_REGEX = /^cs_[A-Za-z0-9_]+$/

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await context.params
  const trimmed = sessionId?.trim() ?? ""

  if (
    trimmed.length < 5 ||
    trimmed.length > 255 ||
    !STRIPE_SESSION_ID_REGEX.test(trimmed)
  ) {
    return authJsonError({
      status: 400,
      code: "INVALID_SESSION_ID",
      message: "Invalid Stripe checkout session ID.",
    })
  }

  return proxyAuthenticatedJson({
    request,
    backendPath: `/api/payments/session/${encodeURIComponent(trimmed)}`,
    method: "GET",
  })
}
