import type { Metadata } from "next"
import { TriangleAlert } from "lucide-react"

import { AdminUsers } from "@/components/dashboard/AdminUsers"
import { PageHeader } from "@/components/shared/PageHeader"
import { getRegisteredCustomers, type AdminCustomer } from "@/lib/admin"
import { requireRole } from "@/lib/session"

export const metadata: Metadata = {
  title: "Manage Users",
  description:
    "View registered RupChorcha customers, inspect details, and manage account access.",
}

export default async function AdminUsersPage() {
  await requireRole("admin")

  let customers: AdminCustomer[] = []
  let loadFailed = false

  try {
    customers = await getRegisteredCustomers()
  } catch {
    loadFailed = true
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Customer directory"
        title="Manage users"
        description="Registered customer accounts only. Blocked customers lose active sessions and cannot use protected platform features."
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
          We could not load registered customers right now. Refresh the page to
          try again.
        </p>
      ) : (
        <AdminUsers customers={customers} />
      )}
    </div>
  )
}
