import type { ReactNode } from "react"

import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { requireRole } from "@/lib/session"

async function CustomerDashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await requireRole("customer")

  return (
    <DashboardShell
      role="customer"
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

export default CustomerDashboardLayout
