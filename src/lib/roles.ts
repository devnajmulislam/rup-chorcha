export type UserRole = "customer" | "admin"

const NON_RETURN_AUTH_PREFIXES = [
  "/sign-in",
  "/sign-up",
  "/auth/",
  "/api/",
]

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

function isUserBlocked(user: unknown): boolean {
  return Boolean(
    user &&
    typeof user === "object" &&
    "isBlocked" in user &&
    (user as { isBlocked?: unknown }).isBlocked === true
  )
}

function dashboardPathForRole(role: UserRole) {
  return role === "admin" ? "/admin" : "/customer"
}

/**
 * Accepts only safe, relative internal paths (starting with a single `/`) so
 * `?redirect=` parameters and OAuth callback targets can never trigger open
 * redirects to external hosts or protocol-relative URLs.
 */
function sanitizeRedirectPath(rawRedirect: unknown, fallback = ""): string {
  if (typeof rawRedirect !== "string") {
    return fallback
  }

  const candidate = rawRedirect.trim()
  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) {
    return fallback
  }

  if (candidate.includes("\\") || /[\u0000-\u001f\u007f]/.test(candidate)) {
    return fallback
  }

  try {
    const parsed = new URL(candidate, "http://rupchorcha.local")
    if (parsed.origin !== "http://rupchorcha.local") {
      return fallback
    }

    const normalized = `${parsed.pathname}${parsed.search}${parsed.hash}`
    if (
      NON_RETURN_AUTH_PREFIXES.some(
        (prefix) =>
          parsed.pathname === prefix || parsed.pathname.startsWith(prefix)
      )
    ) {
      return fallback
    }

    return normalized
  } catch {
    return fallback
  }
}

function isPathAllowedForRole(path: string, role: UserRole): boolean {
  if (path === "/admin" || path.startsWith("/admin/")) {
    return role === "admin"
  }

  if (path === "/customer" || path.startsWith("/customer/")) {
    return role === "customer"
  }

  return true
}

function resolvePostAuthDestination(
  rawRedirect: unknown,
  role: UserRole
): string {
  const safePath = sanitizeRedirectPath(rawRedirect, "")
  if (safePath && isPathAllowedForRole(safePath, role)) {
    return safePath
  }

  return dashboardPathForRole(role)
}

export {
  dashboardPathForRole,
  isPathAllowedForRole,
  isUserBlocked,
  normalizeRole,
  resolvePostAuthDestination,
  roleOf,
  sanitizeRedirectPath,
}
