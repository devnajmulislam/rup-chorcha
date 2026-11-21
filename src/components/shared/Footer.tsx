import Link from "next/link"
import { Clock3, Mail, MapPin } from "lucide-react"

import { Logo } from "@/components/brand/Logo"
import { Container } from "@/components/shared/Container"

const footerLinks = [
  { label: "Home", href: "/" },
  { label: "Browse Services", href: "/services" },
  { label: "Categories", href: "/#categories" },
  { label: "Why RupChorcha", href: "/#why" },
] as const

function Footer() {
  return (
    <footer id="contact" className="scroll-mt-24 bg-plum text-ivory">
      <Container className="py-14 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.8fr_0.8fr]">
          <div className="flex max-w-sm flex-col gap-5">
            <Logo
              variant="reverse"
              showTagline
              wordmarkClassName="text-[1.9rem]"
              taglineClassName="text-[1.15rem]"
            />
            <p className="text-sm leading-6 text-ivory/80">
              A considered space for beauty, care, and the quiet confidence that
              comes from feeling like yourself.
            </p>
          </div>

          <nav aria-label="Footer navigation" className="flex flex-col gap-3">
            <h2 className="font-sans text-xs font-semibold tracking-[0.22em] text-rose uppercase">
              Explore
            </h2>
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="w-fit py-0.5 text-sm text-ivory/85 transition-colors hover:text-ivory focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ivory/40"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-3">
            <h2 className="font-sans text-xs font-semibold tracking-[0.22em] text-rose uppercase">
              Visit
            </h2>
            <p className="flex items-start gap-2.5 text-sm leading-6 text-ivory/85">
              <MapPin
                className="mt-1 size-4 shrink-0 text-rose"
                aria-hidden="true"
              />
              <span>Dhaka, Bangladesh</span>
            </p>
            <p className="flex items-start gap-2.5 text-sm leading-6 text-ivory/85">
              <Clock3
                className="mt-1 size-4 shrink-0 text-rose"
                aria-hidden="true"
              />
              <span>Saturday–Thursday, 9:00 AM–6:00 PM</span>
            </p>
            <a
              href="mailto:hello@rupchorcha.com"
              className="flex w-fit items-start gap-2.5 py-0.5 text-sm leading-6 text-ivory/85 transition-colors hover:text-ivory focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ivory/40"
            >
              <Mail
                className="mt-1 size-4 shrink-0 text-rose"
                aria-hidden="true"
              />
              <span>hello@rupchorcha.com</span>
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-ivory/15 pt-6 text-xs text-ivory/75 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} RupChorcha. All rights reserved.</p>
          <p className="font-script text-base text-ivory/85">
            Beauty, Elegance &amp; Confidence
          </p>
        </div>
      </Container>
    </footer>
  )
}

export { Footer }
