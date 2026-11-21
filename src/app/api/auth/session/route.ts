import type { NextRequest } from "next/server"

import { handleSessionLookup } from "@/lib/auth-bff"

export async function GET(request: NextRequest) {
  return handleSessionLookup(request, { strict: false })
}
