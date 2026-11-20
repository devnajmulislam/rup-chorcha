import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import {
  ImageIcon,
  Plus,
  Scissors,
  Search,
  SquarePen,
  TriangleAlert,
} from "lucide-react"

import { EmptyState } from "@/components/shared/EmptyState"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatCurrency, formatDuration } from "@/lib/format"
import { getAllServices, type Service } from "@/lib/services"
import { requireRole } from "@/lib/session"
import { cn } from "cn"

export const metadata: Metadata = {
  title: "Update Service",
  description: "Choose a RupChorcha service to update.",
}

const MAX_QUERY_LENGTH = 80

export default async function AdminUpdateServicePickerPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>
}) {
  await requireRole("admin")

  const { q } = await searchParams
  const query = (Array.isArray(q) ? q[0] : q)?.trim().slice(0, MAX_QUERY_LENGTH) ?? ""

  let services: Service[] = []
  let loadFailed = false

  try {
    services = await getAllServices()
  } catch {
    loadFailed = true
  }

  const normalizedQuery = query.toLowerCase()
  const filtered = normalizedQuery
    ? services.filter((service) =>
        service.serviceName.toLowerCase().includes(normalizedQuery)
      )
    : services

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Service catalogue"
        title="Update service"
        description="Choose the service you want to update. Active and inactive services are both listed."
      />

      {loadFailed ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl bg-destructive/10 px-3.5 py-3 text-sm text-destructive"
        >
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          We could not load the service catalogue right now. Refresh the page to
          try again.
        </p>
      ) : services.length === 0 ? (
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

          {filtered.length === 0 ? (
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
            <ul className="flex flex-col gap-3">
              {filtered.map((service) => (
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
          )}
        </div>
      )}
    </div>
  )
}
