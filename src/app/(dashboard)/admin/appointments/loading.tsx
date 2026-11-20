import { Skeleton } from "@/components/ui/skeleton"

export default function AdminAppointmentsLoading() {
  return (
    <div
      className="flex flex-col gap-8"
      aria-busy="true"
      aria-label="Loading appointments"
    >
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3.5 w-32 bg-blush/60" />
        <Skeleton className="h-11 w-64 bg-blush/60" />
        <Skeleton className="h-5 w-96 max-w-full bg-blush/60" />
      </div>

      <Skeleton className="h-[4.5rem] w-full rounded-2xl bg-blush/60" />

      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-5"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-7 w-56 bg-blush/60" />
                <Skeleton className="h-4 w-64 bg-blush/60" />
                <Skeleton className="h-4 w-72 max-w-full bg-blush/60" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20 rounded-full bg-blush/60" />
                <Skeleton className="h-6 w-16 rounded-full bg-blush/60" />
              </div>
            </div>
            <div className="flex gap-2 border-t border-border/70 pt-3">
              <Skeleton className="h-8 w-28 rounded-full bg-blush/60" />
              <Skeleton className="h-8 w-24 rounded-full bg-blush/60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
