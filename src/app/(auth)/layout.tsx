import type { ReactNode } from "react"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { dashboardPathForRole, isUserBlocked, roleOf } from "@/lib/roles"

async function AuthLayout({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (session?.user && !isUserBlocked(session.user)) {
    redirect(dashboardPathForRole(roleOf(session.user)))
  }

  return children
}

export default AuthLayout
