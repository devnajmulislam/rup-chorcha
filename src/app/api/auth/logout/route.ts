import type { NextRequest } from "next/server"

import {
  applyExpressSetCookies,
  authJsonSuccess,
  buildBackendHeaders,
  clearAllAuthCookies,
  fetchBackend,
  getAppOrigin,
  hasBetterAuthSessionCookie,
  serializeCookies,
} from "@/lib/auth"
import { verifySameOriginCsrf } from "@/lib/auth-bff"

export async function POST(request: NextRequest) {
  const csrfError = verifySameOriginCsrf(request)
  if (csrfError) {
    return csrfError
  }

  const allCookies = request.cookies.getAll()
  const cookieHeader = serializeCookies(allCookies)
  const appOrigin = getAppOrigin(request)

  let expressResponse: Response | null = null

  if (hasBetterAuthSessionCookie(allCookies)) {
    try {
      expressResponse = await fetchBackend("/api/auth/sign-out", {
        method: "POST",
        headers: buildBackendHeaders({
          appOrigin,
          cookieHeader,
          contentType: "application/json",
          request,
        }),
        body: JSON.stringify({}),
      })
    } catch {
      expressResponse = null
    }
  }

  const response = authJsonSuccess({ loggedOut: true })

  if (expressResponse) {
    applyExpressSetCookies(response, expressResponse, request)
  }

  clearAllAuthCookies(response, request)

  return response
}
