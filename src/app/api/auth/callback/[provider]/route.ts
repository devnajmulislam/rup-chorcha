import { NextResponse, type NextRequest } from "next/server"

import {
  applyExpressSetCookies,
  buildBackendHeaders,
  clearAllAuthCookies,
  exchangeSessionCookieForJwt,
  fetchBackend,
  getApiBaseUrl,
  getAppOrigin,
  getResponseSetCookies,
  hasBetterAuthSessionCookieHeader,
  mergeCookieHeader,
  serializeCookies,
  setAccessTokenCookie,
} from "@/lib/auth"

const SUPPORTED_PROVIDERS = new Set(["google"])

function resolveSafeSameOriginLocation(
  rawLocation: string | null,
  appOrigin: string,
  backendOrigin: string,
  fallbackPath: string
): URL {
  if (!rawLocation) {
    return new URL(fallbackPath, appOrigin)
  }

  try {
    const resolved = new URL(rawLocation, appOrigin)
    if (resolved.origin === appOrigin) {
      return resolved
    }

    // Translate Better Auth's default backend /api/auth/error redirect to /sign-in on appOrigin.
    if (
      resolved.origin === backendOrigin &&
      resolved.pathname.endsWith("/api/auth/error")
    ) {
      const signInError = new URL("/sign-in", appOrigin)
      const errCode = resolved.searchParams.get("error")
      signInError.searchParams.set("error", errCode || "oauth_failed")
      return signInError
    }
  } catch {
    // Ignore malformed Location headers and fall back safely.
  }

  return new URL(fallbackPath, appOrigin)
}

async function handleOAuthCallback(
  request: NextRequest,
  provider: string
): Promise<NextResponse> {
  const appOrigin = getAppOrigin(request)

  if (!SUPPORTED_PROVIDERS.has(provider)) {
    const notSupported = new URL("/sign-in", appOrigin)
    notSupported.searchParams.set("error", "unsupported_provider")
    return NextResponse.redirect(notSupported)
  }

  const existingCookieHeader = serializeCookies(request.cookies.getAll())
  const upstreamPath = `/api/auth/callback/${encodeURIComponent(provider)}${request.nextUrl.search}`

  const headers = buildBackendHeaders({
    appOrigin,
    cookieHeader: existingCookieHeader || undefined,
    contentType:
      request.method === "POST"
        ? request.headers.get("content-type") || undefined
        : undefined,
    request,
  })

  let expressResponse: Response
  try {
    expressResponse = await fetchBackend(upstreamPath, {
      method: request.method,
      headers,
      redirect: "manual",
      ...(request.method === "POST" ? { body: await request.text() } : {}),
    })
  } catch {
    const unavailable = new URL("/sign-in", appOrigin)
    unavailable.searchParams.set("error", "backend_unavailable")
    return NextResponse.redirect(unavailable)
  }

  const expressCookies = getResponseSetCookies(expressResponse)
  const mergedCookieHeader = mergeCookieHeader(
    existingCookieHeader,
    expressCookies
  )
  const hasSession = hasBetterAuthSessionCookieHeader(mergedCookieHeader)

  const rawLocation = expressResponse.headers.get("location")
  const fallbackPath =
    expressResponse.status >= 400 || !hasSession
      ? "/sign-in?error=oauth_failed"
      : "/auth/continue"
  const safeRedirectUrl = resolveSafeSameOriginLocation(
    rawLocation,
    appOrigin,
    getApiBaseUrl(),
    fallbackPath
  )

  const response = NextResponse.redirect(safeRedirectUrl)
  applyExpressSetCookies(response, expressResponse, request)

  if (hasSession) {
    const tokenResult = await exchangeSessionCookieForJwt(
      mergedCookieHeader,
      appOrigin,
      request
    )

    if (tokenResult.ok) {
      setAccessTokenCookie(
        response,
        tokenResult.token,
        tokenResult.expiresAt,
        request
      )
    } else if (tokenResult.code === "USER_BLOCKED") {
      const blockedResponse = NextResponse.redirect(
        new URL("/sign-in?blocked=1", appOrigin)
      )
      clearAllAuthCookies(blockedResponse, request)
      return blockedResponse
    }
  }

  return response
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ provider: string }> }
) {
  const { provider } = await context.params
  return handleOAuthCallback(request, provider)
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ provider: string }> }
) {
  const { provider } = await context.params
  return handleOAuthCallback(request, provider)
}
