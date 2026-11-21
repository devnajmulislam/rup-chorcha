import type { ReactNode } from "react"

import { requireSession } from "@/lib/session"

export default async function ServiceDetailLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await requireSession(`/services/${encodeURIComponent(id)}`)

  return children
}
