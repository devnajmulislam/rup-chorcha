import type { Metadata } from "next"

import { Container } from "@/components/shared/Container"
import { Footer } from "@/components/shared/Footer"
import Navbar from "@/components/shared/Navbar"
import { PageHeader } from "@/components/shared/PageHeader"

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your RupChorcha account.",
}

export default function SignInPage() {
  return (
    <div className="flex min-h-full flex-col">
      <Navbar />

      <main className="flex-1 py-14 sm:py-20">
        <Container className="flex flex-col gap-6">
          <PageHeader
            eyebrow="Welcome back"
            title="Sign in"
            description="Sign in to book appointments, follow their status, and pay for confirmed visits."
          />
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            The sign-in form is being connected to RupChorcha authentication and
            will open here.
          </p>
        </Container>
      </main>

      <Footer />
    </div>
  )
}
