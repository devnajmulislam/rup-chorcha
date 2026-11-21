import type { Metadata } from "next"

import { AuthContinue } from "@/components/auth/AuthContinue"
import { Container } from "@/components/shared/Container"
import { Footer } from "@/components/shared/Footer"
import Navbar from "@/components/shared/Navbar"
import { sanitizeRedirectPath } from "@/lib/roles"

export const metadata: Metadata = {
  title: "Signing In",
  description: "Taking you to your RupChorcha dashboard.",
}

function firstParam(value?: string | string[]): string {
  if (Array.isArray(value)) {
    return value[0] ?? ""
  }
  return value ?? ""
}

export default async function AuthContinuePage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string | string[] }>
}) {
  const params = await searchParams
  const redirectTo = sanitizeRedirectPath(firstParam(params.redirect), "")

  return (
    <div className="flex min-h-full flex-col">
      <Navbar />

      <main id="main-content" tabIndex={-1} className="flex-1 py-16 sm:py-24">
        <Container className="max-w-xl">
          <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm sm:p-8">
            <AuthContinue redirectTo={redirectTo} />
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  )
}
