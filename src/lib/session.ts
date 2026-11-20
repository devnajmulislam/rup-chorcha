import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import {
  dashboardPathForRole,
  isUserBlocked,
  roleOf,
  type UserRole,
} from "@/lib/roles"

async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    redirect("/sign-in")
  }

  if (isUserBlocked(session.user)) {
    redirect("/sign-in?blocked=1")
  }

  return session
}

/**
 * Server-side role guard. The router only hides links; this is what actually
 * stops a customer opening the admin dashboard and the other way around.
 */
async function requireRole(role: UserRole) {
  const session = await requireSession()
  const actualRole = roleOf(session.user)

  if (actualRole !== role) {
    redirect(dashboardPathForRole(actualRole))
  }

  return session
}

export { requireRole, requireSession }
