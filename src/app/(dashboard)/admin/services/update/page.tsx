import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import {
  ImageIcon,
  Plus,
  Scissors,
  Search,
  SquarePen,
  TriangleAlert,
} from "lucide-react"

import { DashboardPagination } from "@/components/dashboard/DashboardPagination"
import { EmptyState } from "@/components/shared/EmptyState"
import { PageHeader } from "@/components/shared/PageHeader"
import { RefreshRetryButton } from "@/components/shared/RefreshRetryButton"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { fetchAdminServices } from "@/lib/backend-api"
import { formatCurrency, formatDuration } from "@/lib/format"
import { requireRole } from "@/lib/session"
import { cn } from "cn"

export const metadata: Metadata = {
  title: "Update Service",
  description: "Choose a RupChorcha service to update.",
}

export const dynamic = "force-dynamic"

const MAX_QUERY_LENGTH = 80

function singleParam(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? ""
}

function parsePageParam(raw: string): number {
  const num = Number(raw)
  return Number.isInteger(num) && num > 0 ? Math.min(num, 10_000) : 1
}

export default async function AdminUpdateServicePickerPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string | string[]
    page?: string | string[]
  }>
}) {
  const session = await requireRole("admin")
  const resolved = await searchParams
  const query = singleParam(resolved.q).slice(0, MAX_QUERY_LENGTH)
  const page = parsePageParam(singleParam(resolved.page))

  const result = await fetchAdminServices(session.accessToken, {
    search: query,
    status: "all",
    sort: "newest",
    page,
    limit: 10,
  })

  if (!result.ok) {
    if (result.kind === "blocked") {
      redirect("/sign-in?blocked=1")
    }
    if (result.kind === "unauthorized") {
      redirect("/sign-in?redirect=%2Fadmin%2Fservices%2Fupdate")
    }

    return (
      <div className="flex flex-col gap-8">
        <PageHeader
          eyebrow="Service catalogue"
          title="Update service"
          description="Choose the service you want to update. Active and inactive services are both listed."
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

  const { items: services, meta } = result.data

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Service catalogue"
        title="Update service"
        description="Choose the service you want to update. Active and inactive services are both listed."
      />

      {meta.total === 0 && !query ? (
        <EmptyState
          icon={Scissors}
          title="No services yet"
          description="Add a service first, then come back here to update it."
        >
          <Link
            href="/admin/services/new"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-10 rounded-full px-5 text-sm"
            )}
          >
            <Plus aria-hidden="true" />
            Add service
          </Link>
        </EmptyState>
      ) : (
        <div className="flex flex-col gap-5">
          <form
            action="/admin/services/update"
            method="get"
            role="search"
            className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-4 sm:flex-row"
          >
            <div className="relative flex-1">
              <label htmlFor="update-service-search" className="sr-only">
                Search services by name
              </label>
              <Search
                className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="update-service-search"
                name="q"
                type="search"
                maxLength={MAX_QUERY_LENGTH}
                defaultValue={query}
                placeholder="Search services by name…"
                className="h-10 rounded-xl pl-9"
              />
            </div>
            <button
              type="submit"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-10 rounded-full border-border bg-transparent px-5 text-sm hover:bg-blush hover:text-plum"
              )}
            >
              Search
            </button>
          </form>

          {services.length === 0 ? (
            <EmptyState
              icon={Scissors}
              title="No matching services"
              description={`No services match "${query}".`}
            >
              <Link
                href="/admin/services/update"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-10 rounded-full border-border bg-transparent px-5 text-sm hover:bg-blush hover:text-plum"
                )}
              >
                Clear search
              </Link>
            </EmptyState>
          ) : (
            <>
              <ul className="flex flex-col gap-3">
                {services.map((service) => (
                  <li
                    key={service.id}
                    className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-4 shadow-[0_18px_40px_-34px_rgba(58,24,48,0.4)] sm:flex-row sm:items-center"
                  >
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-blush">
                      {service.image ? (
                        <Image
                          src={service.image}
                          alt={service.serviceName}
                          fill
                          sizes="4rem"
                          className="object-cover"
                        />
                      ) : (
                        <span className="flex size-full items-center justify-center text-plum/50">
                          <ImageIcon className="size-5" aria-hidden="true" />
                        </span>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-heading text-xl leading-tight font-medium text-foreground">
                          {service.serviceName}
                        </h2>
                        <StatusBadge status={service.status} />
                      </div>
                      <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
                        {service.category}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(service.price)} ·{" "}
                        {formatDuration(service.duration)}
                      </p>
                    </div>

                    <Link
                      href={`/admin/services/update/${service.id}`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "w-fit rounded-full border-border bg-transparent hover:bg-blush hover:text-plum"
                      )}
                    >
                      <SquarePen aria-hidden="true" />
                      Update
                    </Link>
                  </li>
                ))}
              </ul>

              <DashboardPagination
                meta={meta}
                basePath="/admin/services/update"
                params={query ? { q: query } : {}}
              />
            </>
          )}
        </div>
      )}
    </div>
  )
}
