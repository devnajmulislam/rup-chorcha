import type { Metadata } from "next"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { ArrowLeft, TriangleAlert } from "lucide-react"

import { ServiceForm } from "@/components/dashboard/ServiceForm"
import { PageHeader } from "@/components/shared/PageHeader"
import { RefreshRetryButton } from "@/components/shared/RefreshRetryButton"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { fetchAdminServiceById } from "@/lib/backend-api"
import { requireRole } from "@/lib/session"

export const metadata: Metadata = {
  title: "Update Service",
  description: "Update a RupChorcha service.",
}

export const dynamic = "force-dynamic"

export default async function AdminUpdateServicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await requireRole("admin")
  const { id } = await params
  const result = await fetchAdminServiceById(session.accessToken, id)

  if (!result.ok) {
    if (result.kind === "blocked") {
      redirect("/sign-in?blocked=1")
    }
    if (result.kind === "unauthorized") {
      redirect(`/sign-in?redirect=${encodeURIComponent(`/admin/services/update/${id}`)}`)
    }
    if (result.kind === "not_found") {
      notFound()
    }

    return (
      <div className="flex flex-col gap-8">
        <Link
          href="/admin/services/update"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-plum hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Choose another service
        </Link>

        <PageHeader
          eyebrow="Service catalogue"
          title="Update service"
          description="Edit service details, status, or photo."
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

  const service = result.data

  return (
    <div className="flex flex-col gap-8">
      <Link
        href="/admin/services/update"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-plum hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Choose another service
      </Link>

      <PageHeader
        eyebrow="Service catalogue"
        title="Update service"
        description={`Edit the details, status, or photo for ${service.serviceName}.`}
        actions={<StatusBadge status={service.status} />}
      />

      <ServiceForm service={service} />
    </div>
  )
}
