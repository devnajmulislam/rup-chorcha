import type * as React from "react"

import {
  DashboardMobileNav,
  DashboardSidebar,
  type DashboardUser,
} from "@/components/dashboard/DashboardSidebar"
import { navForRole } from "@/lib/dashboard-nav"
import type { UserRole } from "@/lib/roles"

type DashboardShellProps = {
  role: UserRole
  user: DashboardUser
  children: React.ReactNode
}

function DashboardShell({ role, user, children }: DashboardShellProps) {
  const nav = navForRole(role)

  return (
    <div className="flex min-h-dvh bg-ivory">
      <DashboardSidebar role={role} nav={nav} user={user} />

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardMobileNav role={role} nav={nav} user={user} />

        <main className="flex-1 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  )
}

export { DashboardShell }
export type { DashboardShellProps }
