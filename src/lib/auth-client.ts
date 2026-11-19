import { createAuthClient } from "better-auth/react"

/**
 * The browser always talks to the same-origin Next.js BFF at `/api/auth/*`,
 * which forwards the request to the Express Better Auth handler. Keeping the
 * origin relative means cookies stay first-party on any preview or production
 * host instead of being pinned to a local URL.
 */
const baseURL =
  typeof window !== "undefined"
    ? window.location.origin
    : (process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000")

const authClient = createAuthClient({
  baseURL,
  fetchOptions: {
    credentials: "include",
  },
})

const { signIn, signUp, signOut, useSession } = authClient

export { authClient, signIn, signOut, signUp, useSession }
