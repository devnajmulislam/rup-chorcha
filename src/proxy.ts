import { NextResponse, type NextRequest } from "next/server"

import { ACCESS_TOKEN_COOKIE_NAME } from "@/lib/auth"
import { sanitizeRedirectPath } from "@/lib/roles"

function hasAnyAuthCookie(request: NextRequest): boolean {
  const cookies = request.cookies.getAll()
  return cookies.some(
    (cookie) =>
      (cookie.name === ACCESS_TOKEN_COOKIE_NAME ||
        cookie.name.includes("better-auth.session_token")) &&
      Boolean(cookie.value?.trim())
  )
}

/**
 * Optimistic cookie-presence check only. Real JWT signature, role, and live
 * blocked-user verification happen in server layouts, pages, Server Actions,
 * and the Express backend.
 */
export function proxy(request: NextRequest) {
  const rawPath = `${request.nextUrl.pathname}${request.nextUrl.search}`
  const safePath = sanitizeRedirectPath(rawPath, "")

  if (!hasAnyAuthCookie(request)) {
    const signInUrl = new URL("/sign-in", request.url)
    if (safePath) {
      signInUrl.searchParams.set("redirect", safePath)
    }
    return NextResponse.redirect(signInUrl)
  }

  const requestHeaders = new Headers(request.headers)
  if (safePath) {
    requestHeaders.set("x-pathname", safePath)
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    "/customer/:path*",
    "/admin/:path*",
    "/dashboard/:path*",
    "/services/:path+",
  ],
}
