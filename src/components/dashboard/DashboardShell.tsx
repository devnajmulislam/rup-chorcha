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
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-4 focus:z-50 focus:rounded-full focus:bg-plum focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-ivory focus:shadow-md focus:outline-none focus:ring-3 focus:ring-ring/50"
      >
        Skip to main content
      </a>
      <DashboardSidebar role={role} nav={nav} user={user} />

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardMobileNav role={role} nav={nav} user={user} />

        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 px-5 py-8 sm:px-8 lg:px-10 lg:py-10"
        >
          {children}
        </main>
      </div>
    </div>
  )
}

export { DashboardShell }
export type { DashboardShellProps }
