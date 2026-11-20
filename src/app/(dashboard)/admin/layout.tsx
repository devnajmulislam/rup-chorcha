import type { ReactNode } from "react"

import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { requireRole } from "@/lib/session"

async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const session = await requireRole("admin")

  return (
    <DashboardShell
      role="admin"
      user={{
        name: session.user.name ?? "",
        email: session.user.email ?? "",
        image: session.user.image ?? null,
      }}
    >
      {children}
    </DashboardShell>
  )
}

export default AdminDashboardLayout
