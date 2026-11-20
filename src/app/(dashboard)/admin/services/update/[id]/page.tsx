import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, TriangleAlert } from "lucide-react"

import { ServiceForm } from "@/components/dashboard/ServiceForm"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { getServiceById, type Service } from "@/lib/services"
import { requireRole } from "@/lib/session"

export const metadata: Metadata = {
  title: "Update Service",
  description: "Update a RupChorcha service.",
}

export default async function AdminUpdateServicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireRole("admin")

  const { id } = await params

  let service: Service | null = null
  let loadFailed = false

  try {
    service = await getServiceById(id)
  } catch {
    loadFailed = true
  }

  if (!loadFailed && !service) {
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
        description={
          service
            ? `Edit the details, status, or photo for ${service.serviceName}.`
            : "Edit service details, status, or photo."
        }
        actions={service ? <StatusBadge status={service.status} /> : null}
      />

      {loadFailed || !service ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl bg-destructive/10 px-3.5 py-3 text-sm text-destructive"
        >
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          We could not load this service right now. Refresh the page to try
          again.
        </p>
      ) : (
        <ServiceForm service={service} />
      )}
    </div>
  )
}
