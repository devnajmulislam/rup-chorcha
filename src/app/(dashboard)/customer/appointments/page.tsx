import type { Metadata } from "next"
import Link from "next/link"
import { TriangleAlert } from "lucide-react"

import { CustomerAppointmentsView } from "@/components/dashboard/CustomerAppointmentsView"
import { PageHeader } from "@/components/shared/PageHeader"
import { buttonVariants } from "@/components/ui/button"
import {
  getCustomerAppointments,
  getCustomerTransactions,
  type CustomerAppointment,
  type CustomerTransaction,
} from "@/lib/appointments"
import { requireRole } from "@/lib/session"
import { cn } from "cn"

export const metadata: Metadata = {
  title: "My Appointments",
  description:
    "Every appointment request and payment record submitted under your RupChorcha account.",
}

export default async function CustomerAppointmentsPage() {
  const session = await requireRole("customer")

  let appointments: CustomerAppointment[] = []
  let transactions: CustomerTransaction[] = []
  let loadFailed = false

  try {
    ;[appointments, transactions] = await Promise.all([
      getCustomerAppointments(session.user.id),
      getCustomerTransactions(session.user.id),
    ])
  } catch {
    loadFailed = true
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Your bookings"
        title="My appointments"
        description="Only your own requests appear here. Pending requests can be cancelled; confirmed unpaid visits can be paid once checkout is ready."
        actions={
          <Link
            href="/services"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-10 rounded-full border-border bg-transparent px-5 text-sm hover:bg-blush hover:text-plum"
            )}
          >
            Book a service
          </Link>
        }
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
          We could not load your appointments right now. Refresh the page to try
          again.
        </p>
      ) : (
        <CustomerAppointmentsView
          appointments={appointments}
          transactions={transactions}
        />
      )}
    </div>
  )
}
