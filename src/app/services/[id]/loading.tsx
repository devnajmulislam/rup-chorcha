import { Container } from "@/components/shared/Container"
import { Footer } from "@/components/shared/Footer"
import Navbar from "@/components/shared/Navbar"
import { Skeleton } from "@/components/ui/skeleton"

export default function ServiceDetailLoading() {
  return (
    <div className="flex min-h-full flex-col">
      <Navbar />
      <main className="flex-1 py-12 sm:py-16">
        <Container className="flex flex-col gap-8">
          <Skeleton className="h-5 w-40 bg-blush/70" />

          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div className="flex flex-col gap-6">
              <Skeleton className="aspect-[4/3] w-full rounded-3xl bg-blush/75" />
              <div className="flex flex-col gap-3">
                <Skeleton className="h-6 w-36 rounded-full bg-blush/80" />
                <Skeleton className="h-11 w-3/4 bg-blush/80" />
                <Skeleton className="h-5 w-full bg-blush/60" />
                <Skeleton className="h-5 w-5/6 bg-blush/60" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-24 rounded-2xl bg-blush/65" />
                <Skeleton className="h-24 rounded-2xl bg-blush/65" />
              </div>
            </div>

            <div className="flex flex-col gap-5 rounded-3xl border border-border/70 bg-card p-6 sm:p-8">
              <Skeleton className="h-8 w-52 bg-blush/80" />
              <Skeleton className="h-4 w-full bg-blush/60" />
              <Skeleton className="h-11 w-full rounded-xl bg-blush/70" />
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton
                    key={index}
                    className="h-11 rounded-xl bg-blush/65"
                  />
                ))}
              </div>
              <Skeleton className="h-24 w-full rounded-xl bg-blush/60" />
              <Skeleton className="h-11 w-full rounded-full bg-blush/80" />
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  )
}
