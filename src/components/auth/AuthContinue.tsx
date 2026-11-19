"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CircleAlertIcon, Loader2Icon } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { dashboardPathForRole, roleOf } from "@/lib/roles"
import { cn } from "cn"

function AuthContinue() {
  const router = useRouter()
  const [failed, setFailed] = React.useState(false)

  React.useEffect(() => {
    let active = true

    async function redirectByRole() {
      try {
        const { data: session } = await authClient.getSession()

        if (!active) {
          return
        }

        if (!session?.user) {
          setFailed(true)
          return
        }

        router.replace(dashboardPathForRole(roleOf(session.user)))
        router.refresh()
      } catch {
        if (active) {
          setFailed(true)
        }
      }
    }

    void redirectByRole()

    return () => {
      active = false
    }
  }, [router])

  if (failed) {
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
          We could not confirm your sign-in. Please sign in again.
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
