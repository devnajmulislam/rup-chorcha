import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { TriangleAlert } from "lucide-react"

import { ProfileForm } from "@/components/dashboard/ProfileForm"
import { PageHeader } from "@/components/shared/PageHeader"
import { RefreshRetryButton } from "@/components/shared/RefreshRetryButton"
import { fetchMyProfile } from "@/lib/backend-api"
import { requireRole } from "@/lib/session"

export const metadata: Metadata = {
  title: "My Profile",
  description: "Update your RupChorcha name, phone number, and profile image.",
}

export const dynamic = "force-dynamic"

export default async function CustomerProfilePage() {
  const session = await requireRole("customer")
  const profileRes = await fetchMyProfile(session.accessToken)

  if (!profileRes.ok) {
    if (profileRes.kind === "blocked") {
      redirect("/sign-in?blocked=1")
    }
    if (profileRes.kind === "unauthorized") {
      redirect("/sign-in?redirect=%2Fcustomer%2Fprofile")
    }

    return (
      <div className="flex flex-col gap-8">
        <PageHeader
          eyebrow="Your account"
          title="My profile"
          description="Keep your name, phone number, and photo up to date. Your email and account type are managed by RupChorcha."
        />
        <div
          role="alert"
          className="flex flex-col items-start gap-4 rounded-2xl border border-destructive/25 bg-destructive/10 p-5 text-sm text-destructive"
        >
          <p className="flex items-start gap-2">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{profileRes.message}</span>
          </p>
          <RefreshRetryButton className="h-9 rounded-full border-destructive/30 bg-card px-4 text-xs text-foreground hover:bg-blush" />
        </div>
      </div>
    )
  }

  const profile = profileRes.data

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Your account"
        title="My profile"
        description="Keep your name, phone number, and photo up to date. Your email and account type are managed by RupChorcha."
      />

      <div className="max-w-2xl rounded-2xl border border-border/70 bg-card p-5 shadow-[0_18px_40px_-34px_rgba(58,24,48,0.4)] sm:p-6">
        <ProfileForm
          name={profile.name}
          email={profile.email}
          phone={profile.phone ?? ""}
          image={profile.image ?? ""}
          role={profile.role}
        />
      </div>
    </div>
  )
}
