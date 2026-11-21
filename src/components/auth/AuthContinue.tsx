"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CircleAlertIcon, Loader2Icon } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { useAuthSession } from "@/lib/auth-client"
import { resolvePostAuthDestination, roleOf } from "@/lib/roles"
import { cn } from "cn"

function AuthContinue({ redirectTo = "" }: { redirectTo?: string }) {
  const router = useRouter()
  const { refreshSession } = useAuthSession()
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  React.useEffect(() => {
    let active = true

    async function redirectByRole() {
      try {
        const result = await refreshSession()

        if (!active) {
          return
        }

        if (result.blocked) {
          router.replace("/sign-in?blocked=1")
          return
        }

        if (result.backendUnavailable) {
          setErrorMessage(
            "Authentication service is temporarily unavailable. Please try again."
          )
          return
        }

        if (!result.user) {
          setErrorMessage(
            "We could not confirm your sign-in. Please sign in again."
          )
          return
        }

        const destination = resolvePostAuthDestination(
          redirectTo,
          roleOf(result.user)
        )
        router.replace(destination)
        router.refresh()
      } catch {
        if (active) {
          setErrorMessage(
            "We could not confirm your sign-in. Please sign in again."
          )
        }
      }
    }

    void redirectByRole()

    return () => {
      active = false
    }
  }, [redirectTo, refreshSession, router])

  if (errorMessage) {
    return (
      <div className="flex flex-col items-start gap-5">
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl bg-destructive/10 px-3.5 py-3 text-sm text-destructive"
        >
          <CircleAlertIcon
            className="mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />
          {errorMessage}
        </p>
        <Link
          href="/sign-in"
          className={cn(
            buttonVariants({ size: "lg" }),
            "h-11 rounded-full px-5 text-sm"
          )}
        >
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <p
      aria-live="polite"
      className="flex items-center gap-2 text-sm text-muted-foreground"
    >
      <Loader2Icon className="animate-spin" aria-hidden="true" />
      Signing you in to your dashboard…
    </p>
  )
}

export { AuthContinue }
