import Link from "next/link"
import { ArrowRight, Sparkles, TriangleAlert } from "lucide-react"

import { EmptyState } from "@/components/shared/EmptyState"
import { RefreshRetryButton } from "@/components/shared/RefreshRetryButton"
import { ServiceCard } from "@/components/shared/ServiceCard"
import { buttonVariants } from "@/components/ui/button"
import { fetchPublicServices } from "@/lib/services-api"
import { FEATURED_SERVICES_LIMIT } from "@/lib/services-query"
import { cn } from "cn"

async function FeaturedServicesSection() {
  const result = await fetchPublicServices({
    limit: FEATURED_SERVICES_LIMIT,
    page: 1,
    sort: "newest",
  })

  if (!result.ok) {
    return (
      <div
        role="alert"
        className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-destructive/25 bg-destructive/5 p-6 sm:flex-row sm:items-center"
      >
        <div className="flex items-start gap-3">
          <TriangleAlert
            className="mt-0.5 size-5 shrink-0 text-destructive"
            aria-hidden="true"
          />
          <div className="flex flex-col gap-1">
            <h3 className="font-heading text-xl font-medium text-plum">
              Could not load signature services
            </h3>
            <p className="text-sm leading-6 text-muted-foreground">
              {result.message}
            </p>
          </div>
        </div>
        <RefreshRetryButton className="rounded-full border-border bg-card text-plum hover:bg-blush" />
      </div>
    )
  }

  if (result.services.length === 0) {
    return (
      <EmptyState
        icon={Sparkles}
        title="The menu is being refreshed"
        description="Active RupChorcha services will appear here as soon as they are published."
      >
        <Link
          href="/services"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "h-10 rounded-full border-border bg-transparent px-5 text-sm hover:bg-blush hover:text-plum"
          )}
        >
          Browse services
          <ArrowRight aria-hidden="true" />
        </Link>
      </EmptyState>
    )
  }

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {result.services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>

      <p className="text-xs leading-5 text-muted-foreground">
        Service availability and final pricing are confirmed at booking.
      </p>
    </>
  )
}

export { FeaturedServicesSection }
