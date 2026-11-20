import type { Metadata } from "next"

import { Container } from "@/components/shared/Container"
import { Footer } from "@/components/shared/Footer"
import { PageHeader } from "@/components/shared/PageHeader"

export const metadata: Metadata = {
  title: "Browse Services",
  description:
    "Explore the RupChorcha menu of hair, skin, makeup, nail, and spa services.",
}

export default function ServicesPage() {
  return (
    <div className="flex min-h-full flex-col">
      <main className="flex-1 py-14 sm:py-20">
        <Container className="flex flex-col gap-6">
          <PageHeader
            eyebrow="The menu"
            title="Browse services"
            description="The full service catalogue with search, category filters, and pricing is being connected to the RupChorcha service API."
          />
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            Until then, the signature services on the home page show the kind of
            care you can expect.
          </p>
        </Container>
      </main>

      <Footer />
    </div>
  )
}
