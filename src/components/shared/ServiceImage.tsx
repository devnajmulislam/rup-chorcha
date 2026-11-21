"use client"

import * as React from "react"
import Image from "next/image"
import { ImageIcon } from "lucide-react"

import { isAllowedRemoteImageUrl } from "@/lib/services-query"
import { cn } from "cn"

type ServiceImageProps = {
  src?: string | null
  alt: string
  sizes?: string
  className?: string
  priority?: boolean
}

function ServiceImage({
  src,
  alt,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  className,
  priority = false,
}: ServiceImageProps) {
  const [failedSrc, setFailedSrc] = React.useState<string | null>(null)
  const trimmedSrc = typeof src === "string" ? src.trim() : ""
  const canRender = Boolean(
    trimmedSrc &&
      isAllowedRemoteImageUrl(trimmedSrc) &&
      failedSrc !== trimmedSrc
  )

  if (!canRender) {
    return (
      <span className="flex size-full items-center justify-center bg-blush text-plum/50">
        <ImageIcon className="size-8" aria-hidden="true" />
        <span className="sr-only">{alt}</span>
      </span>
    )
  }

  return (
    <Image
      src={trimmedSrc}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={cn("object-cover", className)}
      onError={() => setFailedSrc(trimmedSrc)}
    />
  )
}

export { ServiceImage }
export type { ServiceImageProps }
