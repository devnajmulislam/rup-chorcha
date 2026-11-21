import { cache } from "react"
import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"

import {
  ACCESS_TOKEN_COOKIE_NAME,
  BackendUnavailableError,
  getAppOrigin,
  hasBetterAuthSessionCookie,
  resolveServerAuthSession,
  serializeCookies,
  type AuthUser,
  type ServerAuthResult,
} from "@/lib/auth"
import {
  dashboardPathForRole,
  roleOf,
  sanitizeRedirectPath,
  type UserRole,
} from "@/lib/roles"

type VerifiedSession = {
  user: AuthUser
  accessToken: string
}

/**
 * Memoized per React server render pass so layouts, pages, and nested Server
 * Components share a single verified Express backend check per request.
 */
const getServerSession = cache(async (): Promise<ServerAuthResult> => {
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE_NAME)?.value
  const hasSessionCookie = hasBetterAuthSessionCookie(allCookies)

  if (!accessToken && !hasSessionCookie) {
    return { status: "unauthenticated" }
  }

  return resolveServerAuthSession({
    cookieHeader: serializeCookies(allCookies),
    accessToken,
    appOrigin: getAppOrigin(),
    allowRefresh: true,
  })
})

async function requireSession(): Promise<VerifiedSession> {
  const session = await getServerSession()

  if (session.status === "blocked") {
    redirect("/sign-in?blocked=1")
  }

  if (session.status === "unavailable") {
    throw new BackendUnavailableError(session.message)
  }

  if (session.status !== "authenticated") {
    const incomingHeaders = await headers()
    const currentPath = sanitizeRedirectPath(
      incomingHeaders.get("x-pathname"),
      ""
    )

    redirect(
      currentPath
        ? `/sign-in?redirect=${encodeURIComponent(currentPath)}`
        : "/sign-in"
    )
  }

  return {
    user: session.user,
    accessToken: session.accessToken,
  }
}

/**
 * Server-side role guard. The sidebar only hides links; this is what actually
 * stops a customer opening the admin dashboard and the other way around.
 */
async function requireRole(role: UserRole): Promise<VerifiedSession> {
  const session = await requireSession()
  const actualRole = roleOf(session.user)

  if (actualRole !== role) {
    redirect(dashboardPathForRole(actualRole))
  }

  return session
}

export { getServerSession, requireRole, requireSession }
export type { VerifiedSession }
