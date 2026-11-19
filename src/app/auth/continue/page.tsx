import type { Metadata } from "next"

import { AuthContinue } from "@/components/auth/AuthContinue"
import { Container } from "@/components/shared/Container"
import { Footer } from "@/components/shared/Footer"
import Navbar from "@/components/shared/Navbar"

export const metadata: Metadata = {
  title: "Signing In",
  description: "Taking you to your RupChorcha dashboard.",
}

export default function AuthContinuePage() {
  return (
    <div className="flex min-h-full flex-col">
      <Navbar />

      <main className="flex-1 py-16 sm:py-24">
        <Container className="max-w-xl">
          <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm sm:p-8">
            <AuthContinue />
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  )
}
