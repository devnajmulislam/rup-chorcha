import type { Metadata } from "next"

import { ProfileForm } from "@/components/dashboard/ProfileForm"
import { PageHeader } from "@/components/shared/PageHeader"
import { roleOf } from "@/lib/roles"
import { requireRole } from "@/lib/session"

export const metadata: Metadata = {
  title: "My Profile",
  description: "Update your RupChorcha name, phone number, and profile image.",
}

export default async function CustomerProfilePage() {
  const session = await requireRole("customer")

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Your account"
        title="My profile"
        description="Keep your name, phone number, and photo up to date. Your email and account type are managed by RupChorcha."
      />

      <div className="max-w-2xl rounded-2xl border border-border/70 bg-card p-5 shadow-[0_18px_40px_-34px_rgba(58,24,48,0.4)] sm:p-6">
        <ProfileForm
          name={session.user.name ?? ""}
          email={session.user.email ?? ""}
          phone={session.user.phone ?? ""}
          image={session.user.image ?? ""}
          role={roleOf(session.user)}
        />
      </div>
    </div>
  )
}
