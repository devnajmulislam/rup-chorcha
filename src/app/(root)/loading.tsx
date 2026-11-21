import { Container } from "@/components/shared/Container"
import { ServiceGridSkeleton } from "@/components/shared/ServiceGridSkeleton"
import { Skeleton } from "@/components/ui/skeleton"

export default function HomeLoading() {
  return (
    <main className="flex-1">
      <section className="py-14 sm:py-20 lg:py-24">
        <Container className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
          <div className="flex flex-col gap-6">
            <Skeleton className="h-7 w-48 rounded-full bg-blush/80" />
            <div className="flex flex-col gap-3">
              <Skeleton className="h-14 w-full max-w-lg bg-blush/70" />
              <Skeleton className="h-14 w-4/5 max-w-md bg-blush/70" />
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-full max-w-md bg-blush/60" />
              <Skeleton className="h-5 w-3/4 max-w-sm bg-blush/60" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-11 w-40 rounded-full bg-blush/80" />
              <Skeleton className="h-11 w-36 rounded-full bg-blush/60" />
            </div>
          </div>

          <Skeleton className="mx-auto aspect-[4/5] w-full max-w-md rounded-[2rem] bg-blush/75 lg:max-w-none" />
        </Container>
      </section>

      <section className="border-y border-border/60 bg-white/60 py-16 sm:py-24">
        <Container className="flex flex-col gap-10">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-24 bg-blush/70" />
            <Skeleton className="h-10 w-64 bg-blush/80" />
          </div>
          <ServiceGridSkeleton count={6} />
        </Container>
      </section>
    </main>
  )
}
