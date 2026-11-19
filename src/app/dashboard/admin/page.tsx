import type { Metadata } from "next"

import { Container } from "@/components/shared/Container"
import { Footer } from "@/components/shared/Footer"
import Navbar from "@/components/shared/Navbar"
import { PageHeader } from "@/components/shared/PageHeader"

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "RupChorcha staff dashboard.",
}

export default function AdminDashboardPage() {
  return (
    <div className="flex min-h-full flex-col">
      <Navbar />

      <main className="flex-1 py-14 sm:py-20">
        <Container className="flex flex-col gap-6">
          <PageHeader
            eyebrow="Staff access"
            title="Admin dashboard"
            description="You are signed in as an administrator. Service management, appointments, customers, and transactions open here once the admin dashboard is connected."
          />
        </Container>
      </main>

      <Footer />
    </div>
  )
}
