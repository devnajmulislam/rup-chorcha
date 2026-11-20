import { Skeleton } from "@/components/ui/skeleton"

export default function CustomerOverviewLoading() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true" aria-label="Loading dashboard">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3.5 w-32 bg-blush/60" />
          <Skeleton className="h-11 w-64 bg-blush/60" />
          <Skeleton className="h-5 w-80 max-w-full bg-blush/60" />
        </div>
        <Skeleton className="h-10 w-36 rounded-full bg-blush/60" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-4 w-32 bg-blush/60" />
              <Skeleton className="size-9 rounded-full bg-blush/60" />
            </div>
            <Skeleton className="h-9 w-16 bg-blush/60" />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <Skeleton className="h-7 w-48 bg-blush/60" />
        <div className="divide-y divide-border/70 rounded-2xl border border-border/70 bg-card">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
            >
              <div className="flex flex-col gap-2">
                <Skeleton className="h-6 w-52 bg-blush/60" />
                <Skeleton className="h-4 w-64 bg-blush/60" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20 rounded-full bg-blush/60" />
                <Skeleton className="h-6 w-16 rounded-full bg-blush/60" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
