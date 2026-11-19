import Link from "next/link"

import { LogoMark, type LogoMarkVariant } from "@/components/brand/LogoMark"
import { cn } from "cn"

type LogoProps = {
  href?: string | null
  variant?: LogoMarkVariant
  className?: string
  markClassName?: string
  wordmarkClassName?: string
  showTagline?: boolean
  taglineClassName?: string
}

function Logo({
  href = "/",
  variant = "default",
  className,
  markClassName,
  wordmarkClassName,
  showTagline = false,
  taglineClassName,
}: LogoProps) {
  const content = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark variant={variant} className={cn("size-9", markClassName)} />
      <span className="flex min-w-0 flex-col leading-none">
        <span
          className={cn(
            "font-heading text-[1.65rem] leading-none font-semibold tracking-[-0.02em]",
            variant === "reverse" ? "text-ivory" : "text-plum",
            wordmarkClassName
          )}
        >
          RupChorcha
        </span>
        {showTagline ? (
          <span
            className={cn(
              "font-script text-[1.05rem] leading-tight",
              variant === "reverse" ? "text-ivory/75" : "text-primary",
              taglineClassName
            )}
          >
            Beauty, Elegance &amp; Confidence
          </span>
        ) : null}
      </span>
    </span>
  )

  if (!href) {
    return content
  }

  return (
    <Link
      href={href}
      aria-label="RupChorcha home"
      className="inline-flex rounded-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {content}
    </Link>
  )
}

export { Logo }
export type { LogoProps }
