import { NextResponse, type NextRequest } from "next/server"

import { getAppOrigin } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const target = new URL("/sign-in", getAppOrigin(request))
  const error = request.nextUrl.searchParams.get("error")
  const description = request.nextUrl.searchParams.get("error_description")

  if (error) {
    target.searchParams.set("error", error)
  }

  if (description) {
    target.searchParams.set("error_description", description)
  }

  return NextResponse.redirect(target)
}
