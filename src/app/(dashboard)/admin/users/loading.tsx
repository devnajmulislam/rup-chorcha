import { Skeleton } from "@/components/ui/skeleton"

export default function AdminUsersLoading() {
  return (
    <div
      className="flex flex-col gap-8"
      aria-busy="true"
      aria-label="Loading customers"
    >
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3.5 w-36 bg-blush/60" />
        <Skeleton className="h-11 w-48 bg-blush/60" />
        <Skeleton className="h-5 w-96 max-w-full bg-blush/60" />
      </div>

      <Skeleton className="h-[4.5rem] w-full rounded-2xl bg-blush/60" />

      <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-4 border-b border-border/50 py-3 last:border-b-0"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="size-9 rounded-full bg-blush/60" />
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-4 w-36 bg-blush/60" />
                <Skeleton className="h-3.5 w-48 bg-blush/60" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full bg-blush/60" />
              <Skeleton className="h-8 w-20 rounded-full bg-blush/60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
