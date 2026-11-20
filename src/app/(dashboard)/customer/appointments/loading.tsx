import { Skeleton } from "@/components/ui/skeleton"

export default function CustomerAppointmentsLoading() {
  return (
    <div
      className="flex flex-col gap-8"
      aria-busy="true"
      aria-label="Loading appointments"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3.5 w-28 bg-blush/60" />
          <Skeleton className="h-11 w-56 bg-blush/60" />
          <Skeleton className="h-5 w-96 max-w-full bg-blush/60" />
        </div>
        <Skeleton className="h-10 w-36 rounded-full bg-blush/60" />
      </div>

      <Skeleton className="h-10 w-72 rounded-full bg-blush/60" />

      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col gap-5 rounded-2xl border border-border/70 bg-card p-4 sm:p-5"
          >
            <div className="flex flex-col gap-4 sm:flex-row">
              <Skeleton className="aspect-[4/3] w-full rounded-xl bg-blush/60 sm:aspect-square sm:w-32" />
              <div className="flex flex-1 flex-col gap-3">
                <Skeleton className="h-7 w-52 bg-blush/60" />
                <Skeleton className="h-3.5 w-28 bg-blush/60" />
                <Skeleton className="h-4 w-72 max-w-full bg-blush/60" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20 rounded-full bg-blush/60" />
                  <Skeleton className="h-6 w-16 rounded-full bg-blush/60" />
                </div>
              </div>
            </div>
            <div className="flex gap-2 border-t border-border/70 pt-4">
              <Skeleton className="h-8 w-28 rounded-full bg-blush/60" />
              <Skeleton className="h-8 w-28 rounded-full bg-blush/60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
