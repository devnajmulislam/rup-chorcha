import { headers } from "next/headers"
import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { isUserBlocked, roleOf } from "@/lib/roles"

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
])

const MAX_UPLOAD_MB = Number(process.env.MAX_UPLOAD_MB?.trim()) || 5
const MAX_IMAGE_BYTES = MAX_UPLOAD_MB * 1024 * 1024

export async function POST(request: Request) {
  const incomingHeaders = await headers()
  const session = await auth.api.getSession({ headers: incomingHeaders })

  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "Sign in as an admin to upload images." },
      { status: 401 }
    )
  }

  if (isUserBlocked(session.user) || roleOf(session.user) !== "admin") {
    return NextResponse.json(
      {
        success: false,
        message: "Only administrators can upload service images.",
      },
      { status: 403 }
    )
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json(
      { success: false, message: "Send an image file using multipart form data." },
      { status: 400 }
    )
  }

  const file = formData.get("image")

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { success: false, message: "Choose a service image file to upload." },
      { status: 400 }
    )
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json(
      {
        success: false,
        message: "Upload a JPEG, PNG, WebP, or GIF image.",
      },
      { status: 400 }
    )
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      {
        success: false,
        message: `Image size must be ${MAX_UPLOAD_MB} MB or smaller.`,
      },
      { status: 400 }
    )
  }

  const imgbbKey = process.env.IMGBB_API_KEY?.trim()

  if (imgbbKey) {
    try {
      const base64 = Buffer.from(await file.arrayBuffer()).toString("base64")
      const imgbbForm = new FormData()
      imgbbForm.append("key", imgbbKey)
      imgbbForm.append("image", base64)

      const response = await fetch("https://api.imgbb.com/1/upload", {
        method: "POST",
        body: imgbbForm,
        cache: "no-store",
      })

      const payload = (await response.json().catch(() => null)) as {
        success?: boolean
        data?: { display_url?: string; url?: string }
        error?: { message?: string }
      } | null

      const uploadedUrl =
        payload?.data?.display_url?.trim() || payload?.data?.url?.trim()

      if (!response.ok || !payload?.success || !uploadedUrl) {
        return NextResponse.json(
          {
            success: false,
            message:
              payload?.error?.message?.trim() ||
              "ImgBB could not store this image. Please try another image.",
          },
          { status: 502 }
        )
      }

      return NextResponse.json({
        success: true,
        data: { url: uploadedUrl },
      })
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Could not reach ImgBB right now. Please try again.",
        },
        { status: 502 }
      )
    }
  }

  const apiUrl = process.env.API_URL?.trim().replace(/\/+$/, "")

  if (apiUrl) {
    try {
      const proxyForm = new FormData()
      proxyForm.append("image", file, file.name)
      const cookieHeader = incomingHeaders.get("cookie")

      const response = await fetch(
        `${apiUrl}/api/admin/uploads/service-image`,
        {
          method: "POST",
          headers: cookieHeader ? { cookie: cookieHeader } : undefined,
          body: proxyForm,
          cache: "no-store",
        }
      )

      const payload = (await response.json().catch(() => null)) as {
        success?: boolean
        message?: string
        data?: { url?: string }
        url?: string
      } | null

      const uploadedUrl =
        payload?.data?.url?.trim() || payload?.url?.trim() || ""

      if (!response.ok || !uploadedUrl) {
        return NextResponse.json(
          {
            success: false,
            message:
              payload?.message?.trim() ||
              "The image upload service could not store this image.",
          },
          { status: response.status >= 400 ? response.status : 502 }
        )
      }

      return NextResponse.json({
        success: true,
        data: { url: uploadedUrl },
      })
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Image upload service is unreachable right now.",
        },
        { status: 502 }
      )
    }
  }

  return NextResponse.json(
    {
      success: false,
      message:
        "Image upload is not configured yet. Add IMGBB_API_KEY to your server environment variables.",
    },
    { status: 503 }
  )
}
