"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2Icon, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"

function RefreshRetryButton({
  label = "Try again",
  className,
}: {
  label?: string
  className?: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={() => {
        startTransition(() => {
          router.refresh()
        })
      }}
      className={className}
    >
      {isPending ? (
        <Loader2Icon className="animate-spin" aria-hidden="true" />
      ) : (
        <RefreshCw aria-hidden="true" />
      )}
      {isPending ? "Retrying…" : label}
    </Button>
  )
}

export { RefreshRetryButton }
