import type { NextRequest } from "next/server"

import {
  ACCESS_TOKEN_COOKIE_NAME,
  authJsonError,
  authJsonSuccess,
  buildBackendHeaders,
  clearAllAuthCookies,
  exchangeSessionCookieForJwt,
  fetchBackend,
  getAppOrigin,
  hasBetterAuthSessionCookie,
  normalizeAuthUser,
  resolveServerAuthSession,
  safeJson,
  serializeCookies,
  setAccessTokenCookie,
} from "@/lib/auth"
import {
  mapExpressAuthError,
  parseJsonBody,
  verifySameOriginCsrf,
  zodFieldErrors,
  type ExpressErrorBody,
} from "@/lib/auth-bff"
import { profileUpdateSchema } from "@/lib/auth-validators"

async function handleProfileGet(request: NextRequest) {
  const allCookies = request.cookies.getAll()
  const cookieHeader = serializeCookies(allCookies)
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE_NAME)?.value
  const appOrigin = getAppOrigin(request)

  const session = await resolveServerAuthSession({
    cookieHeader,
    accessToken,
    appOrigin,
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
    return response
  }

  if (session.status === "unavailable") {
    return authJsonError({
      status: 503,
      code: "BACKEND_UNAVAILABLE",
      message: session.message,
    })
  }

  if (session.status !== "authenticated") {
    const response = authJsonError({
      status: 401,
      code: "UNAUTHORIZED",
      message: "Sign in to view your profile.",
    })
    clearAllAuthCookies(response, request)
    return response
  }

  let expressResponse: Response
  try {
    expressResponse = await fetchBackend("/api/profile", {
      method: "GET",
      headers: buildBackendHeaders({
        appOrigin,
        authorization: `Bearer ${session.accessToken}`,
        request,
      }),
    })
  } catch {
    return authJsonError({
      status: 503,
      code: "BACKEND_UNAVAILABLE",
      message: "Profile service is temporarily unavailable. Please try again.",
    })
  }

  if (!expressResponse.ok) {
    const errorPayload = await safeJson<ExpressErrorBody>(expressResponse)
    const mapped = mapExpressAuthError(
      expressResponse.status,
      errorPayload,
      "We could not load your profile."
    )
    const errorResponse = authJsonError(mapped)
    if (mapped.code === "USER_BLOCKED") {
      clearAllAuthCookies(errorResponse, request)
    } else if (session.refreshed) {
      setAccessTokenCookie(
        errorResponse,
        session.accessToken,
        session.expiresAt,
        request
      )
    }
    return errorResponse
  }

  const payload = await safeJson<{ data?: unknown }>(expressResponse)
  const user = normalizeAuthUser(payload?.data) ?? session.user

  const response = authJsonSuccess({ user })
  if (session.refreshed) {
    setAccessTokenCookie(
      response,
      session.accessToken,
      session.expiresAt,
      request
    )
  }
  return response
}

async function handleProfileUpdate(request: NextRequest) {
  const csrfError = verifySameOriginCsrf(request)
  if (csrfError) {
    return csrfError
  }

  const allCookies = request.cookies.getAll()
  const cookieHeader = serializeCookies(allCookies)
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE_NAME)?.value
  const appOrigin = getAppOrigin(request)

  const session = await resolveServerAuthSession({
    cookieHeader,
    accessToken,
    appOrigin,
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
    return response
  }

  if (session.status === "unavailable") {
    return authJsonError({
      status: 503,
      code: "BACKEND_UNAVAILABLE",
      message: session.message,
    })
  }

  if (session.status !== "authenticated") {
    const response = authJsonError({
      status: 401,
      code: "UNAUTHORIZED",
      message: "Sign in to update your profile.",
    })
    clearAllAuthCookies(response, request)
    return response
  }

  const parsedBody = await parseJsonBody(request)
  if (!parsedBody.ok) {
    return parsedBody.response
  }

  const validated = profileUpdateSchema.safeParse(parsedBody.data)
  if (!validated.success) {
    return authJsonError({
      status: 400,
      code: "VALIDATION_ERROR",
      message:
        validated.error.issues[0]?.message ||
        "Check the highlighted fields and try again.",
      fieldErrors: zodFieldErrors(validated.error),
    })
  }

  let expressResponse: Response
  try {
    expressResponse = await fetchBackend("/api/profile", {
      method: "PATCH",
      headers: buildBackendHeaders({
        appOrigin,
        authorization: `Bearer ${session.accessToken}`,
        contentType: "application/json",
        request,
      }),
      body: JSON.stringify({
        name: validated.data.name,
        phone: validated.data.phone ? validated.data.phone : null,
        image: validated.data.image ?? null,
      }),
    })
  } catch {
    return authJsonError({
      status: 503,
      code: "BACKEND_UNAVAILABLE",
      message: "Profile service is temporarily unavailable. Please try again.",
    })
  }

  if (!expressResponse.ok) {
    const errorPayload = await safeJson<ExpressErrorBody>(expressResponse)
    const mapped = mapExpressAuthError(
      expressResponse.status,
      errorPayload,
      "We could not save your profile."
    )
    const errorResponse = authJsonError(mapped)
    if (mapped.code === "USER_BLOCKED") {
      clearAllAuthCookies(errorResponse, request)
    } else if (session.refreshed) {
      setAccessTokenCookie(
        errorResponse,
        session.accessToken,
        session.expiresAt,
        request
      )
    }
    return errorResponse
  }

  const payload = await safeJson<{ data?: unknown }>(expressResponse)
  const updatedUser = normalizeAuthUser(payload?.data) ?? session.user

  if (hasBetterAuthSessionCookie(allCookies)) {
    const refreshed = await exchangeSessionCookieForJwt(
      cookieHeader,
      appOrigin,
      request
    )

    if (refreshed.ok) {
      const response = authJsonSuccess({ user: refreshed.user })
      setAccessTokenCookie(
        response,
        refreshed.token,
        refreshed.expiresAt,
        request
      )
      return response
    }

    if (refreshed.code === "USER_BLOCKED") {
      const response = authJsonError({
        status: 403,
        code: "USER_BLOCKED",
        message: refreshed.message,
      })
      clearAllAuthCookies(response, request)
      return response
    }
  }

  const response = authJsonSuccess({ user: updatedUser })
  if (session.refreshed) {
    setAccessTokenCookie(
      response,
      session.accessToken,
      session.expiresAt,
      request
    )
  }
  return response
}

export async function GET(request: NextRequest) {
  return handleProfileGet(request)
}

export async function PATCH(request: NextRequest) {
  return handleProfileUpdate(request)
}

export async function POST(request: NextRequest) {
  return handleProfileUpdate(request)
}
