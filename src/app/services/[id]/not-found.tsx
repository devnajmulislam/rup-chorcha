import Link from "next/link"
import { ArrowLeft, Sparkles } from "lucide-react"

import { Container } from "@/components/shared/Container"
import { EmptyState } from "@/components/shared/EmptyState"
import { Footer } from "@/components/shared/Footer"
import Navbar from "@/components/shared/Navbar"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "cn"

export default function ServiceNotFound() {
  return (
    <div className="flex min-h-full flex-col">
      <Navbar />
      <main className="flex flex-1 items-center py-16">
        <Container className="max-w-xl">
          <EmptyState
            icon={Sparkles}
            title="Service not found"
            description="This service is no longer active or does not exist on the RupChorcha menu."
          >
            <Link
              href="/services"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-11 gap-2 rounded-full px-6 text-sm"
              )}
            >
              <ArrowLeft aria-hidden="true" />
              Browse active services
            </Link>
          </EmptyState>
        </Container>
      </main>
      <Footer />
    </div>
  )
}
