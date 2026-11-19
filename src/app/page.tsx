import Image from "next/image"
import {
  ArrowRight,
  ArrowUpRight,
  Brush,
  Droplets,
  Flower2,
  Hand,
  Heart,
  Mail,
  Palette,
  Scissors,
  Sparkles,
  type LucideIcon,
} from "lucide-react"

import { Footer } from "@/components/shared/Footer"
import Navbar from "@/components/shared/Navbar"
import { Container } from "@/components/shared/Container"
import { SectionHeading } from "@/components/shared/SectionHeading"
import { ServiceCard } from "@/components/shared/ServiceCard"
import { buttonVariants } from "@/components/ui/button"
import { demoServices } from "@/lib/demo-services"
import { cn } from "cn"

const categoryDetails: {
  name: string
  description: string
  icon: LucideIcon
}[] = [
  {
    name: "Haircut & Styling",
    description: "Shape, movement, and a finish that feels like you.",
    icon: Scissors,
  },
  {
    name: "Hair Coloring",
    description: "Tone and dimension, thoughtfully composed.",
    icon: Palette,
  },
  {
    name: "Hair Treatment",
    description: "Restorative care for soft, resilient hair.",
    icon: Droplets,
  },
  {
    name: "Facial & Skincare",
    description: "Gentle treatments for a calm, healthy glow.",
    icon: Sparkles,
  },
  {
    name: "Makeup",
    description: "Skin-first artistry for everyday and occasion.",
    icon: Brush,
  },
  {
    name: "Manicure & Pedicure",
    description: "Considered detail from shape to shine.",
    icon: Hand,
  },
  {
    name: "Spa & Massage",
    description: "Slow, restorative rituals for body and mind.",
    icon: Flower2,
  },
]

const whyPoints: { title: string; description: string; icon: LucideIcon }[] = [
  {
    title: "A thoughtful consultation",
    description:
      "We begin by listening, so every service is shaped around your hair, skin, and routine.",
    icon: Heart,
  },
  {
    title: "Detail-led artistry",
    description:
      "Precision, care, and a finish that feels considered rather than overdone.",
    icon: Sparkles,
  },
  {
    title: "A calm setting",
    description:
      "A soft, unhurried space where your appointment has room to breathe.",
    icon: Flower2,
  },
]

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <Navbar />

      <main className="flex-1">
        <section id="top" className="relative scroll-mt-24 overflow-hidden">
          <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-blush/70 blur-3xl sm:size-96" />
          <div className="pointer-events-none absolute top-32 -left-28 size-64 rounded-full border border-rose/30" />

          <Container className="relative grid gap-12 py-14 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:py-24">
            <div className="flex flex-col gap-7">
              <p className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-muted-foreground">
                <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
                A considered salon experience
              </p>

              <h1 className="max-w-xl font-heading text-5xl leading-[0.98] font-medium tracking-[-0.02em] text-balance text-foreground sm:text-6xl lg:text-7xl">
                Beauty, elegance, and{" "}
                <em className="text-primary">quiet confidence.</em>
              </h1>

              <p className="max-w-lg text-base leading-7 text-pretty text-muted-foreground sm:text-lg sm:leading-8">
                RupChorcha is a calm, detail-led salon for hair, skin, makeup,
                nails, and spa care. Thoughtful service, a soft setting, and a
                finish that feels like you.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href="#services"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "h-11 gap-2 rounded-full px-6 text-sm"
                  )}
                >
                  Explore services
                  <ArrowRight aria-hidden="true" />
                </a>
                <a
                  href="#why"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "h-11 gap-2 rounded-full border-border bg-transparent px-6 text-sm hover:bg-blush"
                  )}
                >
                  Our approach
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
                <span>Hair</span>
                <span className="size-1 rounded-full bg-rose" aria-hidden="true" />
                <span>Skin</span>
                <span className="size-1 rounded-full bg-rose" aria-hidden="true" />
                <span>Makeup</span>
                <span className="size-1 rounded-full bg-rose" aria-hidden="true" />
                <span>Spa</span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="absolute -top-4 -right-4 size-24 rounded-full bg-blush sm:size-32" />
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/70 bg-blush shadow-[0_40px_80px_-50px_rgba(58,24,48,0.55)]">
                <Image
                  src="https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=1400&q=80"
                  alt="Beauty styling in soft, natural light"
                  fill
                  priority
                  sizes="(min-width: 1024px) 44vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-5 left-4 right-4 rounded-2xl border border-border/70 bg-ivory p-4 shadow-[0_24px_50px_-30px_rgba(58,24,48,0.6)] sm:left-8 sm:right-auto sm:w-72">
                <p className="font-script text-2xl leading-none text-primary">
                  Made for you
                </p>
                <p className="mt-1.5 text-sm leading-5 text-muted-foreground">
                  A calm, considered approach to every appointment.
                </p>
              </div>
            </div>
          </Container>
        </section>

        <section
          id="services"
          className="scroll-mt-24 border-y border-border/60 bg-white/60 py-16 sm:py-24"
        >
          <Container className="flex flex-col gap-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeading
                eyebrow="The menu"
                title="Signature services"
                description="A thoughtful edit of hair, skin, makeup, nail, and spa care, each with the time and attention it deserves."
              />
              <p className="max-w-xs text-sm leading-6 text-muted-foreground sm:text-right">
                A considered selection for everyday care and special occasions.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {demoServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>

            <p className="text-xs leading-5 text-muted-foreground">
              Service availability and final pricing are confirmed at booking.
            </p>
          </Container>
        </section>

        <section
          id="categories"
          className="scroll-mt-24 bg-blush/45 py-16 sm:py-24"
        >
          <Container className="flex flex-col gap-10">
            <SectionHeading
              eyebrow="Find your ritual"
              title="Care for every part of you"
              description="From a fresh cut to a quiet hour of spa care, explore the categories that shape the RupChorcha menu."
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {categoryDetails.map((category) => {
                const Icon = category.icon

                return (
                  <div
                    key={category.name}
                    className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-ivory p-5"
                  >
                    <span className="flex size-11 items-center justify-center rounded-full bg-white text-primary shadow-sm">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <div className="flex flex-col gap-1.5">
                      <h3 className="font-heading text-xl leading-tight font-medium text-foreground">
                        {category.name}
                      </h3>
                      <p className="text-sm leading-6 text-muted-foreground">
                        {category.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </Container>
        </section>

        <section id="why" className="scroll-mt-24 py-16 sm:py-24">
          <Container className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-16">
            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="absolute -bottom-5 -left-5 size-28 rounded-full border border-rose/40" />
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-border/70 bg-blush shadow-[0_32px_70px_-48px_rgba(58,24,48,0.5)]">
                <Image
                  src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1400&q=80"
                  alt="A calm treatment room prepared for a spa service"
                  fill
                  sizes="(min-width: 1024px) 42vw, 100vw"
                  className="object-cover"
                />
              </div>
            </div>

            <div className="flex flex-col gap-8">
              <SectionHeading
                eyebrow="The RupChorcha approach"
                title="Considered from the first hello."
                description="Beauty here is personal, never rushed. We pair careful listening with skilled hands and a setting that feels softly removed from the everyday."
              />

              <div className="flex flex-col gap-5">
                {whyPoints.map((point) => {
                  const Icon = point.icon

                  return (
                    <div
                      key={point.title}
                      className="flex gap-4 border-b border-border/60 pb-5 last:border-b-0 last:pb-0"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blush text-primary">
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <div className="flex flex-col gap-1">
                        <h3 className="font-heading text-xl font-medium text-foreground">
                          {point.title}
                        </h3>
                        <p className="text-sm leading-6 text-muted-foreground">
                          {point.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </Container>
        </section>

        <section className="pb-16 sm:pb-24">
          <Container>
            <div className="flex flex-col gap-8 rounded-[2rem] bg-plum px-6 py-10 text-ivory sm:px-10 sm:py-12 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex max-w-xl flex-col gap-3">
                <p className="text-xs font-semibold tracking-[0.24em] text-rose uppercase">
                  Your next appointment
                </p>
                <h2 className="font-heading text-4xl leading-[1.05] font-medium text-balance sm:text-5xl">
                  Take a little time for yourself.
                </h2>
                <p className="text-sm leading-6 text-ivory/70 sm:text-base sm:leading-7">
                  Browse the menu, choose the care that fits your day, and we
                  will take care of the rest.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
                <a
                  href="#services"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "h-11 gap-2 rounded-full px-6 text-sm"
                  )}
                >
                  Explore services
                  <ArrowUpRight aria-hidden="true" />
                </a>
                <a
                  href="mailto:hello@rupchorcha.com"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "h-11 gap-2 rounded-full border-ivory/25 bg-transparent px-6 text-sm text-ivory hover:bg-ivory/10 hover:text-ivory"
                  )}
                >
                  <Mail aria-hidden="true" />
                  Ask a question
                </a>
              </div>
            </div>
          </Container>
        </section>
      </main>

      <Footer />
    </div>
  )
}
