import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { TriangleAlert } from "lucide-react"

import { AdminAppointments } from "@/components/dashboard/AdminAppointments"
import { PageHeader } from "@/components/shared/PageHeader"
import { RefreshRetryButton } from "@/components/shared/RefreshRetryButton"
import { fetchAdminAppointments } from "@/lib/backend-api"
import type { AppointmentStatus } from "@/lib/dashboard-types"
import { requireRole } from "@/lib/session"

export const metadata: Metadata = {
  title: "Manage Appointments",
  description:
    "Review all RupChorcha customer appointment requests, confirm pending visits, or cancel appointments.",
}

export const dynamic = "force-dynamic"

const VALID_STATUSES = new Set<AppointmentStatus>([
  "pending",
  "confirmed",
  "cancelled",
])

function singleParam(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? ""
}

function parsePageParam(raw: string): number {
  const num = Number(raw)
  return Number.isInteger(num) && num > 0 ? Math.min(num, 10_000) : 1
}

export default async function AdminAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string | string[]
    search?: string | string[]
    page?: string | string[]
  }>
}) {
  const session = await requireRole("admin")
  const resolved = await searchParams

  const rawStatus = singleParam(resolved.status).toLowerCase()
  const statusFilter: AppointmentStatus | undefined = VALID_STATUSES.has(
    rawStatus as AppointmentStatus
  )
    ? (rawStatus as AppointmentStatus)
    : undefined
  const activeStatus: "all" | AppointmentStatus = statusFilter ?? "all"
  const search = singleParam(resolved.search).slice(0, 100)
  const page = parsePageParam(singleParam(resolved.page))

  const result = await fetchAdminAppointments(session.accessToken, {
    status: statusFilter,
    search,
    page,
    limit: 10,
  })

  if (!result.ok) {
    if (result.kind === "blocked") {
      redirect("/sign-in?blocked=1")
    }
    if (result.kind === "unauthorized") {
      redirect("/sign-in?redirect=%2Fadmin%2Fappointments")
    }

    return (
      <div className="flex flex-col gap-8">
        <PageHeader
          eyebrow="Appointment desk"
          title="Manage appointments"
          description="Review every customer request. Pending appointments can be confirmed; pending or confirmed appointments can be cancelled."
        />
        <div
          role="alert"
          className="flex flex-col items-start gap-4 rounded-2xl border border-destructive/25 bg-destructive/10 p-5 text-sm text-destructive"
        >
          <p className="flex items-start gap-2">
            <TriangleAlert
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
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
        eyebrow="Appointment desk"
        title="Manage appointments"
        description="Review every customer request. Pending appointments can be confirmed; pending or confirmed appointments can be cancelled."
      />

      <AdminAppointments
        appointments={result.data.items}
        meta={result.data.meta}
        counts={result.data.meta.counts}
        activeStatus={activeStatus}
        initialSearch={search}
      />
    </div>
  )
}
