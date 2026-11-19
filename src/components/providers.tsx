"use client"

import * as React from "react"

import { Toaster } from "@/components/ui/toast"

function Providers({ children }: { children: React.ReactNode }) {
  return <Toaster>{children}</Toaster>
}

export { Providers }
