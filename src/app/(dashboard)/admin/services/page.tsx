import type { Metadata } from "next"
import { TriangleAlert } from "lucide-react"

import { AdminServices } from "@/components/dashboard/AdminServices"
import { PageHeader } from "@/components/shared/PageHeader"
import { getAllServices, type Service } from "@/lib/services"
import { requireRole } from "@/lib/session"

export const metadata: Metadata = {
  title: "Manage Services",
  description: "Review, add, update, deactivate, and delete RupChorcha services.",
}

export default async function AdminServicesPage() {
  await requireRole("admin")

  let services: Service[] = []
  let loadFailed = false

  try {
    services = await getAllServices()
  } catch {
    loadFailed = true
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Service catalogue"
        title="Manage services"
        description="Every service in the salon menu, active or inactive. Only active services are visible to customers and available to book."
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
          We could not load the service catalogue right now. Refresh the page to
          try again.
        </p>
      ) : (
        <AdminServices services={services} />
      )}
    </div>
  )
}
