import * as React from "react"

import { cn } from "cn"

type SectionHeadingProps = {
  eyebrow?: string
  title: React.ReactNode
  description?: React.ReactNode
  align?: "left" | "center"
  className?: string
  titleClassName?: string
}

function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  titleClassName,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex max-w-2xl flex-col gap-3",
        align === "center" && "mx-auto items-center text-center",
        className
      )}
    >
      {eyebrow ? (
        <p className="text-xs font-semibold tracking-[0.24em] text-primary uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          "font-heading text-4xl leading-[1.05] font-medium text-balance text-foreground sm:text-5xl",
          titleClassName
        )}
      >
        {title}
      </h2>
      {description ? (
        <p className="max-w-xl text-base leading-7 text-pretty text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  )
}

export { SectionHeading }
export type { SectionHeadingProps }
