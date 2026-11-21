import { Skeleton } from "@/components/ui/skeleton"

export default function AdminProfileLoading() {
  return (
    <div
      className="flex flex-col gap-8"
      aria-busy="true"
      aria-label="Loading profile"
    >
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3.5 w-28 bg-blush/60" />
        <Skeleton className="h-11 w-48 bg-blush/60" />
        <Skeleton className="h-5 w-96 max-w-full bg-blush/60" />
      </div>

      <div className="flex max-w-2xl flex-col gap-6 rounded-2xl border border-border/70 bg-card p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="size-16 rounded-full bg-blush/60" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-28 bg-blush/60" />
            <Skeleton className="h-3.5 w-60 bg-blush/60" />
          </div>
        </div>

        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex flex-col gap-2">
            <Skeleton className="h-4 w-24 bg-blush/60" />
            <Skeleton className="h-11 w-full rounded-xl bg-blush/60" />
          </div>
        ))}

        <Skeleton className="h-11 w-36 rounded-full bg-blush/60" />
      </div>
    </div>
  )
}
