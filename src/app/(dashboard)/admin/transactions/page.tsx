import type { Metadata } from "next"
import { TriangleAlert } from "lucide-react"

import { AdminTransactions } from "@/components/dashboard/AdminTransactions"
import { PageHeader } from "@/components/shared/PageHeader"
import { getAllTransactions, type AdminTransaction } from "@/lib/admin"
import { requireRole } from "@/lib/session"

export const metadata: Metadata = {
  title: "Transactions",
  description:
    "Read-only log of RupChorcha Stripe checkout transactions and payment statuses.",
}

export default async function AdminTransactionsPage() {
  await requireRole("admin")

  let transactions: AdminTransaction[] = []
  let loadFailed = false

  try {
    transactions = await getAllTransactions()
  } catch {
    loadFailed = true
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Payment ledger"
        title="Transactions"
        description="Read-only record of Stripe payment sessions across all customer appointments."
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
          We could not load transactions right now. Refresh the page to try
          again.
        </p>
      ) : (
        <AdminTransactions transactions={transactions} />
      )}
    </div>
  )
}
