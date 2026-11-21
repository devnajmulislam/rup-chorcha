import type { NextRequest } from "next/server"

import {
  ACCESS_TOKEN_COOKIE_NAME,
  applyExpressSetCookies,
  authJsonError,
  authJsonSuccess,
  buildBackendHeaders,
  clearAllAuthCookies,
  exchangeSessionCookieForJwt,
  fetchBackend,
  getAppOrigin,
  getResponseSetCookies,
  hasBetterAuthSessionCookie,
  mergeCookieHeader,
  resolveServerAuthSession,
  safeJson,
  serializeCookies,
  setAccessTokenCookie,
  verifyJwtWithBackend,
} from "@/lib/auth"
import {
  mapExpressAuthError,
  parseJsonBody,
  verifySameOriginCsrf,
  zodFieldErrors,
  type ExpressErrorBody,
} from "@/lib/auth-bff"
import { profileUpdateSchema } from "@/lib/auth-validators"

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

  if (!hasBetterAuthSessionCookie(allCookies)) {
    return authJsonError({
      status: 401,
      code: "SESSION_REQUIRED",
      message: "Please sign in again to update your profile.",
    })
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
    expressResponse = await fetchBackend("/api/auth/update-user", {
      method: "POST",
      headers: buildBackendHeaders({
        appOrigin,
        cookieHeader,
        contentType: "application/json",
        request,
      }),
      body: JSON.stringify({
        name: validated.data.name,
        phone: validated.data.phone,
        image: validated.data.image,
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
    return authJsonError(mapped)
  }

  const mergedCookieHeader = mergeCookieHeader(
    cookieHeader,
    getResponseSetCookies(expressResponse)
  )

  const refreshed = await exchangeSessionCookieForJwt(
    mergedCookieHeader,
    appOrigin,
    request
  )

  if (refreshed.ok) {
    const response = authJsonSuccess({ user: refreshed.user })
    applyExpressSetCookies(response, expressResponse, request)
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

  const verified = await verifyJwtWithBackend(
    session.accessToken,
    appOrigin,
    request
  )
  if (verified.ok) {
    const response = authJsonSuccess({ user: verified.user })
    applyExpressSetCookies(response, expressResponse, request)
    return response
  }

  return authJsonError({
    status: 503,
    code: "BACKEND_UNAVAILABLE",
    message: "Profile saved, but your session could not be refreshed.",
  })
}

export async function PATCH(request: NextRequest) {
  return handleProfileUpdate(request)
}

export async function POST(request: NextRequest) {
  return handleProfileUpdate(request)
}
