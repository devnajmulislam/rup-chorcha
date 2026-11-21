import type { ReactNode } from "react"
import { redirect } from "next/navigation"

import { dashboardPathForRole, roleOf } from "@/lib/roles"
import { getServerSession } from "@/lib/session"

async function AuthLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession()

  if (session.status === "authenticated") {
    redirect(dashboardPathForRole(roleOf(session.user)))
  }

  return children
}

export default AuthLayout
