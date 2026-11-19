export type UserRole = "customer" | "admin"

/**
 * `role` is assigned by the Express backend and is never sent by the browser.
 * Anything other than an explicit "admin" is treated as a customer so a missing
 * or malformed value can never widen access.
 */
function normalizeRole(value: unknown): UserRole {
  return value === "admin" ? "admin" : "customer"
}

function roleOf(user: unknown): UserRole {
  if (user && typeof user === "object" && "role" in user) {
    return normalizeRole((user as { role?: unknown }).role)
  }

  return "customer"
}

function dashboardPathForRole(role: UserRole) {
  return role === "admin" ? "/dashboard/admin" : "/dashboard/customer"
}

export { dashboardPathForRole, normalizeRole, roleOf }
