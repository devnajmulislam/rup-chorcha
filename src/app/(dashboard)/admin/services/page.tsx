import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { TriangleAlert } from "lucide-react"

import { AdminServices } from "@/components/dashboard/AdminServices"
import { PageHeader } from "@/components/shared/PageHeader"
import { RefreshRetryButton } from "@/components/shared/RefreshRetryButton"
import { fetchAdminServices } from "@/lib/backend-api"
import { SALON_CATEGORIES } from "@/lib/constants"
import type { ServiceStatus } from "@/lib/dashboard-types"
import { requireRole } from "@/lib/session"

export const metadata: Metadata = {
  title: "Manage Services",
  description:
    "Review, add, update, deactivate, and delete RupChorcha services.",
}

export const dynamic = "force-dynamic"

function singleParam(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? ""
}

function parsePageParam(raw: string): number {
  const num = Number(raw)
  return Number.isInteger(num) && num > 0 ? Math.min(num, 10_000) : 1
}

export default async function AdminServicesPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string | string[]
    category?: string | string[]
    status?: string | string[]
    page?: string | string[]
  }>
}) {
  const session = await requireRole("admin")
  const resolvedParams = await searchParams

  const search = singleParam(resolvedParams.search).slice(0, 100)
  const rawCategory = singleParam(resolvedParams.category)
  const category = (SALON_CATEGORIES as readonly string[]).includes(rawCategory)
    ? rawCategory
    : "all"
  const rawStatus = singleParam(resolvedParams.status).toLowerCase()
  const status: "all" | ServiceStatus =
    rawStatus === "active" || rawStatus === "inactive" ? rawStatus : "all"
  const page = parsePageParam(singleParam(resolvedParams.page))

  const result = await fetchAdminServices(session.accessToken, {
    search,
    category,
    status,
    sort: "newest",
    page,
    limit: 10,
  })

  if (!result.ok) {
    if (result.kind === "blocked") {
      redirect("/sign-in?blocked=1")
    }
    if (result.kind === "unauthorized") {
      redirect("/sign-in?redirect=%2Fadmin%2Fservices")
    }

    return (
      <div className="flex flex-col gap-8">
        <PageHeader
          eyebrow="Service catalogue"
          title="Manage services"
          description="Every service in the salon menu, active or inactive. Only active services are visible to customers and available to book."
        />
        <div
          role="alert"
          className="flex flex-col items-start gap-4 rounded-2xl border border-destructive/25 bg-destructive/10 p-5 text-sm text-destructive"
        >
          <p className="flex items-start gap-2">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{result.message}</span>
          </p>
          <RefreshRetryButton className="h-9 rounded-full border-destructive/30 bg-card px-4 text-xs text-foreground hover:bg-blush" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Service catalogue"
        title="Manage services"
        description="Every service in the salon menu, active or inactive. Only active services are visible to customers and available to book."
      />

      <AdminServices
        services={result.data.items}
        meta={result.data.meta}
        initialSearch={search}
        activeCategory={category}
        activeStatus={status}
      />
    </div>
  )
}
