import { NextResponse, type NextRequest } from "next/server"

import {
  ACCESS_TOKEN_COOKIE_NAME,
  AuthConfigError,
  BackendUnavailableError,
  authJsonError,
  buildBackendHeaders,
  clearAllAuthCookies,
  fetchBackend,
  getAppOrigin,
  hasBetterAuthSessionCookie,
  resolveServerAuthSession,
  safeJson,
  serializeCookies,
  setAccessTokenCookie,
  type AuthUser,
} from "@/lib/auth"
import { roleOf, type UserRole } from "@/lib/roles"

type BffSessionResult =
  | {
      ok: true
      user: AuthUser
      accessToken: string
      expiresAt: string | null
      refreshed: boolean
    }
  | {
      ok: false
      response: NextResponse
    }

type BackendErrorShape = {
  success?: boolean
  message?: string
  code?: string
  errors?: Record<string, string>
}

async function resolveBffSession(
  request: NextRequest
): Promise<BffSessionResult> {
  const allCookies = request.cookies.getAll()
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE_NAME)?.value
  const hasSessionCookie = hasBetterAuthSessionCookie(allCookies)

  if (!accessToken && !hasSessionCookie) {
    return {
      ok: false,
      response: authJsonError({
        status: 401,
        code: "UNAUTHORIZED",
        message: "Sign in to continue.",
      }),
    }
  }

  const session = await resolveServerAuthSession({
    cookieHeader: serializeCookies(allCookies),
    accessToken,
    appOrigin: getAppOrigin(request),
    allowRefresh: true,
    request,
  })

  if (session.status === "blocked") {
    const response = authJsonError({
      status: 403,
      code: "USER_BLOCKED",
      message: session.message,
    })
    clearAllAuthCookies(response, request)
    return { ok: false, response }
  }

  if (session.status === "unavailable") {
    return {
      ok: false,
      response: authJsonError({
        status: 503,
        code: "BACKEND_UNAVAILABLE",
        message: session.message,
      }),
    }
  }

  if (session.status !== "authenticated") {
    const response = authJsonError({
      status: 401,
      code:
        session.status === "invalid_token" ? session.code : "UNAUTHORIZED",
      message:
        session.status === "invalid_token"
          ? session.message
          : "Your session has expired. Sign in again to continue.",
    })
    clearAllAuthCookies(response, request)
    return { ok: false, response }
  }

  return {
    ok: true,
    user: session.user,
    accessToken: session.accessToken,
    expiresAt: session.expiresAt,
    refreshed: session.refreshed,
  }
}

async function proxyAuthenticatedJson({
  request,
  backendPath,
  method = "GET",
  body,
  allowedRoles,
}: {
  request: NextRequest
  backendPath: string
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  body?: unknown
  allowedRoles?: UserRole[]
}): Promise<NextResponse> {
  const sessionResult = await resolveBffSession(request)
  if (!sessionResult.ok) {
    return sessionResult.response
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(roleOf(sessionResult.user))
  ) {
    const forbiddenResponse = authJsonError({
      status: 403,
      code: "FORBIDDEN",
      message: "You do not have permission to perform this action.",
    })
    if (sessionResult.refreshed) {
      setAccessTokenCookie(
        forbiddenResponse,
        sessionResult.accessToken,
        sessionResult.expiresAt,
        request
      )
    }
    return forbiddenResponse
  }

  let backendResponse: Response
  try {
    backendResponse = await fetchBackend(backendPath, {
      method,
      headers: buildBackendHeaders({
        appOrigin: getAppOrigin(request),
        authorization: `Bearer ${sessionResult.accessToken}`,
        contentType: body !== undefined ? "application/json" : undefined,
        request,
      }),
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    })
  } catch (error) {
    const isConfig = error instanceof AuthConfigError
    const isUnavailable = error instanceof BackendUnavailableError
    return authJsonError({
      status: 503,
      code: isConfig ? "BACKEND_NOT_CONFIGURED" : "BACKEND_UNAVAILABLE",
      message: isUnavailable
        ? "RupChorcha booking service is temporarily unavailable. Please try again shortly."
        : "Booking service is temporarily unavailable.",
    })
  }

  const payload = await safeJson<
    BackendErrorShape & { data?: unknown; meta?: unknown }
  >(backendResponse)

  if (!backendResponse.ok) {
    const errorResponse = NextResponse.json(
      {
        success: false,
        message:
          payload?.message?.trim() ||
          "Could not complete the request. Please try again.",
        code: payload?.code || "BACKEND_REQUEST_FAILED",
        ...(payload?.errors ? { fieldErrors: payload.errors } : {}),
      },
      {
        status: backendResponse.status,
        headers: { "Cache-Control": "no-store" },
      }
    )

    if (payload?.code === "USER_BLOCKED") {
      clearAllAuthCookies(errorResponse, request)
    } else if (sessionResult.refreshed) {
      setAccessTokenCookie(
        errorResponse,
        sessionResult.accessToken,
        sessionResult.expiresAt,
        request
      )
    }

    return errorResponse
  }

  const nextResponse = NextResponse.json(
    payload ?? { success: true, data: null },
    {
      status: backendResponse.status,
      headers: { "Cache-Control": "no-store" },
    }
  )

  if (sessionResult.refreshed) {
    setAccessTokenCookie(
      nextResponse,
      sessionResult.accessToken,
      sessionResult.expiresAt,
      request
    )
  }

  return nextResponse
}

export { proxyAuthenticatedJson, resolveBffSession }
