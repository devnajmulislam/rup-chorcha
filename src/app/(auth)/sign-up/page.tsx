import type { Metadata } from "next"
import Link from "next/link"

import { SignUpForm } from "@/components/auth/SignUpForm"
import { Container } from "@/components/shared/Container"
import { Footer } from "@/components/shared/Footer"
import Navbar from "@/components/shared/Navbar"

export const metadata: Metadata = {
  title: "Sign Up",
  description:
    "Create your RupChorcha account with email and password or Google to book salon services.",
}

export default function SignUpPage() {
  return (
    <div className="flex min-h-full flex-col">

      <main className="flex-1 py-12 sm:py-16 lg:py-20">
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,27rem)] lg:items-start lg:gap-16">
          <div className="flex max-w-xl flex-col gap-5">
            <p className="text-xs font-semibold tracking-[0.24em] text-primary uppercase">
              Join RupChorcha
            </p>
            <h1 className="font-heading text-4xl leading-[1.05] font-medium text-balance text-foreground sm:text-5xl">
              Beauty, elegance and confidence — reserved for you.
            </h1>
            <p className="text-base leading-7 text-pretty text-muted-foreground">
              Your account keeps every booking, appointment status, and receipt
              together, so a visit takes a moment to arrange and nothing gets
              lost along the way.
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              Not ready to book?{" "}
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
            <SignUpForm />
          </div>
        </Container>
      </main>
    </div>
  )
}
