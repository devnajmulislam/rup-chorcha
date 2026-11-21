"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2Icon, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { SALON_CATEGORIES } from "@/lib/constants"
import {
  MAX_SEARCH_LENGTH,
  SERVICE_SORT_OPTIONS,
  buildServicesHref,
  type ServiceSortOption,
} from "@/lib/services-query"
import { cn } from "cn"

type ServicesCatalogControlsProps = {
  search: string
  category: string
  sort: ServiceSortOption
  total: number
  page: number
  limit: number
  hasActiveFilters: boolean
  isError?: boolean
}

function ServicesCatalogControls({
  search,
  category,
  sort,
  total,
  page,
  limit,
  hasActiveFilters,
  isError = false,
}: ServicesCatalogControlsProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()
  const [searchInput, setSearchInput] = React.useState(search)
  const [prevSearchProp, setPrevSearchProp] = React.useState(search)
  const [lastSubmittedSearch, setLastSubmittedSearch] = React.useState(search)

  if (search !== prevSearchProp) {
    setPrevSearchProp(search)
    if (search !== lastSubmittedSearch) {
      setSearchInput(search)
      setLastSubmittedSearch(search)
    }
  }

  const navigateWith = React.useCallback(
    (
      next: {
        search?: string
        category?: string
        sort?: ServiceSortOption
        page?: number
      },
      { replace = false }: { replace?: boolean } = {}
    ) => {
      const targetHref = buildServicesHref({
        search: next.search ?? searchInput,
        category: next.category ?? category,
        sort: next.sort ?? sort,
        page: next.page ?? 1,
      })

      startTransition(() => {
        if (replace) {
          router.replace(targetHref, { scroll: false })
        } else {
          router.push(targetHref, { scroll: false })
        }
      })
    },
    [category, router, searchInput, sort]
  )

  React.useEffect(() => {
    const trimmed = searchInput.trim()
    if (trimmed === search) {
      return
    }

    const timer = setTimeout(() => {
      setLastSubmittedSearch(trimmed)
      const targetHref = buildServicesHref({
        search: trimmed,
        category,
        sort,
        page: 1,
      })

      startTransition(() => {
        router.replace(targetHref, { scroll: false })
      })
    }, 350)

    return () => clearTimeout(timer)
  }, [category, router, search, searchInput, sort])

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = searchInput.trim()
    if (trimmed === search) {
      return
    }

    setLastSubmittedSearch(trimmed)
    navigateWith({ search: trimmed, page: 1 })
  }

  function handleClearSearch() {
    setSearchInput("")
    setLastSubmittedSearch("")
    navigateWith({ search: "", page: 1 })
  }

  function handleCategoryChange(nextCategory: string) {
    const trimmed = searchInput.trim()
    setLastSubmittedSearch(trimmed)
    navigateWith({ search: trimmed, category: nextCategory, page: 1 })
  }

  function handleSortChange(nextSort: ServiceSortOption) {
    const trimmed = searchInput.trim()
    setLastSubmittedSearch(trimmed)
    navigateWith({ search: trimmed, sort: nextSort, page: 1 })
  }

  function handleClearAll() {
    setSearchInput("")
    setLastSubmittedSearch("")
    startTransition(() => {
      router.push("/services", { scroll: false })
    })
  }

  const startItem = total > 0 ? (page - 1) * limit + 1 : 0
  const endItem = total > 0 ? Math.min(page * limit, total) : 0
  const showReset =
    hasActiveFilters || Boolean(searchInput.trim())

  return (
    <section
      aria-label="Filter and sort services"
      className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-4 shadow-[0_18px_40px_-34px_rgba(58,24,48,0.35)] sm:p-5"
    >
      <div className="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <form onSubmit={handleSearchSubmit} className="flex flex-col gap-1.5">
          <label
            htmlFor="services-search-input"
            className="text-xs font-medium text-muted-foreground"
          >
            Search by service name
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="services-search-input"
              name="search"
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              maxLength={MAX_SEARCH_LENGTH}
              placeholder="Search haircuts, facials, spa…"
              className="h-11 rounded-xl pr-10 pl-9"
            />
            {searchInput ? (
              <button
                type="button"
                onClick={handleClearSearch}
                aria-label="Clear search query"
                className="absolute top-1/2 right-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-blush hover:text-plum focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </form>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="services-category-select"
            className="text-xs font-medium text-muted-foreground"
          >
            Category
          </label>
          <NativeSelect
            id="services-category-select"
            value={category || "all"}
            onChange={(event) =>
              handleCategoryChange(
                event.target.value === "all" ? "" : event.target.value
              )
            }
            className="w-full [&_select]:h-11 [&_select]:rounded-xl [&_select]:bg-card [&_select]:px-3.5"
          >
            <NativeSelectOption value="all">All categories</NativeSelectOption>
            {SALON_CATEGORIES.map((item) => (
              <NativeSelectOption key={item} value={item}>
                {item}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="services-sort-select"
            className="text-xs font-medium text-muted-foreground"
          >
            Sort by
          </label>
          <NativeSelect
            id="services-sort-select"
            value={sort}
            onChange={(event) =>
              handleSortChange(event.target.value as ServiceSortOption)
            }
            className="w-full [&_select]:h-11 [&_select]:rounded-xl [&_select]:bg-card [&_select]:px-3.5"
          >
            {SERVICE_SORT_OPTIONS.map((option) => (
              <NativeSelectOption key={option.value} value={option.value}>
                {option.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
      </div>

      <div
        role="group"
        aria-label="Quick category filters"
        className="flex flex-wrap items-center gap-2"
      >
        <button
          type="button"
          onClick={() => handleCategoryChange("")}
          aria-pressed={!category}
          className={cn(
            "min-h-9 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
            !category
              ? "border-primary bg-primary text-white"
              : "border-border bg-ivory text-plum hover:bg-blush"
          )}
        >
          All
        </button>
        {SALON_CATEGORIES.map((item) => {
          const active = category === item

          return (
            <button
              key={item}
              type="button"
              onClick={() => handleCategoryChange(item)}
              aria-pressed={active}
              className={cn(
                "min-h-9 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                active
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-ivory text-plum hover:bg-blush"
              )}
            >
              {item}
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isError ? (
            <span>Unable to load services right now.</span>
          ) : total === 0 ? (
            <span>No matching active services</span>
          ) : (
            <span>
              Showing{" "}
              <span className="font-medium text-plum">
                {startItem}–{endItem}
              </span>{" "}
              of <span className="font-medium text-plum">{total}</span> active{" "}
              {total === 1 ? "service" : "services"}
            </span>
          )}
          {isPending ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
              <Loader2Icon className="size-3.5 animate-spin" aria-hidden="true" />
              Updating…
            </span>
          ) : null}
        </div>

        {showReset ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            className="h-9 rounded-full border-border bg-transparent px-4 text-xs text-plum hover:bg-blush"
          >
            <X className="size-3.5" aria-hidden="true" />
            Clear filters
          </Button>
        ) : null}
      </div>
    </section>
  )
}

export { ServicesCatalogControls }
