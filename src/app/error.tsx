"use client"

import Link from "next/link"
import { CircleAlertIcon, RotateCwIcon } from "lucide-react"

import { Container } from "@/components/shared/Container"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "cn"

export default function AppError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  const isAuthUnavailable =
    error?.name === "BackendUnavailableError" ||
    error?.message?.toLowerCase().includes("unavailable")

  return (
    <main className="flex min-h-[70dvh] items-center py-16">
      <Container className="max-w-xl">
        <div className="flex flex-col items-start gap-5 rounded-3xl border border-border/70 bg-card p-6 shadow-sm sm:p-8">
          <span className="flex size-11 items-center justify-center rounded-full bg-blush text-primary">
            <CircleAlertIcon className="size-5" aria-hidden="true" />
          </span>

          <div className="flex flex-col gap-2">
            <h1 className="font-heading text-3xl font-medium text-foreground">
              {isAuthUnavailable
                ? "Service temporarily unavailable"
                : "Something went wrong"}
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              {isAuthUnavailable
                ? "We could not reach the RupChorcha authentication service right now. Please try again in a moment."
                : "An unexpected error prevented this page from loading. You can try again or return home."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              onClick={() => retry()}
              className="h-10 rounded-full px-5 text-sm"
            >
              <RotateCwIcon aria-hidden="true" />
              Try again
            </Button>
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-10 rounded-full border-border bg-transparent px-5 text-sm hover:bg-blush hover:text-plum"
              )}
            >
              Back to home
            </Link>
          </div>
        </div>
      </Container>
    </main>
  )
}
