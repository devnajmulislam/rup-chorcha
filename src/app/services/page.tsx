import type { Metadata } from "next"
import { Sparkles, TriangleAlert } from "lucide-react"

import { Container } from "@/components/shared/Container"
import { EmptyState } from "@/components/shared/EmptyState"
import { Footer } from "@/components/shared/Footer"
import { PageHeader } from "@/components/shared/PageHeader"
import { ServiceCard } from "@/components/shared/ServiceCard"
import { getActiveServices, type Service } from "@/lib/services"
import Navbar from "@/components/shared/Navbar"

export const metadata: Metadata = {
  title: "Browse Services",
  description:
    "Explore the RupChorcha menu of hair, skin, makeup, nail, and spa services.",
}

/**
 * The menu changes whenever an admin activates, deactivates, or edits a
 * service, so it is always rendered from the current catalogue.
 */
export const dynamic = "force-dynamic"

export default async function ServicesPage() {
  let services: Service[] = []
  let loadFailed = false

  try {
    services = await getActiveServices()
  } catch {
    loadFailed = true
  }

  return (
    <div className="flex min-h-full flex-col">
      <Navbar />
      <main className="flex-1 py-14 sm:py-20">
        <Container className="flex flex-col gap-8">
          <PageHeader
            eyebrow="The menu"
            title="Browse services"
            description="Every active service on the RupChorcha menu, with its price and appointment length."
          />

          {loadFailed ? (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-xl bg-destructive/10 px-3.5 py-3 text-sm text-destructive"
            >
              <TriangleAlert
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              We could not load the service menu right now. Refresh the page to
              try again.
            </p>
          ) : null}

          {!loadFailed && services.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="The menu is being refreshed"
              description="No services are available to browse right now. Please check back soon."
            />
          ) : null}

          {services.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          ) : null}
        </Container>
      </main>

      <Footer />
    </div>
  )
}
