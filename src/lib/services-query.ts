import { SALON_CATEGORIES, type SalonCategory } from "@/lib/constants"

type ServiceSortOption =
  | "newest"
  | "oldest"
  | "price_asc"
  | "price_desc"
  | "name_asc"
  | "name_desc"

type PublicService = {
  id: string
  serviceName: string
  category: string
  description: string
  price: number
  duration: number
  image: string
  status: "active" | "inactive"
  createdAt: string | null
  updatedAt: string | null
}

type ServicesPaginationMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
  filters: {
    search: string | null
    category: string | null
    sort: ServiceSortOption
  }
}

type NormalizedServicesQuery = {
  search: string
  category: SalonCategory | ""
  invalidCategory: string | null
  sort: ServiceSortOption
  page: number
  hasActiveFilters: boolean
}

const PUBLIC_SERVICES_PAGE_SIZE = 12
const FEATURED_SERVICES_LIMIT = 6
const MAX_SEARCH_LENGTH = 100
const MAX_PAGE_NUMBER = 10_000

const SERVICE_SORT_OPTIONS: readonly {
  value: ServiceSortOption
  label: string
}[] = [
  { value: "newest", label: "Newest first" },
  { value: "price_asc", label: "Price: Low to high" },
  { value: "price_desc", label: "Price: High to low" },
  { value: "name_asc", label: "Name: A to Z" },
  { value: "name_desc", label: "Name: Z to A" },
  { value: "oldest", label: "Oldest first" },
]

const ALLOWED_REMOTE_IMAGE_HOSTS = new Set<string>([
  "i.ibb.co",
  "i.ibb.co.com",
  "images.unsplash.com",
  "lh3.googleusercontent.com",
  "lh4.googleusercontent.com",
  "lh5.googleusercontent.com",
  "lh6.googleusercontent.com",
])

function isAllowedRemoteImageUrl(value: string | null | undefined): boolean {
  if (typeof value !== "string" || !value.trim()) {
    return false
  }

  try {
    const parsed = new URL(value.trim())
    return (
      parsed.protocol === "https:" &&
      ALLOWED_REMOTE_IMAGE_HOSTS.has(parsed.hostname)
    )
  } catch {
    return false
  }
}

function matchSalonCategory(value: string): SalonCategory | null {
  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }

  const lower = trimmed.toLowerCase()
  const matched = SALON_CATEGORIES.find((cat) => cat.toLowerCase() === lower)
  return matched ?? null
}

function isValidCategory(value: string): value is SalonCategory {
  return matchSalonCategory(value) !== null
}

function isValidServiceSort(value: string): value is ServiceSortOption {
  return SERVICE_SORT_OPTIONS.some((option) => option.value === value)
}

function firstParam(
  value: string | string[] | undefined
): string {
  if (Array.isArray(value)) {
    return typeof value[0] === "string" ? value[0] : ""
  }

  return typeof value === "string" ? value : ""
}

function normalizeServicesSearchParams(
  raw: Record<string, string | string[] | undefined>
): NormalizedServicesQuery {
  const search = firstParam(raw.search).trim().slice(0, MAX_SEARCH_LENGTH)

  const rawCategory = firstParam(raw.category).trim()
  let category: SalonCategory | "" = ""
  let invalidCategory: string | null = null

  if (rawCategory && rawCategory.toLowerCase() !== "all") {
    const matched = matchSalonCategory(rawCategory)
    if (matched) {
      category = matched
    } else {
      invalidCategory = rawCategory.slice(0, MAX_SEARCH_LENGTH)
    }
  }

  const rawSort = firstParam(raw.sort).trim()
  const sort: ServiceSortOption = isValidServiceSort(rawSort)
    ? rawSort
    : "newest"

  const rawPage = firstParam(raw.page).trim()
  const parsedPage = /^\d+$/.test(rawPage) ? Number(rawPage) : 1
  const page =
    Number.isInteger(parsedPage) && parsedPage >= 1
      ? Math.min(parsedPage, MAX_PAGE_NUMBER)
      : 1

  const hasActiveFilters = Boolean(search || category || sort !== "newest")

  return {
    search,
    category,
    invalidCategory,
    sort,
    page,
    hasActiveFilters,
  }
}

function buildServicesHref({
  search = "",
  category = "",
  sort = "newest",
  page = 1,
}: {
  search?: string
  category?: string
  sort?: ServiceSortOption
  page?: number
} = {}): string {
  const params = new URLSearchParams()

  const trimmedSearch = search.trim().slice(0, MAX_SEARCH_LENGTH)
  if (trimmedSearch) {
    params.set("search", trimmedSearch)
  }

  const matchedCategory = category ? matchSalonCategory(category) : null
  if (matchedCategory) {
    params.set("category", matchedCategory)
  }

  if (sort && sort !== "newest" && isValidServiceSort(sort)) {
    params.set("sort", sort)
  }

  if (Number.isInteger(page) && page > 1) {
    params.set("page", String(Math.min(page, MAX_PAGE_NUMBER)))
  }

  const qs = params.toString()
  return qs ? `/services?${qs}` : "/services"
}

export {
  ALLOWED_REMOTE_IMAGE_HOSTS,
  FEATURED_SERVICES_LIMIT,
  MAX_SEARCH_LENGTH,
  PUBLIC_SERVICES_PAGE_SIZE,
  SERVICE_SORT_OPTIONS,
  buildServicesHref,
  isAllowedRemoteImageUrl,
  isValidCategory,
  isValidServiceSort,
  matchSalonCategory,
  normalizeServicesSearchParams,
}

export type {
  NormalizedServicesQuery,
  PublicService,
  ServiceSortOption,
  ServicesPaginationMeta,
}
