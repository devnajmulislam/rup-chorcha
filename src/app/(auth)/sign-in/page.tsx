import type { Metadata } from "next"
import Link from "next/link"

import { SignInForm } from "@/components/auth/SignInForm"
import { Container } from "@/components/shared/Container"
import { sanitizeRedirectPath } from "@/lib/roles"

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to your RupChorcha account with email and password or Google to manage your salon appointments.",
}

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  access_denied: "Google sign-in was cancelled before completion.",
  state_mismatch: "Your Google sign-in session expired. Please try again.",
  state_not_found: "Your Google sign-in session expired. Please try again.",
  backend_unavailable:
    "Authentication service is temporarily unavailable. Please try again shortly.",
  oauth_unavailable:
    "Google sign-in is temporarily unavailable. Use email and password or try again.",
  oauth_failed: "Google sign-in could not be completed. Please try again.",
  unsupported_provider: "That sign-in method is not supported.",
}

function firstParam(value?: string | string[]): string {
  if (Array.isArray(value)) {
    return value[0] ?? ""
  }
  return value ?? ""
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{
    blocked?: string | string[]
    redirect?: string | string[]
    error?: string | string[]
  }>
}) {
  const params = await searchParams
  const blockedParam = firstParam(params.blocked)
  const errorParam = firstParam(params.error)
  const redirectTo = sanitizeRedirectPath(firstParam(params.redirect), "")

  const isBlocked = blockedParam === "1" || errorParam === "USER_BLOCKED"
  const oauthError =
    !isBlocked && errorParam
      ? OAUTH_ERROR_MESSAGES[errorParam] ||
        "We could not complete sign-in. Please try again."
      : null

  return (
    <div className="flex min-h-full flex-col">
      <main className="flex-1 py-12 sm:py-16 lg:py-20">
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,27rem)] lg:items-start lg:gap-16">
          <div className="flex max-w-xl flex-col gap-5">
            <p className="text-xs font-semibold tracking-[0.24em] text-primary uppercase">
              Welcome back
            </p>
            <h1 className="font-heading text-4xl leading-[1.05] font-medium text-balance text-foreground sm:text-5xl">
              Your next appointment is waiting.
            </h1>
            <p className="text-base leading-7 text-pretty text-muted-foreground">
              Sign in to follow your bookings, see confirmations, and pay for
              confirmed visits without retyping a thing.
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              Still deciding?{" "}
              <Link
                href="/services"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Browse services
              </Link>{" "}
              first.
            </p>
          </div>

          <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm sm:p-8">
            <SignInForm
              blocked={isBlocked}
              oauthError={oauthError}
              redirectTo={redirectTo}
            />
          </div>
        </Container>
      </main>
    </div>
  )
}
