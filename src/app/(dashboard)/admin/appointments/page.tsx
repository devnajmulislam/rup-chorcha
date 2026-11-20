import type { Metadata } from "next"
import { TriangleAlert } from "lucide-react"

import { AdminAppointments } from "@/components/dashboard/AdminAppointments"
import { PageHeader } from "@/components/shared/PageHeader"
import { getAllAppointments, type AdminAppointment } from "@/lib/admin"
import { requireRole } from "@/lib/session"

export const metadata: Metadata = {
  title: "Manage Appointments",
  description:
    "Review all RupChorcha customer appointment requests, confirm pending visits, or cancel appointments.",
}

export default async function AdminAppointmentsPage() {
  await requireRole("admin")

  let appointments: AdminAppointment[] = []
  let loadFailed = false

  try {
    appointments = await getAllAppointments()
  } catch {
    loadFailed = true
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Appointment desk"
        title="Manage appointments"
        description="Review every customer request. Pending appointments can be confirmed; pending or confirmed appointments can be cancelled."
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
          We could not load appointments right now. Refresh the page to try
          again.
        </p>
      ) : (
        <AdminAppointments appointments={appointments} />
      )}
    </div>
  )
}
