import { Container } from "@/components/shared/Container"

export default function PaymentLoading() {
  return (
    <Container className="max-w-2xl">
      <div className="flex flex-col gap-6 rounded-3xl border border-border/70 bg-card p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-4">
          <div className="size-12 animate-pulse rounded-full bg-blush" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-4 w-32 animate-pulse rounded bg-blush" />
            <div className="h-8 w-64 animate-pulse rounded bg-blush" />
          </div>
        </div>
        <div className="h-28 w-full animate-pulse rounded-2xl bg-blush/50" />
        <div className="flex gap-3">
          <div className="h-10 w-40 animate-pulse rounded-full bg-blush" />
          <div className="h-10 w-36 animate-pulse rounded-full bg-blush/70" />
        </div>
      </div>
    </Container>
  )
}
