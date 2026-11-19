import { NextResponse, type NextRequest } from "next/server"

export const dynamic = "force-dynamic"

const apiUrl = process.env.API_URL?.trim().replace(/\/+$/, "")

async function proxyAuthRequest(request: NextRequest) {
  if (!apiUrl) {
    return NextResponse.json(
      {
        success: false,
        message: "Authentication service is not configured.",
        code: "AUTH_SERVICE_UNAVAILABLE",
      },
      { status: 503 }
    )
  }

  const target = `${apiUrl}${request.nextUrl.pathname}${request.nextUrl.search}`
  const headers = new Headers(request.headers)
  headers.delete("host")
  headers.delete("content-length")
  headers.delete("connection")

  const hasBody = request.method !== "GET" && request.method !== "HEAD"

  let upstream: Response

  try {
    upstream = await fetch(target, {
      method: request.method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      redirect: "manual",
      cache: "no-store",
    })
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "RupChorcha authentication is unreachable. Please try again.",
        code: "AUTH_SERVICE_UNREACHABLE",
      },
      { status: 502 }
    )
  }

  const responseHeaders = new Headers(upstream.headers)
  responseHeaders.delete("content-encoding")
  responseHeaders.delete("content-length")
  responseHeaders.delete("transfer-encoding")

  // Session cookies are set by Express; forward every Set-Cookie header intact.
  const setCookies = upstream.headers.getSetCookie()

  if (setCookies.length > 0) {
    responseHeaders.delete("set-cookie")

    for (const cookie of setCookies) {
      responseHeaders.append("set-cookie", cookie)
    }
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  })
}

export {
  proxyAuthRequest as GET,
  proxyAuthRequest as POST,
}
