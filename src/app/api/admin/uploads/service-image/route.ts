import type { NextRequest } from "next/server"

import { verifySameOriginCsrf } from "@/lib/auth-bff"
import { proxyAuthenticatedMultipart } from "@/lib/backend-bff"

export async function POST(request: NextRequest) {
  const csrfError = verifySameOriginCsrf(request)
  if (csrfError) {
    return csrfError
  }

  return proxyAuthenticatedMultipart({
    request,
    backendPath: "/api/admin/uploads/service-image",
    allowedRoles: ["admin"],
    missingMessage: "Choose a service image file to upload.",
  })
}
