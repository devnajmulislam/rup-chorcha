import type { NextRequest } from "next/server"

import {
  authJsonError,
  buildBackendHeaders,
  fetchBackend,
  getAppOrigin,
  serializeCookies,
} from "@/lib/auth"
import {
  finalizeExpressAuthResponse,
  parseJsonBody,
  verifySameOriginCsrf,
  zodFieldErrors,
} from "@/lib/auth-bff"
import { registerSchema } from "@/lib/auth-validators"

export async function POST(request: NextRequest) {
  const csrfError = verifySameOriginCsrf(request)
  if (csrfError) {
    return csrfError
  }

  const parsedBody = await parseJsonBody(request)
  if (!parsedBody.ok) {
    return parsedBody.response
  }

  const validated = registerSchema.safeParse(parsedBody.data)
  if (!validated.success) {
    const fieldErrors = zodFieldErrors(validated.error)
    const firstMessage =
      validated.error.issues[0]?.message ||
      "Check the highlighted fields and try again."

    return authJsonError({
      status: 400,
      code: "VALIDATION_ERROR",
      message: firstMessage,
      fieldErrors,
    })
  }

  const appOrigin = getAppOrigin(request)
  const existingCookieHeader = serializeCookies(request.cookies.getAll())

  let expressResponse: Response
  try {
    expressResponse = await fetchBackend("/api/auth/sign-up/email", {
      method: "POST",
      headers: buildBackendHeaders({
        appOrigin,
        cookieHeader: existingCookieHeader || undefined,
        contentType: "application/json",
        request,
      }),
      body: JSON.stringify({
        name: validated.data.name,
        email: validated.data.email,
        password: validated.data.password,
        ...(validated.data.image ? { image: validated.data.image } : {}),
      }),
    })
  } catch {
    return authJsonError({
      status: 503,
      code: "BACKEND_UNAVAILABLE",
      message:
        "Registration is temporarily unavailable. Please try again shortly.",
    })
  }

  return finalizeExpressAuthResponse({
    expressResponse,
    existingCookieHeader,
    appOrigin,
    request,
    successStatus: 201,
    fallbackErrorMessage: "We could not create your account.",
  })
}
