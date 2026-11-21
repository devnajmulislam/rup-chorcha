import { NextResponse, type NextRequest } from "next/server"

import {
  applyExpressSetCookies,
  authJsonError,
  authJsonSuccess,
  buildBackendHeaders,
  fetchBackend,
  getAppOrigin,
  safeJson,
  serializeCookies,
} from "@/lib/auth"
import {
  mapExpressAuthError,
  verifySameOriginCsrf,
  type ExpressErrorBody,
} from "@/lib/auth-bff"
import { googleAuthSchema } from "@/lib/auth-validators"
import { sanitizeRedirectPath } from "@/lib/roles"

async function initiateGoogleOAuth(request: NextRequest, rawRedirect: unknown) {
  const safeRedirect = sanitizeRedirectPath(rawRedirect, "")
  const appOrigin = getAppOrigin(request)
  const existingCookieHeader = serializeCookies(request.cookies.getAll())

  const callbackURL = safeRedirect
    ? `${appOrigin}/auth/continue?redirect=${encodeURIComponent(safeRedirect)}`
    : `${appOrigin}/auth/continue`
  const errorCallbackURL = `${appOrigin}/sign-in`

  let expressResponse: Response
  try {
    expressResponse = await fetchBackend("/api/auth/sign-in/social", {
      method: "POST",
      headers: buildBackendHeaders({
        appOrigin,
        cookieHeader: existingCookieHeader || undefined,
        contentType: "application/json",
        request,
      }),
      body: JSON.stringify({
        provider: "google",
        callbackURL,
        errorCallbackURL,
        disableRedirect: true,
      }),
    })
  } catch {
    return {
      ok: false as const,
      response: authJsonError({
        status: 503,
        code: "BACKEND_UNAVAILABLE",
        message:
          "Google sign-in is temporarily unavailable. Please try again shortly.",
      }),
    }
  }

  const payload = await safeJson<
    { url?: string; redirect?: boolean } & ExpressErrorBody
  >(expressResponse)

  if (!expressResponse.ok) {
    if (
      expressResponse.status === 404 ||
      payload?.code === "PROVIDER_NOT_FOUND"
    ) {
      return {
        ok: false as const,
        response: authJsonError({
          status: 503,
          code: "GOOGLE_OAUTH_NOT_CONFIGURED",
          message:
            "Google sign-in is not configured on the server. Use email and password instead.",
        }),
      }
    }

    const mapped = mapExpressAuthError(
      expressResponse.status,
      payload,
      "Google sign-in could not be started. Please try again."
    )
    return {
      ok: false as const,
      response: authJsonError(mapped),
    }
  }

  const authorizeUrl = typeof payload?.url === "string" ? payload.url.trim() : ""
  let validHttpsUrl = false
  try {
    validHttpsUrl = new URL(authorizeUrl).protocol === "https:"
  } catch {
    validHttpsUrl = false
  }

  if (!validHttpsUrl) {
    return {
      ok: false as const,
      response: authJsonError({
        status: 502,
        code: "INVALID_OAUTH_URL",
        message: "Google sign-in returned an invalid authorization URL.",
      }),
    }
  }

  return {
    ok: true as const,
    authorizeUrl,
    expressResponse,
  }
}

export async function POST(request: NextRequest) {
  const csrfError = verifySameOriginCsrf(request)
  if (csrfError) {
    return csrfError
  }

  let rawBody: unknown = {}

  const contentLength = request.headers.get("content-length")
  if (contentLength !== "0") {
    const text = await request.text().catch(() => "")
    if (text.trim()) {
      try {
        rawBody = JSON.parse(text)
      } catch {
        return authJsonError({
          status: 400,
          code: "INVALID_JSON",
          message: "Send a valid JSON request body.",
        })
      }
    }
  }

  const validated = googleAuthSchema.safeParse(rawBody)
  if (!validated.success) {
    return authJsonError({
      status: 400,
      code: "VALIDATION_ERROR",
      message: "Invalid redirect parameter.",
    })
  }

  const initiated = await initiateGoogleOAuth(request, validated.data.redirect)
  if (!initiated.ok) {
    return initiated.response
  }

  const response = authJsonSuccess({ url: initiated.authorizeUrl })
  applyExpressSetCookies(response, initiated.expressResponse, request)
  return response
}

export async function GET(request: NextRequest) {
  const rawRedirect = request.nextUrl.searchParams.get("redirect") ?? undefined
  const initiated = await initiateGoogleOAuth(request, rawRedirect)

  if (!initiated.ok) {
    const fallbackUrl = new URL("/sign-in", getAppOrigin(request))
    fallbackUrl.searchParams.set("error", "oauth_unavailable")
    return NextResponse.redirect(fallbackUrl)
  }

  const response = NextResponse.redirect(initiated.authorizeUrl)
  applyExpressSetCookies(response, initiated.expressResponse, request)
  return response
}
