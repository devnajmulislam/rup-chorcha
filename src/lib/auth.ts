import { NextResponse, type NextRequest } from "next/server"

import { normalizeRole, type UserRole } from "@/lib/roles"

const ACCESS_TOKEN_COOKIE_NAME = "rc_access_token"
const REQUEST_TIMEOUT_MS = 10_000

const BETTER_AUTH_COOKIE_NAMES_TO_CLEAR = [
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
  "better-auth.session_data",
  "__Secure-better-auth.session_data",
  "better-auth.dont_remember",
  "__Secure-better-auth.dont_remember",
  "better-auth.state",
  "__Secure-better-auth.state",
] as const

type AuthUser = {
  id: string
  name: string
  email: string
  image: string | null
  phone: string | null
  role: UserRole
  isBlocked: boolean
  emailVerified: boolean
  createdAt?: string | null
  updatedAt?: string | null
}

type ServerAuthResult =
  | {
    status: "authenticated"
    user: AuthUser
    accessToken: string
    expiresAt: string | null
    refreshed: boolean
  }
  | { status: "blocked"; message: string }
  | { status: "invalid_token"; code: string; message: string }
  | { status: "unauthenticated" }
  | { status: "unavailable"; message: string }

type BackendPayload<T> = {
  success?: boolean
  data?: T
  message?: string
  code?: string
  errors?: unknown
}

type TokenExchangeResult =
  | {
    ok: true
    token: string
    expiresAt: string | null
    user: AuthUser
  }
  | {
    ok: false
    status: number
    code: string
    message: string
  }

type JwtVerifyResult =
  | {
    ok: true
    user: AuthUser
  }
  | {
    ok: false
    status: number
    code: string
    message: string
  }

class AuthConfigError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "AuthConfigError"
  }
}

class BackendUnavailableError extends Error {
  constructor(
    message = "Authentication service is temporarily unavailable. Please try again."
  ) {
    super(message)
    this.name = "BackendUnavailableError"
  }
}

function getApiBaseUrl(): string {
  const apiUrl = process.env.API_URL?.trim().replace(/\/+$/, "")
  if (!apiUrl) {
    throw new AuthConfigError("API_URL is not configured on the client server.")
  }

  return apiUrl
}

function getAppOrigin(request?: NextRequest): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, "")
  if (configured) {
    try {
      return new URL(configured).origin
    } catch {
      // Fall through if NEXT_PUBLIC_APP_URL is malformed.
    }
  }

  if (request) {
    try {
      return new URL(request.url).origin
    } catch {
      // Fall through to localhost default.
    }
  }

  return "http://localhost:3000"
}

function isHttpsRequest(request?: NextRequest): boolean {
  if (request) {
    const forwardedProto = request.headers
      .get("x-forwarded-proto")
      ?.split(",")[0]
      ?.trim()
      .toLowerCase()

    if (forwardedProto) {
      return forwardedProto === "https"
    }

    try {
      return new URL(request.url).protocol === "https:"
    } catch {
      return false
    }
  }

  return process.env.NEXT_PUBLIC_APP_URL?.trim().startsWith("https://") ?? false
}

function normalizeAuthUser(raw: unknown): AuthUser | null {
  if (!raw || typeof raw !== "object") {
    return null
  }

  const record = raw as Record<string, unknown>
  const id = typeof record.id === "string" ? record.id.trim() : ""
  const email = typeof record.email === "string" ? record.email.trim() : ""

  if (!id || !email) {
    return null
  }

  return {
    id,
    name: typeof record.name === "string" ? record.name : "",
    email,
    image:
      typeof record.image === "string" && record.image.trim()
        ? record.image.trim()
        : null,
    phone:
      typeof record.phone === "string" && record.phone.trim()
        ? record.phone.trim()
        : null,
    role: normalizeRole(record.role),
    isBlocked: record.isBlocked === true,
    emailVerified: Boolean(record.emailVerified),
    createdAt:
      typeof record.createdAt === "string" ? record.createdAt : null,
    updatedAt:
      typeof record.updatedAt === "string" ? record.updatedAt : null,
  }
}

function serializeCookies(
  cookiesList: ReadonlyArray<{ name: string; value: string }>
): string {
  return cookiesList
    .filter((item) => item.name && item.value !== undefined)
    .map((item) => `${item.name}=${item.value}`)
    .join("; ")
}

function hasBetterAuthSessionCookie(
  cookiesList: ReadonlyArray<{ name: string; value: string }>
): boolean {
  return cookiesList.some(
    (item) =>
      item.name.includes("better-auth.session_token") &&
      Boolean(item.value?.trim())
  )
}

function hasBetterAuthSessionCookieHeader(cookieHeader: string): boolean {
  if (!cookieHeader) {
    return false
  }

  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .some((part) => {
      const idx = part.indexOf("=")
      if (idx <= 0) {
        return false
      }
      const name = part.slice(0, idx).trim()
      const value = part.slice(idx + 1).trim()
      return name.includes("better-auth.session_token") && Boolean(value)
    })
}

function parseSetCookieHeaderString(rawHeader: string) {
  const parts = rawHeader.split(";").map((part) => part.trim())
  const [nameValue, ...attributeParts] = parts
  if (!nameValue) {
    return null
  }

  const eqIndex = nameValue.indexOf("=")
  if (eqIndex <= 0) {
    return null
  }

  const name = nameValue.slice(0, eqIndex).trim()
  const value = nameValue.slice(eqIndex + 1)

  let maxAge: number | undefined
  let expires: Date | undefined
  let path = "/"
  let sameSite: "lax" | "strict" | "none" = "lax"

  for (const attr of attributeParts) {
    if (!attr) {
      continue
    }

    const attrEq = attr.indexOf("=")
    const key = (attrEq >= 0 ? attr.slice(0, attrEq) : attr)
      .trim()
      .toLowerCase()
    const val = attrEq >= 0 ? attr.slice(attrEq + 1).trim() : ""

    if (key === "max-age") {
      const parsed = Number(val)
      if (Number.isFinite(parsed)) {
        maxAge = parsed
      }
    } else if (key === "expires") {
      const parsedDate = new Date(val)
      if (!Number.isNaN(parsedDate.getTime())) {
        expires = parsedDate
      }
    } else if (key === "path" && val) {
      path = val
    } else if (key === "samesite") {
      const lower = val.toLowerCase()
      if (lower === "strict" || lower === "lax" || lower === "none") {
        sameSite = lower
      }
    }
  }

  return {
    name,
    value,
    maxAge,
    expires,
    path,
    sameSite,
  }
}

function getResponseSetCookies(response: Response): string[] {
  const headersWithMethod = response.headers as Headers & {
    getSetCookie?: () => string[]
  }

  if (typeof headersWithMethod.getSetCookie === "function") {
    return headersWithMethod.getSetCookie()
  }

  const single = response.headers.get("set-cookie")
  return single ? [single] : []
}

function mergeCookieHeader(
  existingCookieHeader: string,
  setCookieHeaders: string[]
): string {
  const jar = new Map<string, string>()

  if (existingCookieHeader) {
    for (const part of existingCookieHeader.split(";")) {
      const trimmed = part.trim()
      const idx = trimmed.indexOf("=")
      if (idx > 0) {
        jar.set(trimmed.slice(0, idx).trim(), trimmed.slice(idx + 1).trim())
      }
    }
  }

  for (const raw of setCookieHeaders) {
    const parsed = parseSetCookieHeaderString(raw)
    if (!parsed) {
      continue
    }

    const isDeletion =
      parsed.maxAge === 0 ||
      parsed.value === "" ||
      (parsed.expires !== undefined && parsed.expires.getTime() <= Date.now())

    if (isDeletion) {
      jar.delete(parsed.name)
    } else {
      jar.set(parsed.name, parsed.value)
    }
  }

  return Array.from(jar.entries())
    .map(([key, val]) => `${key}=${val}`)
    .join("; ")
}

function applyExpressSetCookies(
  nextResponse: NextResponse,
  expressResponse: Response,
  request?: NextRequest
) {
  const secure = isHttpsRequest(request)
  const rawCookies = getResponseSetCookies(expressResponse)

  for (const rawCookie of rawCookies) {
    const parsed = parseSetCookieHeaderString(rawCookie)
    if (!parsed) {
      continue
    }

    nextResponse.cookies.set(parsed.name, parsed.value, {
      httpOnly: true,
      sameSite: parsed.sameSite,
      secure,
      path: parsed.path || "/",
      ...(parsed.maxAge !== undefined ? { maxAge: parsed.maxAge } : {}),
      ...(parsed.expires !== undefined ? { expires: parsed.expires } : {}),
    })
  }
}

function setAccessTokenCookie(
  nextResponse: NextResponse,
  token: string,
  expiresAt: string | null,
  request?: NextRequest
) {
  const secure = isHttpsRequest(request)
  const parsedExpiry = expiresAt ? new Date(expiresAt) : null
  const validExpiry =
    parsedExpiry && !Number.isNaN(parsedExpiry.getTime()) ? parsedExpiry : null

  nextResponse.cookies.set(ACCESS_TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    ...(validExpiry ? { expires: validExpiry } : { maxAge: 15 * 60 }),
  })
}

function clearAllAuthCookies(nextResponse: NextResponse, request?: NextRequest) {
  const secure = isHttpsRequest(request)
  const names = new Set<string>([
    ACCESS_TOKEN_COOKIE_NAME,
    ...BETTER_AUTH_COOKIE_NAMES_TO_CLEAR,
  ])

  if (request) {
    for (const cookie of request.cookies.getAll()) {
      if (
        cookie.name.startsWith("better-auth.") ||
        cookie.name.startsWith("__Secure-better-auth.")
      ) {
        names.add(cookie.name)
      }
    }
  }

  for (const name of names) {
    nextResponse.cookies.set(name, "", {
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    })
  }
}

function buildBackendHeaders({
  appOrigin,
  cookieHeader,
  authorization,
  contentType,
  request,
}: {
  appOrigin: string
  cookieHeader?: string
  authorization?: string
  contentType?: string
  request?: NextRequest
}) {
  const headers = new Headers()
  headers.set("accept", "application/json")
  headers.set("origin", appOrigin)

  if (contentType) {
    headers.set("content-type", contentType)
  }

  if (cookieHeader) {
    headers.set("cookie", cookieHeader)
  }

  if (authorization) {
    headers.set("authorization", authorization)
  }

  if (request) {
    const userAgent = request.headers.get("user-agent")
    const forwardedFor = request.headers.get("x-forwarded-for")
    if (userAgent) {
      headers.set("user-agent", userAgent)
    }
    if (forwardedFor) {
      headers.set("x-forwarded-for", forwardedFor)
    }
  }

  return headers
}

async function fetchBackend(path: string, init: RequestInit): Promise<Response> {
  const apiUrl = getApiBaseUrl()

  try {
    return await fetch(`${apiUrl}${path}`, {
      ...init,
      cache: "no-store",
      signal: init.signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
  } catch {
    throw new BackendUnavailableError()
  }
}

async function safeJson<T>(response: Response): Promise<T | null> {
  return (await response.json().catch(() => null)) as T | null
}

async function exchangeSessionCookieForJwt(
  cookieHeader: string,
  appOrigin: string,
  request?: NextRequest
): Promise<TokenExchangeResult> {
  let response: Response

  try {
    response = await fetchBackend("/api/jwt/token", {
      method: "POST",
      headers: buildBackendHeaders({
        appOrigin,
        cookieHeader,
        request,
      }),
    })
  } catch (error) {
    return {
      ok: false,
      status: 503,
      code: "BACKEND_UNAVAILABLE",
      message:
        error instanceof Error
          ? error.message
          : "Authentication service is temporarily unavailable.",
    }
  }

  const payload = await safeJson<
    BackendPayload<{
      token?: string
      expiresAt?: string | null
      user?: unknown
    }>
  >(response)

  if (!response.ok) {
    if (response.status >= 500) {
      return {
        ok: false,
        status: 503,
        code: "BACKEND_UNAVAILABLE",
        message: "Authentication service is temporarily unavailable.",
      }
    }

    return {
      ok: false,
      status: response.status,
      code: payload?.code || "UNAUTHORIZED",
      message:
        payload?.message?.trim() || "Active session required to sign in.",
    }
  }

  const token =
    typeof payload?.data?.token === "string" ? payload.data.token.trim() : ""
  const user = normalizeAuthUser(payload?.data?.user)

  if (!token || !user) {
    return {
      ok: false,
      status: 502,
      code: "INVALID_BACKEND_RESPONSE",
      message: "Authentication service returned an invalid token payload.",
    }
  }

  return {
    ok: true,
    token,
    expiresAt:
      typeof payload?.data?.expiresAt === "string"
        ? payload.data.expiresAt
        : null,
    user,
  }
}

async function verifyJwtWithBackend(
  token: string,
  appOrigin: string,
  request?: NextRequest
): Promise<JwtVerifyResult> {
  let response: Response

  try {
    response = await fetchBackend("/api/jwt/me", {
      method: "GET",
      headers: buildBackendHeaders({
        appOrigin,
        authorization: `Bearer ${token}`,
        request,
      }),
    })
  } catch (error) {
    return {
      ok: false,
      status: 503,
      code: "BACKEND_UNAVAILABLE",
      message:
        error instanceof Error
          ? error.message
          : "Authentication service is temporarily unavailable.",
    }
  }

  const payload = await safeJson<BackendPayload<{ user?: unknown }>>(response)

  if (!response.ok) {
    if (response.status >= 500) {
      return {
        ok: false,
        status: 503,
        code: "BACKEND_UNAVAILABLE",
        message: "Authentication service is temporarily unavailable.",
      }
    }

    return {
      ok: false,
      status: response.status,
      code: payload?.code || "INVALID_TOKEN",
      message: payload?.message?.trim() || "Authentication required.",
    }
  }

  const user = normalizeAuthUser(payload?.data?.user)
  if (!user) {
    return {
      ok: false,
      status: 502,
      code: "INVALID_BACKEND_RESPONSE",
      message: "Authentication service returned an invalid user payload.",
    }
  }

  return { ok: true, user }
}

async function resolveServerAuthSession({
  cookieHeader,
  accessToken,
  appOrigin,
  allowRefresh = true,
  request,
}: {
  cookieHeader: string
  accessToken?: string
  appOrigin: string
  allowRefresh?: boolean
  request?: NextRequest
}): Promise<ServerAuthResult> {
  const trimmedToken = accessToken?.trim()

  if (trimmedToken) {
    const verified = await verifyJwtWithBackend(
      trimmedToken,
      appOrigin,
      request
    )

    if (verified.ok) {
      return {
        status: "authenticated",
        user: verified.user,
        accessToken: trimmedToken,
        expiresAt: null,
        refreshed: false,
      }
    }

    if (verified.status === 403 && verified.code === "USER_BLOCKED") {
      return { status: "blocked", message: verified.message }
    }

    if (verified.status >= 500) {
      return { status: "unavailable", message: verified.message }
    }

    // Only refresh automatically when the short-lived access JWT expired and a
    // Better Auth session cookie is still active. Tampered/invalid JWTs fail closed.
    if (
      verified.code !== "TOKEN_EXPIRED" ||
      !allowRefresh ||
      !hasBetterAuthSessionCookieHeader(cookieHeader)
    ) {
      return {
        status: "invalid_token",
        code: verified.code,
        message: verified.message,
      }
    }
  }

  if (hasBetterAuthSessionCookieHeader(cookieHeader)) {
    const exchanged = await exchangeSessionCookieForJwt(
      cookieHeader,
      appOrigin,
      request
    )

    if (exchanged.ok) {
      return {
        status: "authenticated",
        user: exchanged.user,
        accessToken: exchanged.token,
        expiresAt: exchanged.expiresAt,
        refreshed: true,
      }
    }

    if (exchanged.status === 403 && exchanged.code === "USER_BLOCKED") {
      return { status: "blocked", message: exchanged.message }
    }

    if (exchanged.status >= 500) {
      return { status: "unavailable", message: exchanged.message }
    }
  }

  return { status: "unauthenticated" }
}

function authJsonSuccess<T>(data: T, status = 200) {
  return NextResponse.json(
    { success: true, data },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    }
  )
}

function authJsonError({
  status,
  message,
  code,
  fieldErrors,
}: {
  status: number
  message: string
  code: string
  fieldErrors?: Record<string, string>
}) {
  return NextResponse.json(
    {
      success: false,
      message,
      code,
      ...(fieldErrors ? { fieldErrors } : {}),
    },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    }
  )
}

export {
  ACCESS_TOKEN_COOKIE_NAME,
  AuthConfigError,
  BackendUnavailableError,
  applyExpressSetCookies,
  authJsonError,
  authJsonSuccess,
  buildBackendHeaders,
  clearAllAuthCookies,
  exchangeSessionCookieForJwt,
  fetchBackend,
  getApiBaseUrl,
  getAppOrigin,
  getResponseSetCookies,
  hasBetterAuthSessionCookie,
  hasBetterAuthSessionCookieHeader,
  isHttpsRequest,
  mergeCookieHeader,
  normalizeAuthUser,
  resolveServerAuthSession,
  safeJson,
  serializeCookies,
  setAccessTokenCookie,
  verifyJwtWithBackend,
}
export type { AuthUser, ServerAuthResult }
