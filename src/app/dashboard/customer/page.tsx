import type { Metadata } from "next"
import Link from "next/link"

import { Container } from "@/components/shared/Container"
import { Footer } from "@/components/shared/Footer"
import Navbar from "@/components/shared/Navbar"
import { PageHeader } from "@/components/shared/PageHeader"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "cn"

export const metadata: Metadata = {
  title: "Customer Dashboard",
  description: "Your RupChorcha customer account.",
}

export default function CustomerDashboardPage() {
  return (
    <div className="flex min-h-full flex-col">
      <Navbar />

      <main className="flex-1 py-14 sm:py-20">
        <Container className="flex flex-col gap-6">
          <PageHeader
            eyebrow="Your account"
            title="Welcome to RupChorcha"
            description="Your account is ready. Appointment overview, bookings, and payment history open here once the customer dashboard is connected."
            actions={
              <Link
                href="/services"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-10 rounded-full px-5 text-sm"
                )}
              >
                Browse services
              </Link>
            }
          />
        </Container>
      </main>

      <Footer />
    </div>
  )
}
