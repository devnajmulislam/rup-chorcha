import Link from "next/link"
import { ArrowLeft, Search, Sparkles } from "lucide-react"

import { Container } from "@/components/shared/Container"
import { EmptyState } from "@/components/shared/EmptyState"
import { Footer } from "@/components/shared/Footer"
import Navbar from "@/components/shared/Navbar"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "cn"

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-col">
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex flex-1 items-center py-16">
        <Container className="max-w-xl">
          <EmptyState
            icon={Sparkles}
            title="Page not found"
            description="The page you requested does not exist or may have moved. Explore our service menu or return to the homepage."
          >
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-11 gap-2 rounded-full px-6 text-sm"
                )}
              >
                <ArrowLeft aria-hidden="true" />
                Back to home
              </Link>
              <Link
                href="/services"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-11 gap-2 rounded-full border-border bg-card px-6 text-sm text-plum hover:bg-blush"
                )}
              >
                <Search aria-hidden="true" />
                Browse services
              </Link>
            </div>
          </EmptyState>
        </Container>
      </main>
      <Footer />
    </div>
  )
}
