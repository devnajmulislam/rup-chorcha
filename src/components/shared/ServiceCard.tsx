import Image from "next/image"
import { Clock3, ImageIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDuration } from "@/lib/format"
import { cn } from "cn"

type ServiceCardData = {
  id: string
  serviceName: string
  category: string
  description: string
  price: number
  duration: number
  image: string | null
}

type ServiceCardProps = {
  service: ServiceCardData
  className?: string
}

function ServiceCard({ service, className }: ServiceCardProps) {
  return (
    <article
      className={cn(
        "group/service flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_18px_40px_-32px_rgba(58,24,48,0.45)]",
        className
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-blush">
        {service.image ? (
          <Image
            src={service.image}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 ease-out group-hover/service:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover/service:scale-100"
          />
        ) : (
          <span className="flex size-full items-center justify-center text-plum/50">
            <ImageIcon className="size-8" aria-hidden="true" />
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-plum/45 to-transparent" />
        <Badge
          variant="secondary"
          className="absolute top-3 left-3 border-white/30 bg-ivory/95 text-plum shadow-sm"
        >
          {service.category}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
        <div className="flex flex-col gap-1.5">
          <h3 className="font-heading text-2xl leading-tight font-medium text-foreground">
            {service.serviceName}
          </h3>
          {service.description ? (
            <p className="text-sm leading-6 text-muted-foreground">
              {service.description}
            </p>
          ) : null}
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4">
          <p className="font-heading text-xl font-semibold text-plum">
            {formatCurrency(service.price)}
          </p>
          <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock3 className="size-4 text-primary" aria-hidden="true" />
            {formatDuration(service.duration)}
          </p>
        </div>
      </div>
    </article>
  )
}

export { ServiceCard }
export type { ServiceCardData, ServiceCardProps }
