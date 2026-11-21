"use client"

import * as React from "react"

import type { UserRole } from "@/lib/roles"

type AuthUser = {
  id: string
  name: string
  email: string
  image: string | null
  phone: string | null
  role: UserRole
  isBlocked: boolean
  emailVerified: boolean
}

type AuthActionError = {
  ok: false
  status: number
  code: string
  message: string
  fieldErrors?: Record<string, string>
}

type AuthUserResult = { ok: true; user: AuthUser } | AuthActionError
type GoogleAuthResult = { ok: true; url: string } | AuthActionError
type LogoutResult = { ok: true } | AuthActionError

type ProvidersResult = {
  emailPassword: boolean
  google: boolean
}

type SessionState = {
  user: AuthUser | null
  isPending: boolean
  blocked: boolean
  backendUnavailable: boolean
}

type AuthSessionContextValue = SessionState & {
  setUser: (user: AuthUser | null) => void
  refreshSession: () => Promise<{
    user: AuthUser | null
    blocked: boolean
    backendUnavailable: boolean
  }>
}

const AUTH_CHANNEL_NAME = "rupchorcha-auth"

const AuthSessionContext = React.createContext<AuthSessionContextValue | null>(
  null
)

async function parseJsonSafe<T>(response: Response): Promise<T | null> {
  return (await response.json().catch(() => null)) as T | null
}

function broadcastAuthChange(user: AuthUser | null) {
  if (typeof window === "undefined") {
    return
  }

  try {
    const channel = new BroadcastChannel(AUTH_CHANNEL_NAME)
    channel.postMessage({ type: "session-changed", user })
    channel.close()
  } catch {
    // BroadcastChannel may be unavailable in restricted contexts.
  }
}

async function fetchSessionFromBff(): Promise<{
  user: AuthUser | null
  blocked: boolean
  backendUnavailable: boolean
}> {
  try {
    const response = await fetch("/api/auth/session", {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
    })

    const payload = await parseJsonSafe<{
      success?: boolean
      code?: string
      data?: { authenticated?: boolean; user?: AuthUser | null }
    }>(response)

    if (response.status === 403 && payload?.code === "USER_BLOCKED") {
      return { user: null, blocked: true, backendUnavailable: false }
    }

    if (response.status >= 500 || !response.ok) {
      return { user: null, blocked: false, backendUnavailable: true }
    }

    return {
      user: payload?.data?.user ?? null,
      blocked: false,
      backendUnavailable: false,
    }
  } catch {
    return { user: null, blocked: false, backendUnavailable: true }
  }
}

function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<SessionState>({
    user: null,
    isPending: true,
    blocked: false,
    backendUnavailable: false,
  })

  const refreshSession = React.useCallback(async () => {
    const result = await fetchSessionFromBff()
    setState({
      user: result.user,
      isPending: false,
      blocked: result.blocked,
      backendUnavailable: result.backendUnavailable,
    })
    return result
  }, [])

  const setUser = React.useCallback((user: AuthUser | null) => {
    setState({
      user,
      isPending: false,
      blocked: false,
      backendUnavailable: false,
    })
    broadcastAuthChange(user)
  }, [])

  React.useEffect(() => {
    let active = true

    async function load() {
      const result = await fetchSessionFromBff()
      if (!active) {
        return
      }
      setState({
        user: result.user,
        isPending: false,
        blocked: result.blocked,
        backendUnavailable: result.backendUnavailable,
      })
    }

    void load()

    let channel: BroadcastChannel | null = null
    try {
      channel = new BroadcastChannel(AUTH_CHANNEL_NAME)
      channel.onmessage = () => {
        if (active) {
          void load()
        }
      }
    } catch {
      channel = null
    }

    return () => {
      active = false
      channel?.close()
    }
  }, [])

  const value = React.useMemo<AuthSessionContextValue>(
    () => ({
      ...state,
      setUser,
      refreshSession,
    }),
    [state, setUser, refreshSession]
  )

  return React.createElement(
    AuthSessionContext.Provider,
    { value },
    children
  )
}

function useAuthSession(): AuthSessionContextValue {
  const context = React.useContext(AuthSessionContext)
  if (!context) {
    throw new Error("useAuthSession must be used within AuthSessionProvider.")
  }

  return context
}

function toActionError(
  status: number,
  payload: {
    code?: string
    message?: string
    fieldErrors?: Record<string, string>
  } | null,
  fallbackMessage: string
): AuthActionError {
  return {
    ok: false,
    status,
    code: payload?.code || "AUTH_ERROR",
    message: payload?.message?.trim() || fallbackMessage,
    fieldErrors: payload?.fieldErrors,
  }
}

async function registerWithEmail(input: {
  name: string
  email: string
  password: string
  image?: string
}): Promise<AuthUserResult> {
  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })

    const payload = await parseJsonSafe<{
      success?: boolean
      code?: string
      message?: string
      fieldErrors?: Record<string, string>
      data?: { user?: AuthUser }
    }>(response)

    if (!response.ok || !payload?.success || !payload.data?.user) {
      return toActionError(
        response.status,
        payload,
        "We could not create your account."
      )
    }

    return { ok: true, user: payload.data.user }
  } catch {
    return {
      ok: false,
      status: 503,
      code: "NETWORK_ERROR",
      message:
        "We could not reach RupChorcha. Check your connection and try again.",
    }
  }
}

async function loginWithEmail(input: {
  email: string
  password: string
  rememberMe?: boolean
}): Promise<AuthUserResult> {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })

    const payload = await parseJsonSafe<{
      success?: boolean
      code?: string
      message?: string
      fieldErrors?: Record<string, string>
      data?: { user?: AuthUser }
    }>(response)

    if (!response.ok || !payload?.success || !payload.data?.user) {
      return toActionError(
        response.status,
        payload,
        "We could not sign you in."
      )
    }

    return { ok: true, user: payload.data.user }
  } catch {
    return {
      ok: false,
      status: 503,
      code: "NETWORK_ERROR",
      message:
        "We could not reach RupChorcha. Check your connection and try again.",
    }
  }
}

async function logoutSession(): Promise<LogoutResult> {
  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "same-origin",
    })

    const payload = await parseJsonSafe<{
      success?: boolean
      code?: string
      message?: string
    }>(response)

    if (!response.ok || !payload?.success) {
      return toActionError(
        response.status,
        payload,
        "We could not sign you out. Please try again."
      )
    }

    return { ok: true }
  } catch {
    return {
      ok: false,
      status: 503,
      code: "NETWORK_ERROR",
      message:
        "We could not reach RupChorcha. Check your connection and try again.",
    }
  }
}

async function startGoogleAuth(redirect?: string): Promise<GoogleAuthResult> {
  try {
    const response = await fetch("/api/auth/google", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(redirect ? { redirect } : {}),
    })

    const payload = await parseJsonSafe<{
      success?: boolean
      code?: string
      message?: string
      data?: { url?: string }
    }>(response)

    if (!response.ok || !payload?.success || !payload.data?.url) {
      return toActionError(
        response.status,
        payload,
        "Google sign-in could not be started. Please try again."
      )
    }

    return { ok: true, url: payload.data.url }
  } catch {
    return {
      ok: false,
      status: 503,
      code: "NETWORK_ERROR",
      message:
        "We could not reach Google sign-in. Check your connection and try again.",
    }
  }
}

async function getAuthProviders(): Promise<ProvidersResult | null> {
  try {
    const response = await fetch("/api/auth/providers", {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
    })

    const payload = await parseJsonSafe<{
      success?: boolean
      data?: { emailPassword?: boolean; google?: boolean }
    }>(response)

    if (!response.ok || !payload?.success || !payload.data) {
      return null
    }

    return {
      emailPassword: payload.data.emailPassword !== false,
      google: payload.data.google === true,
    }
  } catch {
    return null
  }
}

async function updateMyProfile(input: {
  name: string
  phone: string
  image: string | null
}): Promise<AuthUserResult> {
  try {
    const response = await fetch("/api/auth/profile", {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })

    const payload = await parseJsonSafe<{
      success?: boolean
      code?: string
      message?: string
      fieldErrors?: Record<string, string>
      data?: { user?: AuthUser }
    }>(response)

    if (!response.ok || !payload?.success || !payload.data?.user) {
      return toActionError(
        response.status,
        payload,
        "We could not save your profile."
      )
    }

    return { ok: true, user: payload.data.user }
  } catch {
    return {
      ok: false,
      status: 503,
      code: "NETWORK_ERROR",
      message:
        "We could not reach RupChorcha. Check your connection and try again.",
    }
  }
}

export {
  AuthSessionProvider,
  getAuthProviders,
  loginWithEmail,
  logoutSession,
  registerWithEmail,
  startGoogleAuth,
  updateMyProfile,
  useAuthSession,
}
export type { AuthActionError, AuthUser, ProvidersResult }
