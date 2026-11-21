import type { Metadata } from "next"
import Link from "next/link"
import { Search, Sparkles, TriangleAlert } from "lucide-react"

import { ServicesCatalogControls } from "@/components/services/ServicesCatalogControls"
import { ServicesPagination } from "@/components/services/ServicesPagination"
import { Container } from "@/components/shared/Container"
import { EmptyState } from "@/components/shared/EmptyState"
import { Footer } from "@/components/shared/Footer"
import Navbar from "@/components/shared/Navbar"
import { PageHeader } from "@/components/shared/PageHeader"
import { RefreshRetryButton } from "@/components/shared/RefreshRetryButton"
import { ServiceCard } from "@/components/shared/ServiceCard"
import { buttonVariants } from "@/components/ui/button"
import { fetchPublicServices } from "@/lib/services-api"
import {
  PUBLIC_SERVICES_PAGE_SIZE,
  buildServicesHref,
  normalizeServicesSearchParams,
} from "@/lib/services-query"
import { cn } from "cn"

export const metadata: Metadata = {
  title: "Browse Services",
  description:
    "Explore the live RupChorcha menu of active hair, skin, makeup, nail, and spa services.",
}

export const dynamic = "force-dynamic"

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const rawSearchParams = await searchParams
  const normalized = normalizeServicesSearchParams(rawSearchParams)

  const result = await fetchPublicServices({
    search: normalized.search,
    category: normalized.category,
    sort: normalized.sort,
    page: normalized.page,
    limit: PUBLIC_SERVICES_PAGE_SIZE,
  })

  return (
    <div className="flex min-h-full flex-col">
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1 py-14 sm:py-20">
        <Container className="flex flex-col gap-8">
          <PageHeader
            eyebrow="The menu"
            title="Browse services"
            description="Explore active RupChorcha treatments by name, category, or price."
          />

          {normalized.invalidCategory ? (
            <div
              role="status"
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-plum"
            >
              <p className="flex items-start gap-2">
                <TriangleAlert
                  className="mt-0.5 size-4 shrink-0 text-warning"
                  aria-hidden="true"
                />
                <span>
                  Category &ldquo;{normalized.invalidCategory}&rdquo; is not
                  recognized. Showing all active services instead.
                </span>
              </p>
              <Link
                href={buildServicesHref({
                  search: normalized.search,
                  sort: normalized.sort,
                })}
                className="text-xs font-medium text-primary underline underline-offset-4 hover:text-plum"
              >
                Dismiss filter
              </Link>
            </div>
          ) : null}

          <ServicesCatalogControls
            search={normalized.search}
            category={normalized.category}
            sort={normalized.sort}
            total={result.ok ? result.meta.total : 0}
            page={result.ok ? result.meta.page : normalized.page}
            limit={result.ok ? result.meta.limit : PUBLIC_SERVICES_PAGE_SIZE}
            hasActiveFilters={normalized.hasActiveFilters}
            isError={!result.ok}
          />

          {!result.ok ? (
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
                  <h2 className="font-heading text-2xl font-medium text-plum">
                    Could not load services
                  </h2>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {result.message}
                  </p>
                </div>
              </div>
              <RefreshRetryButton className="rounded-full border-border bg-card text-plum hover:bg-blush" />
            </div>
          ) : result.services.length === 0 ? (
            normalized.page > 1 && result.meta.total > 0 ? (
              <EmptyState
                icon={Sparkles}
                title="No services on this page"
                description="You have moved past the available results for this view."
              >
                <Link
                  href={buildServicesHref({
                    search: normalized.search,
                    category: normalized.category,
                    sort: normalized.sort,
                    page: 1,
                  })}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "h-10 rounded-full border-border bg-transparent px-5 text-sm hover:bg-blush hover:text-plum"
                  )}
                >
                  Back to page 1
                </Link>
              </EmptyState>
            ) : normalized.hasActiveFilters ? (
              <EmptyState
                icon={Search}
                title="No matching services"
                description="No active services match your current search or category selection."
              >
                <Link
                  href="/services"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "h-10 rounded-full border-border bg-transparent px-5 text-sm hover:bg-blush hover:text-plum"
                  )}
                >
                  Clear filters
                </Link>
              </EmptyState>
            ) : (
              <EmptyState
                icon={Sparkles}
                title="The menu is being refreshed"
                description="No services are available to browse right now. Please check back soon."
              />
            )
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {result.services.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>

              <ServicesPagination
                meta={result.meta}
                search={normalized.search}
                category={normalized.category}
                sort={normalized.sort}
              />
            </>
          )}
        </Container>
      </main>
      <Footer />
    </div>
  )
}
