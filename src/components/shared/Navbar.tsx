"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu as MenuIcon } from "lucide-react"

import { Logo } from "@/components/brand/Logo"
import { Container } from "@/components/shared/Container"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "cn"

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Browse Services", href: "/services" },
] as const

const authLinks = [
  { label: "Sign In", href: "/sign-in", style: "outline" },
  { label: "Sign Up", href: "/sign-up", style: "primary" },
] as const

const linkClasses =
  "text-sm font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/"
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

function Navbar() {
  const pathname = usePathname() ?? "/"

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-ivory">
      <Container className="flex h-20 items-center justify-between gap-6">
        <Logo wordmarkClassName="text-2xl sm:text-[1.65rem]" />

        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-8 md:flex"
        >
          {navLinks.map((link) => {
            const active = isActive(pathname, link.href)

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  linkClasses,
                  "relative py-2",
                  active && "text-plum"
                )}
              >
                {link.label}
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-primary transition-opacity",
                    active ? "opacity-100" : "opacity-0"
                  )}
                />
              </Link>
            )
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/sign-in"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-10 rounded-full border-border bg-transparent px-5 text-sm hover:bg-blush hover:text-plum"
            )}
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-10 rounded-full px-5 text-sm"
            )}
          >
            Sign Up
          </Link>
        </div>

        <Sheet>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon-lg"
                className="md:hidden"
                aria-label="Open navigation menu"
              />
            }
          >
            <MenuIcon aria-hidden="true" />
          </SheetTrigger>
          <SheetContent side="right" className="bg-ivory">
            <SheetHeader className="border-b border-border/60">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <Logo wordmarkClassName="text-2xl" />
            </SheetHeader>

            <nav
              aria-label="Mobile navigation"
              className="flex flex-col gap-1 px-4"
            >
              {navLinks.map((link) => {
                const active = isActive(pathname, link.href)

                return (
                  <SheetClose
                    key={link.href}
                    render={
                      <Link
                        href={link.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "rounded-lg px-3 py-3 text-base font-medium transition-colors hover:bg-blush hover:text-plum focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                          active ? "bg-blush/60 text-plum" : "text-foreground"
                        )}
                      />
                    }
                  >
                    {link.label}
                  </SheetClose>
                )
              })}
            </nav>

            <div className="mt-auto flex flex-col gap-2 border-t border-border/60 p-4">
              {authLinks.map((link) => (
                <SheetClose
                  key={link.href}
                  render={
                    <Link
                      href={link.href}
                      className={cn(
                        buttonVariants({
                          variant:
                            link.style === "outline" ? "outline" : "default",
                          size: "lg",
                        }),
                        "h-10 w-full rounded-full px-5 text-sm",
                        link.style === "outline" &&
                          "border-border bg-transparent hover:bg-blush hover:text-plum"
                      )}
                    />
                  }
                >
                  {link.label}
                </SheetClose>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </Container>
    </header>
  )
}

export default Navbar
export { Navbar }
