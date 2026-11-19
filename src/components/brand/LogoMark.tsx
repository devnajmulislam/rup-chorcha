import * as React from "react"

import { cn } from "cn"

type LogoMarkVariant = "default" | "reverse" | "monochrome"

type LogoMarkProps = React.ComponentProps<"svg"> & {
  variant?: LogoMarkVariant
  label?: string
}

const variantClasses: Record<LogoMarkVariant, string> = {
  default: "text-primary",
  reverse: "text-ivory",
  monochrome: "text-current",
}

function LogoMark({
  className,
  variant = "default",
  label,
  ...props
}: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      role={label ? "img" : undefined}
      aria-hidden={label ? undefined : true}
      className={cn("size-10 shrink-0", variantClasses[variant], className)}
      {...props}
    >
      {label ? <title>{label}</title> : null}
      <g
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M28 10C23 10 20 13 19 17C18 20 16 22 16 24C16 26 18 27 20 27C21 27 21 28 20 29C19 30 19 31 21 31C22 31 22 32 22 33C22 35 20 36 20 39C20 43 23 45 28 45V52" />
        <path d="M28 10C39 8 47 14 47 24C47 32 41 36 32 36M38 36C43 42 47 47 53 51" />
      </g>
      <circle
        cx="55"
        cy="10"
        r="1.8"
        fill="currentColor"
        className={variant === "reverse" ? "text-primary" : undefined}
      />
    </svg>
  )
}

export { LogoMark }
export type { LogoMarkProps, LogoMarkVariant }
