import * as React from "react"
import type { LucideIcon } from "lucide-react"

import { cn } from "cn"

type EmptyStateProps = {
  icon: LucideIcon
  title: string
  description: string
  children?: React.ReactNode
  className?: string
}

function EmptyState({
  icon: Icon,
  title,
  description,
  children,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center",
        className
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-blush text-primary">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="flex max-w-sm flex-col gap-1.5">
        <h3 className="font-heading text-2xl font-medium text-foreground">
          {title}
        </h3>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {children ? <div className="pt-1">{children}</div> : null}
    </div>
  )
}

export { EmptyState }
export type { EmptyStateProps }
