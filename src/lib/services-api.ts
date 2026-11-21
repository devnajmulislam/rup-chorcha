import { cache } from "react"
import { z } from "zod"

import {
  PUBLIC_SERVICES_PAGE_SIZE,
  type PublicService,
  type ServiceSortOption,
  type ServicesPaginationMeta,
} from "@/lib/services-query"

const REQUEST_TIMEOUT_MS = 10_000

const serviceSortSchema = z.enum([
  "newest",
  "oldest",
  "price_asc",
  "price_desc",
  "name_asc",
  "name_desc",
])

const publicServiceSchema = z.object({
  id: z.string().min(1),
  serviceName: z.string(),
  category: z.string(),
  description: z.string(),
  price: z.number(),
  duration: z.number(),
  image: z.string(),
  status: z.enum(["active", "inactive"]),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
})

const servicesMetaSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
  hasNextPage: z.boolean(),
  hasPrevPage: z.boolean(),
  filters: z.object({
    search: z.string().nullable(),
    category: z.string().nullable(),
    sort: serviceSortSchema,
  }),
})

const servicesListResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(publicServiceSchema),
  meta: servicesMetaSchema,
})

type ServicesListResult =
  | {
      ok: true
      services: PublicService[]
      meta: ServicesPaginationMeta
    }
  | {
      ok: false
      message: string
      code: string
      status: number
    }

function getApiBaseUrl(): string | null {
  const apiUrl = process.env.API_URL?.trim().replace(/\/+$/, "")
  return apiUrl || null
}

const fetchPublicServicesCached = cache(
  async (queryKey: string): Promise<ServicesListResult> => {
    const apiUrl = getApiBaseUrl()
    if (!apiUrl) {
      return {
        ok: false,
        message: "The services catalogue is temporarily unavailable.",
        code: "BACKEND_NOT_CONFIGURED",
        status: 503,
      }
    }

    const endpoint = queryKey
      ? `${apiUrl}/api/services?${queryKey}`
      : `${apiUrl}/api/services`

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    let response: Response
    try {
      response = await fetch(endpoint, {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal,
      })
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return {
          ok: false,
          message: "Loading the service menu took too long. Please try again.",
          code: "BACKEND_TIMEOUT",
          status: 504,
        }
      }

      return {
        ok: false,
        message:
          "We could not connect to the RupChorcha service catalogue right now.",
        code: "BACKEND_UNAVAILABLE",
        status: 503,
      }
    } finally {
      clearTimeout(timeout)
    }

    let rawJson: unknown = null
    try {
      rawJson = await response.json()
    } catch {
      rawJson = null
    }

    if (!response.ok) {
      const errObj =
        rawJson && typeof rawJson === "object"
          ? (rawJson as { message?: unknown; code?: unknown })
          : {}
      const backendMessage =
        typeof errObj.message === "string" && errObj.message.trim()
          ? errObj.message.trim()
          : "We could not load services right now. Please try again."
      const backendCode =
        typeof errObj.code === "string" && errObj.code.trim()
          ? errObj.code.trim()
          : "SERVICES_FETCH_FAILED"

      return {
        ok: false,
        message: backendMessage,
        code: backendCode,
        status: response.status,
      }
    }

    const parsed = servicesListResponseSchema.safeParse(rawJson)
    if (!parsed.success) {
      return {
        ok: false,
        message:
          "Received an unexpected response from the service catalogue. Please try again.",
        code: "INVALID_SERVICES_RESPONSE",
        status: 502,
      }
    }

    return {
      ok: true,
      services: parsed.data.data,
      meta: parsed.data.meta,
    }
  }
)

async function fetchPublicServices(
  params: {
    search?: string
    category?: string
    sort?: ServiceSortOption
    page?: number
    limit?: number
  } = {}
): Promise<ServicesListResult> {
  const query = new URLSearchParams()

  if (params.search && params.search.trim()) {
    query.set("search", params.search.trim())
  }

  if (params.category && params.category.trim()) {
    query.set("category", params.category.trim())
  }

  if (params.sort) {
    query.set("sort", params.sort)
  }

  const page = params.page && params.page > 0 ? Math.floor(params.page) : 1
  const limit =
    params.limit && params.limit > 0
      ? Math.floor(params.limit)
      : PUBLIC_SERVICES_PAGE_SIZE

  query.set("page", String(page))
  query.set("limit", String(limit))

  return fetchPublicServicesCached(query.toString())
}

export { fetchPublicServices }
export type { ServicesListResult }
