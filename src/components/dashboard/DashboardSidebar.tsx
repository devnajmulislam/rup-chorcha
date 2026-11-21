"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  ArrowLeft,
  CalendarDays,
  CirclePlus,
  LayoutDashboard,
  Loader2Icon,
  LogOut,
  Menu as MenuIcon,
  ReceiptText,
  Scissors,
  SquarePen,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react"

import { Logo } from "@/components/brand/Logo"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { toast } from "@/components/ui/toast"
import { logoutSession, useAuthSession } from "@/lib/auth-client"
import {
  findActiveHref,
  type DashboardNavIcon,
  type DashboardNavItem,
} from "@/lib/dashboard-nav"
import type { UserRole } from "@/lib/roles"
import { cn } from "cn"

/**
 * Nav items cross the Server -> Client boundary, so they carry a serializable
 * icon key and the matching Lucide component is resolved here on the client.
 */
const NAV_ICONS: Record<DashboardNavIcon, LucideIcon> = {
  overview: LayoutDashboard,
  appointments: CalendarDays,
  profile: UserRound,
  services: Scissors,
  "add-service": CirclePlus,
  "update-service": SquarePen,
  users: Users,
  transactions: ReceiptText,
}

type DashboardUser = {
  name: string
  email: string
  image: string | null
}

type DashboardSidebarProps = {
  role: UserRole
  nav: DashboardNavItem[]
  user: DashboardUser
}

function UserChip({
  user,
  isAdmin,
}: {
  user: DashboardUser
  isAdmin: boolean
}) {
  const initial = user.name ? Array.from(user.name)[0]?.toUpperCase() : null

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl p-3",
        isAdmin ? "bg-ivory/10" : "bg-blush/60"
      )}
    >
      <Avatar size="lg" className="shrink-0">
        {user.image ? <AvatarImage src={user.image} alt="" /> : null}
        <AvatarFallback
          className={cn(
            "font-medium",
            isAdmin ? "bg-ivory/15 text-ivory" : "bg-white text-plum"
          )}
        >
          {initial ?? <UserRound className="size-4" aria-hidden="true" />}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p
          className={cn(
            "truncate text-sm font-medium",
            isAdmin ? "text-ivory" : "text-plum"
          )}
        >
          {user.name || "Your account"}
        </p>
        <p
          className={cn(
            "truncate text-xs",
            isAdmin ? "text-ivory/70" : "text-muted-foreground"
          )}
        >
          {user.email}
        </p>
      </div>
    </div>
  )
}

function NavList({
  nav,
  isAdmin,
  onNavigate,
}: {
  nav: DashboardNavItem[]
  isAdmin: boolean
  onNavigate?: () => void
}) {
  const pathname = usePathname() ?? ""
  const activeHref = findActiveHref(nav, pathname)

  return (
    <nav aria-label="Dashboard navigation" className="flex flex-col gap-1">
      {nav.map((item) => {
        const active = item.href === activeHref
        const Icon = NAV_ICONS[item.icon]

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-3",
              isAdmin
                ? "focus-visible:ring-ivory/60"
                : "focus-visible:ring-ring/50",
              active
                ? isAdmin
                  ? "bg-ivory/12 text-ivory"
                  : "bg-blush text-plum"
                : isAdmin
                  ? "text-ivory/75 hover:bg-ivory/8 hover:text-ivory"
                  : "text-muted-foreground hover:bg-blush/50 hover:text-plum"
            )}
          >
            <Icon
              className={cn(
                "size-4",
                active ? (isAdmin ? "text-rose" : "text-primary") : ""
              )}
              aria-hidden="true"
            />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

function BackToSite({
  isAdmin,
  className,
  onClick,
}: {
  isAdmin: boolean
  className?: string
  onClick?: () => void
}) {
  return (
    <Link
      href="/"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-3",
        isAdmin
          ? "text-ivory/75 hover:bg-ivory/8 hover:text-ivory focus-visible:ring-ivory/60"
          : "text-muted-foreground hover:bg-blush/50 hover:text-plum focus-visible:ring-ring/50",
        className
      )}
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      Back to site
    </Link>
  )
}

function SidebarSignOut({
  isAdmin,
  onSignOutComplete,
}: {
  isAdmin: boolean
  onSignOutComplete?: () => void
}) {
  const router = useRouter()
  const { setUser } = useAuthSession()
  const [signingOut, setSigningOut] = React.useState(false)

  async function handleSignOut() {
    if (signingOut) {
      return
    }

    setSigningOut(true)

    try {
      const result = await logoutSession()

      if (!result.ok) {
        toast.add({
          title: "Sign out failed",
          description: result.message,
          type: "error",
        })
        return
      }

      setUser(null)
      toast.add({
        title: "Signed out",
        description: "You have been signed out of RupChorcha.",
        type: "success",
      })
      onSignOutComplete?.()
      router.refresh()
      router.push("/")
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={handleSignOut}
      disabled={signingOut}
      className={cn(
        "h-auto w-full justify-start gap-2 rounded-xl px-3 py-2 text-sm font-medium",
        isAdmin
          ? "text-rose hover:bg-ivory/10 hover:text-ivory focus-visible:ring-ivory/60"
          : "text-destructive hover:bg-destructive/10 hover:text-destructive"
      )}
    >
      {signingOut ? (
        <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <LogOut className="size-4" aria-hidden="true" />
      )}
      {signingOut ? "Signing out…" : "Sign out"}
    </Button>
  )
}

function DashboardSidebar({ role, nav, user }: DashboardSidebarProps) {
  const isAdmin = role === "admin"

  return (
    <aside
      className={cn(
        "hidden w-72 shrink-0 border-r lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col",
        isAdmin
          ? "border-ivory/15 bg-plum text-ivory"
          : "border-border/60 bg-card text-foreground"
      )}
    >
      <div
        className={cn(
          "border-b px-6 py-5",
          isAdmin ? "border-ivory/15" : "border-border/60"
        )}
      >
        <Logo
          variant={isAdmin ? "reverse" : "default"}
          wordmarkClassName="text-xl"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <NavList nav={nav} isAdmin={isAdmin} />
      </div>

      <div
        className={cn(
          "flex flex-col gap-2 border-t p-3",
          isAdmin ? "border-ivory/15" : "border-border/60"
        )}
      >
        <UserChip user={user} isAdmin={isAdmin} />
        <BackToSite isAdmin={isAdmin} />
        <SidebarSignOut isAdmin={isAdmin} />
      </div>
    </aside>
  )
}

function DashboardMobileNav({ role, nav, user }: DashboardSidebarProps) {
  const [open, setOpen] = React.useState(false)
  const isAdmin = role === "admin"

  function close() {
    setOpen(false)
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex items-center justify-between gap-4 border-b px-4 py-3 lg:hidden",
        isAdmin
          ? "border-ivory/15 bg-plum text-ivory"
          : "border-border/60 bg-card text-foreground"
      )}
    >
      <Logo
        variant={isAdmin ? "reverse" : "default"}
        wordmarkClassName="text-xl"
      />

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <Button
              variant="ghost"
              size="icon-lg"
              aria-label="Open dashboard menu"
              className={
                isAdmin
                  ? "text-ivory hover:bg-ivory/10 hover:text-ivory focus-visible:ring-ivory/60"
                  : undefined
              }
            />
          }
        >
          <MenuIcon aria-hidden="true" />
        </SheetTrigger>
        <SheetContent
          side="right"
          className={cn(
            isAdmin
              ? "border-ivory/15 bg-plum text-ivory [&_[data-slot=sheet-close]]:text-ivory [&_[data-slot=sheet-close]]:hover:bg-ivory/10 [&_[data-slot=sheet-close]]:hover:text-ivory"
              : "bg-card text-foreground"
          )}
        >
          <SheetHeader
            className={cn(
              "border-b",
              isAdmin ? "border-ivory/15" : "border-border/60"
            )}
          >
            <SheetTitle className="sr-only">Dashboard navigation</SheetTitle>
            <Logo
              variant={isAdmin ? "reverse" : "default"}
              wordmarkClassName="text-xl"
            />
          </SheetHeader>

          <div className="flex flex-col gap-4 px-4 py-4">
            <UserChip user={user} isAdmin={isAdmin} />
            <NavList nav={nav} isAdmin={isAdmin} onNavigate={close} />
          </div>

          <div
            className={cn(
              "mt-auto flex flex-col gap-1 border-t p-4",
              isAdmin ? "border-ivory/15" : "border-border/60"
            )}
          >
            <BackToSite isAdmin={isAdmin} className="w-full" onClick={close} />
            <SidebarSignOut isAdmin={isAdmin} onSignOutComplete={close} />
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )
}

export { DashboardMobileNav, DashboardSidebar }
export type { DashboardNavItem, DashboardUser }
