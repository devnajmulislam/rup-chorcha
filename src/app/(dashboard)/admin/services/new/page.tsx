import type { Metadata } from "next"

import { ServiceForm } from "@/components/dashboard/ServiceForm"
import { PageHeader } from "@/components/shared/PageHeader"
import { requireRole } from "@/lib/session"

export const metadata: Metadata = {
  title: "Add Service",
  description: "Add a new service to the RupChorcha menu.",
}

export default async function AdminAddServicePage() {
  await requireRole("admin")

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Service catalogue"
        title="Add service"
        description="Create a new salon service. New services are Active by default and appear on the public Browse Services page unless saved as Inactive."
      />

      <ServiceForm />
    </div>
  )
}
