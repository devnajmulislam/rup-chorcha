import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  Clock3,
  ShieldAlert,
  Sparkles,
  TriangleAlert,
} from "lucide-react"

import { AppointmentBookingForm } from "@/components/services/AppointmentBookingForm"
import { Container } from "@/components/shared/Container"
import { Footer } from "@/components/shared/Footer"
import Navbar from "@/components/shared/Navbar"
import { RefreshRetryButton } from "@/components/shared/RefreshRetryButton"
import { ServiceImage } from "@/components/shared/ServiceImage"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  SALON_TIMEZONE,
  addDaysToDateString,
  getSalonTodayDateString,
} from "@/lib/booking"
import { formatCurrency, formatDuration } from "@/lib/format"
import { roleOf } from "@/lib/roles"
import { fetchPublicServiceById } from "@/lib/services-api"
import { requireSession } from "@/lib/session"
import { cn } from "cn"

export const metadata: Metadata = {
  title: "Service Details",
  description:
    "Review service details, duration, and pricing, then request a RupChorcha appointment.",
}

export const dynamic = "force-dynamic"

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await requireSession(`/services/${encodeURIComponent(id)}`)
  const result = await fetchPublicServiceById(id)

  if (!result.ok) {
    if (result.kind === "not_found") {
      notFound()
    }

    return (
      <div className="flex min-h-full flex-col">
        <Navbar />
        <main className="flex flex-1 items-center py-16">
          <Container className="max-w-xl">
            <div
              role="alert"
              className="flex flex-col items-start gap-5 rounded-3xl border border-destructive/25 bg-card p-6 shadow-sm sm:p-8"
            >
              <span className="flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <TriangleAlert className="size-5" aria-hidden="true" />
              </span>

              <div className="flex flex-col gap-2">
                <h1 className="font-heading text-3xl font-medium text-plum">
                  {result.kind === "invalid_id"
                    ? "Invalid service ID"
                    : "Could not load service details"}
                </h1>
                <p className="text-sm leading-6 text-muted-foreground">
                  {result.kind === "invalid_id"
                    ? "The requested service link is invalid. Browse our active service menu to choose a treatment."
                    : result.message}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {result.kind === "error" ? (
                  <RefreshRetryButton className="h-10 rounded-full border-border bg-card px-5 text-sm text-plum hover:bg-blush" />
                ) : null}
                <Link
                  href="/services"
                  className={cn(
                    buttonVariants({
                      variant: result.kind === "error" ? "outline" : "default",
                      size: "lg",
                    }),
                    "h-10 gap-2 rounded-full px-5 text-sm"
                  )}
                >
                  <ArrowLeft aria-hidden="true" />
                  Browse active services
                </Link>
              </div>
            </div>
          </Container>
        </main>
        <Footer />
      </div>
    )
  }

  const { service } = result
  const isAdmin = roleOf(session.user) === "admin"
  const initialDate = addDaysToDateString(getSalonTodayDateString(), 1)

  return (
    <div className="flex min-h-full flex-col">
      <Navbar />
      <main className="flex-1 py-12 sm:py-16">
        <Container className="flex flex-col gap-8">
          <Link
            href="/services"
            className="inline-flex w-fit items-center gap-2 text-sm font-medium text-plum transition-colors hover:text-primary focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to all services
          </Link>

          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-12">
            <div className="flex flex-col gap-6">
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border/70 bg-blush shadow-[0_24px_60px_-42px_rgba(58,24,48,0.5)]">
                <ServiceImage
                  src={service.image}
                  alt={service.serviceName}
                  priority
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
                <Badge
                  variant="secondary"
                  className="absolute top-4 left-4 border-white/30 bg-ivory/95 text-plum shadow-sm"
                >
                  {service.category}
                </Badge>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-2 text-xs font-medium tracking-[0.18em] text-primary uppercase">
                  <Sparkles className="size-3.5" aria-hidden="true" />
                  Active RupChorcha service
                </div>
                <h1 className="font-heading text-4xl leading-[1.08] font-medium text-balance text-plum sm:text-5xl">
                  {service.serviceName}
                </h1>
                <p className="max-w-prose text-base leading-7 text-pretty text-muted-foreground">
                  {service.description}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1 rounded-2xl border border-border/70 bg-card p-5">
                  <span className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
                    Service price
                  </span>
                  <span className="font-heading text-3xl font-semibold text-plum">
                    {formatCurrency(service.price)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    USD · Confirmed rate locked on booking
                  </span>
                </div>

                <div className="flex flex-col gap-1 rounded-2xl border border-border/70 bg-card p-5">
                  <span className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
                    Estimated duration
                  </span>
                  <span className="inline-flex items-center gap-2 font-heading text-3xl font-semibold text-plum">
                    <Clock3 className="size-6 text-primary" aria-hidden="true" />
                    {formatDuration(service.duration)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Salon hours: 9:00 AM – 6:00 PM ({SALON_TIMEZONE})
                  </span>
                </div>
              </div>
            </div>

            {isAdmin ? (
              <section className="flex flex-col gap-5 rounded-3xl border border-border/70 bg-card p-6 shadow-[0_18px_40px_-32px_rgba(58,24,48,0.4)] sm:p-8">
                <span className="flex size-11 items-center justify-center rounded-full bg-blush text-plum">
                  <ShieldAlert className="size-5" aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-2">
                  <h2 className="font-heading text-3xl leading-tight font-medium text-plum">
                    Admin accounts cannot submit customer appointment requests.
                  </h2>
                  <p className="text-sm leading-6 text-muted-foreground">
                    You are signed in with an administrator account. Switch to a
                    customer account to book treatments, or manage this service
                    from the admin workspace.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/admin/services"
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "h-11 rounded-full px-5 text-sm"
                    )}
                  >
                    Manage services
                  </Link>
                  <Link
                    href="/services"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "h-11 rounded-full border-border bg-transparent px-5 text-sm hover:bg-blush hover:text-plum"
                    )}
                  >
                    Back to menu
                  </Link>
                </div>
              </section>
            ) : (
              <AppointmentBookingForm
                service={service}
                initialDate={initialDate}
              />
            )}
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  )
}
