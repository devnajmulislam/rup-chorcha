import Link from "next/link"
import { Clock3, Mail, MapPin, Phone } from "lucide-react"

import { Logo } from "@/components/brand/Logo"
import { Container } from "@/components/shared/Container"

const footerLinks = [
  { label: "Home", href: "/" },
  { label: "Browse Services", href: "/services" },
  { label: "Categories", href: "/#categories" },
  { label: "Why RupChorcha", href: "/#why" },
  { label: "Sign In", href: "/sign-in" },
] as const

const socialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/rupchorcha",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="size-4"
      >
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/rupchorcha",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="size-4"
      >
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
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
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`RupChorcha on ${item.label}`}
                  className="inline-flex min-h-9 items-center gap-2 rounded-full border border-ivory/20 bg-ivory/10 px-3.5 py-1.5 text-xs font-medium text-ivory/90 transition-colors hover:border-ivory/35 hover:bg-ivory/15 hover:text-ivory focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ivory/40"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </a>
              ))}
            </div>
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
              Visit &amp; Contact
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
              href="tel:+8801700000000"
              className="flex w-fit items-start gap-2.5 py-0.5 text-sm leading-6 text-ivory/85 transition-colors hover:text-ivory focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ivory/40"
            >
              <Phone
                className="mt-1 size-4 shrink-0 text-rose"
                aria-hidden="true"
              />
              <span>+880 1700-000000</span>
            </a>
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
