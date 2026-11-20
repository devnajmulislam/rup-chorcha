import type { UserRole } from "@/lib/roles"

type DashboardNavIcon =
  | "overview"
  | "appointments"
  | "profile"
  | "services"
  | "users"
  | "transactions"

type DashboardNavItem = {
  label: string
  href: string
  icon: DashboardNavIcon
}

const customerNav: DashboardNavItem[] = [
  { label: "Overview", href: "/customer", icon: "overview" },
  { label: "My Appointments", href: "/customer/appointments", icon: "appointments" },
  { label: "My Profile", href: "/customer/profile", icon: "profile" },
]

const adminNav: DashboardNavItem[] = [
  { label: "Overview", href: "/admin", icon: "overview" },
  { label: "Manage Services", href: "/admin/services", icon: "services" },
  { label: "Manage Appointments", href: "/admin/appointments", icon: "appointments" },
  { label: "Manage Users", href: "/admin/users", icon: "users" },
  { label: "Transactions", href: "/admin/transactions", icon: "transactions" },
  { label: "My Profile", href: "/admin/profile", icon: "profile" },
]

function navForRole(role: UserRole): DashboardNavItem[] {
  return role === "admin" ? adminNav : customerNav
}

/**
 * Longest matching href wins, so `/customer` is not highlighted while the
 * customer is actually inside `/customer/appointments`.
 */
function findActiveHref(nav: DashboardNavItem[], pathname: string) {
  const match = [...nav]
    .sort((a, b) => b.href.length - a.href.length)
    .find(
      (item) =>
        pathname === item.href || pathname.startsWith(`${item.href}/`)
    )

  return match?.href ?? null
}

export { findActiveHref, navForRole }
export type { DashboardNavIcon, DashboardNavItem }
