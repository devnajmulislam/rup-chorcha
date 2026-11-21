import type { NextRequest } from "next/server"

import {
  authJsonError,
  authJsonSuccess,
  buildBackendHeaders,
  fetchBackend,
  getAppOrigin,
  safeJson,
} from "@/lib/auth"

export async function GET(request: NextRequest) {
  let expressResponse: Response

  try {
    expressResponse = await fetchBackend("/api/jwt/providers", {
      method: "GET",
      headers: buildBackendHeaders({
        appOrigin: getAppOrigin(request),
        request,
      }),
    })
  } catch {
    return authJsonError({
      status: 503,
      code: "BACKEND_UNAVAILABLE",
      message: "Authentication providers could not be checked right now.",
    })
  }

  const payload = await safeJson<{
    success?: boolean
    data?: { emailPassword?: boolean; google?: boolean }
    message?: string
  }>(expressResponse)

  if (!expressResponse.ok || !payload?.success) {
    return authJsonError({
      status: expressResponse.status >= 500 ? 503 : expressResponse.status,
      code: "BACKEND_UNAVAILABLE",
      message:
        payload?.message?.trim() ||
        "Authentication providers are temporarily unavailable.",
    })
  }

  return authJsonSuccess({
    emailPassword: payload.data?.emailPassword !== false,
    google: payload.data?.google === true,
  })
}
