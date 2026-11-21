import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination"
import type { PaginationMeta } from "@/lib/dashboard-types"
import { cn } from "cn"

type DashboardPaginationProps = {
  meta: PaginationMeta
  basePath: string
  params?: Record<string, string | undefined>
  pageParam?: string
}

type PageSlot = number | "ellipsis-start" | "ellipsis-end"

function buildPageSlots(current: number, totalPages: number): PageSlot[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const slots: PageSlot[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(totalPages - 1, current + 1)

  if (start > 2) {
    slots.push("ellipsis-start")
  }

  for (let pageNumber = start; pageNumber <= end; pageNumber += 1) {
    slots.push(pageNumber)
  }

  if (end < totalPages - 1) {
    slots.push("ellipsis-end")
  }

  slots.push(totalPages)
  return slots
}

function buildHref(
  basePath: string,
  params: Record<string, string | undefined>,
  page: number,
  pageParam = "page"
): string {
  const query = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value && value.trim()) {
      query.set(key, value.trim())
    }
  }

  if (page > 1) {
    query.set(pageParam, String(page))
  }

  const serialized = query.toString()
  return serialized ? `${basePath}?${serialized}` : basePath
}

function DashboardPagination({
  meta,
  basePath,
  params = {},
  pageParam = "page",
}: DashboardPaginationProps) {
  if (meta.totalPages <= 1) {
    return null
  }

  const currentPage = Math.min(Math.max(1, meta.page), meta.totalPages)
  const pageSlots = buildPageSlots(currentPage, meta.totalPages)
  const prevPage = currentPage - 1
  const nextPage = currentPage + 1

  return (
    <div className="flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-5 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        Page <span className="font-medium text-plum">{currentPage}</span> of{" "}
        <span className="font-medium text-plum">{meta.totalPages}</span> ·{" "}
        <span className="font-medium text-plum">{meta.total}</span> total
      </p>

      <Pagination className="mx-0 w-auto">
        <PaginationContent className="flex-wrap justify-center gap-1.5">
          <PaginationItem>
            {meta.hasPrevPage ? (
              <Link
                href={buildHref(basePath, params, prevPage, pageParam)}
                aria-label="Go to previous page"
                className={cn(
                  buttonVariants({ variant: "outline", size: "default" }),
                  "h-9 gap-1.5 rounded-full border-border bg-card px-3.5 text-sm text-plum hover:bg-blush"
                )}
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
                <span>Previous</span>
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className={cn(
                  buttonVariants({ variant: "outline", size: "default" }),
                  "pointer-events-none h-9 gap-1.5 rounded-full border-border/60 bg-transparent px-3.5 text-sm opacity-45"
                )}
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
                <span>Previous</span>
              </span>
            )}
          </PaginationItem>

          {pageSlots.map((slot) => {
            if (slot === "ellipsis-start" || slot === "ellipsis-end") {
              return (
                <PaginationItem key={slot}>
                  <PaginationEllipsis className="text-muted-foreground" />
                </PaginationItem>
              )
            }

            const isCurrent = slot === currentPage

            return (
              <PaginationItem key={slot}>
                <Link
                  href={buildHref(basePath, params, slot, pageParam)}
                  aria-current={isCurrent ? "page" : undefined}
                  aria-label={`Page ${slot}`}
                  className={cn(
                    buttonVariants({
                      variant: isCurrent ? "default" : "outline",
                      size: "icon",
                    }),
                    "h-9 w-9 rounded-full text-sm",
                    isCurrent
                      ? "bg-primary text-white hover:bg-primary/90"
                      : "border-border bg-card text-plum hover:bg-blush"
                  )}
                >
                  {slot}
                </Link>
              </PaginationItem>
            )
          })}

          <PaginationItem>
            {meta.hasNextPage ? (
              <Link
                href={buildHref(basePath, params, nextPage, pageParam)}
                aria-label="Go to next page"
                className={cn(
                  buttonVariants({ variant: "outline", size: "default" }),
                  "h-9 gap-1.5 rounded-full border-border bg-card px-3.5 text-sm text-plum hover:bg-blush"
                )}
              >
                <span>Next</span>
                <ChevronRight className="size-4" aria-hidden="true" />
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className={cn(
                  buttonVariants({ variant: "outline", size: "default" }),
                  "pointer-events-none h-9 gap-1.5 rounded-full border-border/60 bg-transparent px-3.5 text-sm opacity-45"
                )}
              >
                <span>Next</span>
                <ChevronRight className="size-4" aria-hidden="true" />
              </span>
            )}
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}

export { DashboardPagination }
