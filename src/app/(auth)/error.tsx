"use client"

import Link from "next/link"
import { ArrowLeft, CircleAlertIcon, RotateCwIcon } from "lucide-react"

import { Container } from "@/components/shared/Container"
import { Footer } from "@/components/shared/Footer"
import Navbar from "@/components/shared/Navbar"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "cn"

export default function AuthError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  const isUnavailable =
    error?.name === "BackendUnavailableError" ||
    error?.message?.toLowerCase().includes("unavailable")

  return (
    <div className="flex min-h-full flex-col">
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex flex-1 items-center py-16">
        <Container className="max-w-xl">
          <div
            role="alert"
            className="flex flex-col items-start gap-5 rounded-3xl border border-border/70 bg-card p-6 shadow-sm sm:p-8"
          >
            <span className="flex size-11 items-center justify-center rounded-full bg-blush text-primary">
              <CircleAlertIcon className="size-5" aria-hidden="true" />
            </span>

            <div className="flex flex-col gap-2">
              <h1 className="font-heading text-3xl font-medium text-foreground">
                {isUnavailable
                  ? "Authentication server unreachable"
                  : "Sign-in page unavailable"}
              </h1>
              <p className="text-sm leading-6 text-muted-foreground">
                {isUnavailable
                  ? "We could not reach the RupChorcha authentication service right now. Please wait a moment and try again."
                  : "We ran into a temporary issue loading this account page. Try again or return to the homepage."}
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
                <ArrowLeft aria-hidden="true" />
                Back to home
              </Link>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  )
}
