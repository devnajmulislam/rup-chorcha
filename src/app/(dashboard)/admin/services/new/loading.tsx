import { Skeleton } from "@/components/ui/skeleton"

export default function AdminServiceFormLoading() {
  return (
    <div
      className="flex flex-col gap-8"
      aria-busy="true"
      aria-label="Loading service form"
    >
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3.5 w-32 bg-blush/60" />
        <Skeleton className="h-11 w-56 bg-blush/60" />
        <Skeleton className="h-5 w-96 max-w-full bg-blush/60" />
      </div>

      <div className="flex max-w-3xl flex-col gap-5 rounded-2xl border border-border/70 bg-card p-5 sm:p-7">
        <Skeleton className="h-11 w-full rounded-xl bg-blush/60" />
        <div className="grid gap-5 sm:grid-cols-2">
          <Skeleton className="h-11 w-full rounded-xl bg-blush/60" />
          <Skeleton className="h-11 w-full rounded-xl bg-blush/60" />
        </div>
        <Skeleton className="h-28 w-full rounded-xl bg-blush/60" />
        <div className="grid gap-5 sm:grid-cols-2">
          <Skeleton className="h-11 w-full rounded-xl bg-blush/60" />
          <Skeleton className="h-11 w-full rounded-xl bg-blush/60" />
        </div>
        <Skeleton className="h-40 w-full rounded-xl bg-blush/60" />
        <div className="flex justify-end gap-2">
          <Skeleton className="h-10 w-24 rounded-full bg-blush/60" />
          <Skeleton className="h-10 w-32 rounded-full bg-blush/60" />
        </div>
      </div>
    </div>
  )
}
