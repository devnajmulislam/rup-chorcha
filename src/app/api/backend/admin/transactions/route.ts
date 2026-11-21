import type { NextRequest } from "next/server"

import { proxyAuthenticatedJson } from "@/lib/backend-bff"

export async function GET(request: NextRequest) {
  const params = new URLSearchParams()
  const status = request.nextUrl.searchParams.get("status")?.trim()
  const search = request.nextUrl.searchParams.get("search")?.trim()
  const page = request.nextUrl.searchParams.get("page")?.trim()
  const limit = request.nextUrl.searchParams.get("limit")?.trim()

  if (status) {
    params.set("status", status)
  }
  if (search) {
    params.set("search", search)
  }
  if (page) {
    params.set("page", page)
  }
  if (limit) {
    params.set("limit", limit)
  }

  const query = params.toString()
  const backendPath = query
    ? `/api/admin/transactions?${query}`
    : "/api/admin/transactions"

  return proxyAuthenticatedJson({
    request,
    backendPath,
    method: "GET",
    allowedRoles: ["admin"],
  })
}
