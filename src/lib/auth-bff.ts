import { NextResponse, type NextRequest } from "next/server"
import type { z } from "zod"

import {
  ACCESS_TOKEN_COOKIE_NAME,
  applyExpressSetCookies,
  authJsonError,
  authJsonSuccess,
  clearAllAuthCookies,
  exchangeSessionCookieForJwt,
  getAppOrigin,
  getResponseSetCookies,
  hasBetterAuthSessionCookie,
  mergeCookieHeader,
  resolveServerAuthSession,
  safeJson,
  serializeCookies,
  setAccessTokenCookie,
} from "@/lib/auth"

type ExpressErrorBody = {
  code?: string
  message?: string
}

function verifySameOriginCsrf(request: NextRequest): NextResponse | null {
  const allowedOrigins = new Set<string>([getAppOrigin(request)])

  if (process.env.NODE_ENV !== "production") {
    try {
      const requestUrl = new URL(request.url)
      if (
        requestUrl.hostname === "localhost" ||
        requestUrl.hostname === "127.0.0.1"
      ) {
        allowedOrigins.add(requestUrl.origin)
      }
    } catch {
      // Ignore unparseable request URL.
    }
  }

  const secFetchSite = request.headers
    .get("sec-fetch-site")
    ?.trim()
    .toLowerCase()
  if (secFetchSite === "cross-site") {
    return authJsonError({
      status: 403,
      code: "CSRF_FORBIDDEN",
      message: "Cross-site authentication requests are not allowed.",
    })
  }

  const originHeader = request.headers.get("origin")?.trim()
  if (originHeader) {
    const normalizedOrigin = originHeader.replace(/\/+$/, "")
    if (
      normalizedOrigin.toLowerCase() === "null" ||
      !allowedOrigins.has(normalizedOrigin)
    ) {
      return authJsonError({
        status: 403,
        code: "CSRF_FORBIDDEN",
        message: "Cross-site authentication requests are not allowed.",
      })
    }
    return null
  }

  const refererHeader = request.headers.get("referer")?.trim()
  if (refererHeader) {
    try {
      const refererOrigin = new URL(refererHeader).origin
      if (!allowedOrigins.has(refererOrigin)) {
        return authJsonError({
          status: 403,
          code: "CSRF_FORBIDDEN",
          message: "Cross-site authentication requests are not allowed.",
        })
      }
    } catch {
      return authJsonError({
        status: 403,
        code: "CSRF_FORBIDDEN",
        message: "Cross-site authentication requests are not allowed.",
      })
    }
  }

  return null
}

async function parseJsonBody(
  request: NextRequest
): Promise<{ ok: true; data: unknown } | { ok: false; response: NextResponse }> {
  try {
    const data: unknown = await request.json()
    return { ok: true, data }
  } catch {
    return {
      ok: false,
      response: authJsonError({
        status: 400,
        code: "INVALID_JSON",
        message: "Send a valid JSON request body.",
      }),
    }
  }
}

function zodFieldErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {}

  for (const issue of error.issues) {
    const key = issue.path[0]
    if (typeof key === "string" && !fieldErrors[key]) {
      fieldErrors[key] = issue.message
    }
  }

  return fieldErrors
}

function mapExpressAuthError(
  status: number,
  payload: ExpressErrorBody | null,
  fallbackMessage: string
) {
  const code = payload?.code || ""
  const rawMessage = payload?.message?.trim() || ""

  if (
    code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL" ||
    code === "USER_ALREADY_EXISTS"
  ) {
    return {
      status: 409,
      code: "USER_ALREADY_EXISTS",
      message:
        "An account with this email already exists. Try signing in instead.",
    }
  }

  if (code === "WEAK_PASSWORD" || code === "PASSWORD_TOO_SHORT") {
    return {
      status: 400,
      code: "WEAK_PASSWORD",
      message:
        rawMessage ||
        "Password must be at least 6 characters and include uppercase and lowercase letters.",
    }
  }

  if (
    code === "INVALID_EMAIL_OR_PASSWORD" ||
    code === "INVALID_PASSWORD" ||
    status === 401
  ) {
    return {
      status: 401,
      code: "INVALID_CREDENTIALS",
      message: "Email or password is incorrect. Please try again.",
    }
  }

  if (
    code === "USER_BLOCKED" ||
    code === "BANNED_USER" ||
    (status === 403 && rawMessage.toLowerCase().includes("blocked"))
  ) {
    return {
      status: 403,
      code: "USER_BLOCKED",
      message: "This account is blocked. Contact RupChorcha to restore access.",
    }
  }

  if (status === 429) {
    return {
      status: 429,
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many attempts. Please wait a moment and try again.",
    }
  }

  if (status >= 500) {
    return {
      status: 503,
      code: "BACKEND_UNAVAILABLE",
      message:
        "Authentication service is temporarily unavailable. Please try again shortly.",
    }
  }

  return {
    status: status >= 400 ? status : 400,
    code: code || "AUTH_ERROR",
    message: rawMessage || fallbackMessage,
  }
}

async function finalizeExpressAuthResponse({
  expressResponse,
  existingCookieHeader,
  appOrigin,
  request,
  successStatus = 200,
  fallbackErrorMessage,
}: {
  expressResponse: Response
  existingCookieHeader: string
  appOrigin: string
  request: NextRequest
  successStatus?: number
  fallbackErrorMessage: string
}): Promise<NextResponse> {
  if (!expressResponse.ok) {
    const errorPayload = await safeJson<ExpressErrorBody>(expressResponse)
    const mapped = mapExpressAuthError(
      expressResponse.status,
      errorPayload,
      fallbackErrorMessage
    )

    const response = authJsonError(mapped)
    if (mapped.code === "USER_BLOCKED") {
      clearAllAuthCookies(response, request)
    }
    return response
  }

  const expressCookies = getResponseSetCookies(expressResponse)
  const mergedCookieHeader = mergeCookieHeader(
    existingCookieHeader,
    expressCookies
  )

  const tokenResult = await exchangeSessionCookieForJwt(
    mergedCookieHeader,
    appOrigin,
    request
  )

  if (!tokenResult.ok) {
    const response = authJsonError({
      status: tokenResult.status,
      code: tokenResult.code,
      message: tokenResult.message,
    })

    if (tokenResult.code === "USER_BLOCKED") {
      clearAllAuthCookies(response, request)
    }

    return response
  }

  const response = authJsonSuccess(
    { user: tokenResult.user },
    successStatus
  )

  applyExpressSetCookies(response, expressResponse, request)
  setAccessTokenCookie(
    response,
    tokenResult.token,
    tokenResult.expiresAt,
    request
  )

  return response
}

async function handleSessionLookup(
  request: NextRequest,
  { strict }: { strict: boolean }
): Promise<NextResponse> {
  const allCookies = request.cookies.getAll()
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE_NAME)?.value
  const hasSessionCookie = hasBetterAuthSessionCookie(allCookies)

  if (!accessToken && !hasSessionCookie) {
    return strict
      ? authJsonError({
          status: 401,
          code: "UNAUTHORIZED",
          message: "Authentication required.",
        })
      : authJsonSuccess({ authenticated: false, user: null })
  }

  const result = await resolveServerAuthSession({
    cookieHeader: serializeCookies(allCookies),
    accessToken,
    appOrigin: getAppOrigin(request),
    allowRefresh: true,
    request,
  })

  if (result.status === "blocked") {
    const response = authJsonError({
      status: 403,
      code: "USER_BLOCKED",
      message: result.message,
    })
    clearAllAuthCookies(response, request)
    return response
  }

  if (result.status === "unavailable") {
    return authJsonError({
      status: 503,
      code: "BACKEND_UNAVAILABLE",
      message: result.message,
    })
  }

  if (result.status === "invalid_token" || result.status === "unauthenticated") {
    const response = strict
      ? authJsonError({
          status: 401,
          code:
            result.status === "invalid_token" ? result.code : "UNAUTHORIZED",
          message:
            result.status === "invalid_token"
              ? result.message
              : "Authentication required.",
        })
      : authJsonSuccess({ authenticated: false, user: null })

    clearAllAuthCookies(response, request)
    return response
  }

  const response = strict
    ? authJsonSuccess({ user: result.user })
    : authJsonSuccess({ authenticated: true, user: result.user })

  if (result.refreshed) {
    setAccessTokenCookie(response, result.accessToken, result.expiresAt, request)
  }

  return response
}

export {
  finalizeExpressAuthResponse,
  handleSessionLookup,
  mapExpressAuthError,
  parseJsonBody,
  verifySameOriginCsrf,
  zodFieldErrors,
}
export type { ExpressErrorBody }
