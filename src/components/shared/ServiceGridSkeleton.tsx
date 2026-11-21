import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "cn"

function ServiceGridSkeleton({
  count = 6,
  className,
}: {
  count?: number
  className?: string
}) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading services"
      className={cn("grid gap-5 sm:grid-cols-2 lg:grid-cols-3", className)}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card"
        >
          <Skeleton className="aspect-[4/3] w-full rounded-none bg-blush/70" />
          <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
            <Skeleton className="h-7 w-3/4 bg-blush/80" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-full bg-blush/60" />
              <Skeleton className="h-4 w-5/6 bg-blush/60" />
            </div>
            <div className="mt-auto flex flex-col gap-3 border-t border-border/60 pt-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-20 bg-blush/80" />
                <Skeleton className="h-4 w-16 bg-blush/60" />
              </div>
              <Skeleton className="h-5 w-24 bg-blush/70" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export { ServiceGridSkeleton }
