import type { ReactNode } from "react"

import { Footer } from "@/components/shared/Footer"
import Navbar from "@/components/shared/Navbar"
import { requireSession } from "@/lib/session"

export default async function PaymentLayout({
  children,
}: {
  children: ReactNode
}) {
  await requireSession("/customer/appointments")

  return (
    <>
      <Navbar />
      <main
        id="main-content"
        tabIndex={-1}
        className="min-h-[70dvh] bg-ivory py-12 sm:py-16"
      >
        {children}
      </main>
      <Footer />
    </>
  )
}
