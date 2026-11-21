"use client"

import * as React from "react"

import { Toaster } from "@/components/ui/toast"
import { AuthSessionProvider } from "@/lib/auth-client"

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthSessionProvider>
      <Toaster>{children}</Toaster>
    </AuthSessionProvider>
  )
}

export { Providers }
