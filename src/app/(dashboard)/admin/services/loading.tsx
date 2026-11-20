import { Skeleton } from "@/components/ui/skeleton"

export default function AdminServicesLoading() {
  return (
    <div
      className="flex flex-col gap-8"
      aria-busy="true"
      aria-label="Loading services"
    >
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3.5 w-32 bg-blush/60" />
        <Skeleton className="h-11 w-56 bg-blush/60" />
        <Skeleton className="h-5 w-96 max-w-full bg-blush/60" />
      </div>

      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-4 w-56 bg-blush/60" />
        <Skeleton className="h-10 w-32 rounded-full bg-blush/60" />
      </div>

      <Skeleton className="h-[4.5rem] w-full rounded-2xl bg-blush/60" />

      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-4 sm:flex-row sm:items-center"
          >
            <Skeleton className="size-16 shrink-0 rounded-xl bg-blush/60" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-6 w-52 bg-blush/60" />
              <Skeleton className="h-3.5 w-32 bg-blush/60" />
              <Skeleton className="h-4 w-28 bg-blush/60" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20 rounded-full bg-blush/60" />
              <Skeleton className="h-8 w-20 rounded-full bg-blush/60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
