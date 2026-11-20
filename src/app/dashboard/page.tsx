import { redirect } from "next/navigation"

import { dashboardPathForRole, roleOf } from "@/lib/roles"
import { requireSession } from "@/lib/session"

export default async function DashboardRedirectPage() {
  const session = await requireSession()
  redirect(dashboardPathForRole(roleOf(session.user)))
}
