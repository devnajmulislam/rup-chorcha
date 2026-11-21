import { Container } from "@/components/shared/Container"
import { Footer } from "@/components/shared/Footer"
import Navbar from "@/components/shared/Navbar"
import { ServiceGridSkeleton } from "@/components/shared/ServiceGridSkeleton"
import { Skeleton } from "@/components/ui/skeleton"

export default function ServicesLoading() {
  return (
    <div className="flex min-h-full flex-col">
      <Navbar />
      <main className="flex-1 py-14 sm:py-20">
        <Container className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-24 bg-blush/70" />
            <Skeleton className="h-11 w-56 bg-blush/80" />
            <Skeleton className="h-5 w-full max-w-lg bg-blush/60" />
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-4 sm:p-5">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
              <Skeleton className="h-11 w-full rounded-xl bg-blush/60" />
              <Skeleton className="h-11 w-full rounded-xl bg-blush/60" />
              <Skeleton className="h-11 w-full rounded-xl bg-blush/60" />
            </div>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-9 w-28 rounded-full bg-blush/60"
                />
              ))}
            </div>
          </div>

          <ServiceGridSkeleton count={6} />
        </Container>
      </main>
      <Footer />
    </div>
  )
}
