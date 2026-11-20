import type { LucideIcon } from "lucide-react"

import { cn } from "cn"

type StatCardProps = {
  label: string
  value: number
  icon: LucideIcon
  description?: string
  tone?: "default" | "pending" | "confirmed" | "cancelled"
  className?: string
}

const toneClasses: Record<
  NonNullable<StatCardProps["tone"]>,
  { icon: string; value: string }
> = {
  default: { icon: "bg-blush text-primary", value: "text-plum" },
  pending: { icon: "bg-warning/10 text-warning", value: "text-warning" },
  confirmed: { icon: "bg-success/10 text-success", value: "text-success" },
  cancelled: {
    icon: "bg-destructive/10 text-destructive",
    value: "text-destructive",
  },
}

function StatCard({
  label,
  value,
  icon: Icon,
  description,
  tone = "default",
  className,
}: StatCardProps) {
  const classes = toneClasses[tone]

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-5 shadow-[0_18px_40px_-34px_rgba(58,24,48,0.4)]",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm leading-5 font-medium text-muted-foreground">
          {label}
        </p>
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full",
            classes.icon
          )}
        >
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <p className={cn("font-heading text-4xl leading-none font-semibold", classes.value)}>
          {value}
        </p>
        {description ? (
          <p className="text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  )
}

export { StatCard }
export type { StatCardProps }
