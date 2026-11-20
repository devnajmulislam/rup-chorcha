import { Skeleton } from "@/components/ui/skeleton"

export default function AdminOverviewLoading() {
  return (
    <div
      className="flex flex-col gap-8"
      aria-busy="true"
      aria-label="Loading admin overview"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3.5 w-28 bg-blush/60" />
          <Skeleton className="h-11 w-56 bg-blush/60" />
          <Skeleton className="h-5 w-96 max-w-full bg-blush/60" />
        </div>
        <Skeleton className="h-10 w-36 rounded-full bg-blush/60" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-4 w-36 bg-blush/60" />
              <Skeleton className="size-9 rounded-full bg-blush/60" />
            </div>
            <Skeleton className="h-9 w-16 bg-blush/60" />
          </div>
        ))}
      </div>
    </div>
  )
}
