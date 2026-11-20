import {
  CircleCheck,
  CircleDollarSign,
  CircleSlash,
  CircleX,
  Clock3,
  Power,
  PowerOff,
  ShieldBan,
  type LucideIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "cn"

type StatusValue =
  | "active"
  | "inactive"
  | "blocked"
  | "pending"
  | "confirmed"
  | "cancelled"
  | "unpaid"
  | "paid"
  | "failed"

type StatusBadgeProps = {
  status: StatusValue
  className?: string
}

type StatusConfig = {
  label: string
  icon: LucideIcon
  className: string
}

const statusConfig: Record<StatusValue, StatusConfig> = {
  active: {
    label: "Active",
    icon: Power,
    className: "border-success/20 bg-success/10 text-success",
  },
  inactive: {
    label: "Inactive",
    icon: PowerOff,
    className: "border-border bg-muted text-muted-foreground",
  },
  blocked: {
    label: "Blocked",
    icon: ShieldBan,
    className: "border-destructive/20 bg-destructive/10 text-destructive",
  },
  pending: {
    label: "Pending",
    icon: Clock3,
    className: "border-warning/25 bg-warning/10 text-warning",
  },
  confirmed: {
    label: "Confirmed",
    icon: CircleCheck,
    className: "border-success/20 bg-success/10 text-success",
  },
  cancelled: {
    label: "Cancelled",
    icon: CircleX,
    className: "border-destructive/20 bg-destructive/10 text-destructive",
  },
  unpaid: {
    label: "Unpaid",
    icon: CircleSlash,
    className: "border-border bg-muted text-muted-foreground",
  },
  paid: {
    label: "Paid",
    icon: CircleDollarSign,
    className: "border-success/20 bg-success/10 text-success",
  },
  failed: {
    label: "Failed",
    icon: CircleX,
    className: "border-destructive/20 bg-destructive/10 text-destructive",
  },
}

function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Badge
      variant="outline"
      className={cn(config.className, className)}
      aria-label={`Status: ${config.label}`}
    >
      <Icon aria-hidden="true" />
      {config.label}
    </Badge>
  )
}

export { StatusBadge }
export type { StatusBadgeProps, StatusValue }
