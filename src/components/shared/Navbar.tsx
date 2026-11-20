"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  ChevronDown as ChevronDownIcon,
  LayoutDashboard as LayoutDashboardIcon,
  LogOut as LogOutIcon,
  Menu as MenuIcon,
  User as UserIcon,
} from "lucide-react"

import { Logo } from "@/components/brand/Logo"
import { Container } from "@/components/shared/Container"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { toast } from "@/components/ui/toast"
import { authClient } from "@/lib/auth-client"
import { dashboardPathForRole, roleOf } from "@/lib/roles"
import { cn } from "cn"

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Browse Services", href: "/services" },
] as const

const authLinks = [
  { label: "Sign In", href: "/sign-in", style: "outline" },
  { label: "Sign Up", href: "/sign-up", style: "primary" },
] as const

const linkClasses =
  "text-sm font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/"
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

type SessionUser = {
  name?: string | null
  email?: string | null
  image?: string | null
}

function displayNameOf(user: SessionUser) {
  return user.name?.trim() || ""
}

function UserAvatar({
  user,
  size = "default",
}: {
  user: SessionUser
  size?: "default" | "sm" | "lg"
}) {
  const name = displayNameOf(user)
  const initial = name ? Array.from(name)[0]?.toUpperCase() : null

  return (
    <Avatar size={size} className="shrink-0">
      {user.image ? (
        <AvatarImage src={user.image} alt={name || "Profile picture"} />
      ) : null}
      <AvatarFallback className="bg-blush font-medium text-plum">
        {initial ?? <UserIcon aria-hidden="true" className="size-4" />}
      </AvatarFallback>
    </Avatar>
  )
}

function Navbar() {
  const pathname = usePathname() ?? "/"
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const [signingOut, setSigningOut] = React.useState(false)

  const user = session?.user ?? null
  const dashboardHref = user ? dashboardPathForRole(roleOf(user)) : null
  const name = user ? displayNameOf(user) : ""

  async function handleSignOut() {
    if (signingOut) {
      return
    }

    setSigningOut(true)

    try {
      const { error } = await authClient.signOut()

      if (error) {
        toast.add({
          title: "Sign out failed",
          description:
            error.message?.trim() ||
            "We could not sign you out. Please try again.",
          type: "error",
        })
        return
      }

      toast.add({
        title: "Signed out",
        description: "You have been signed out of RupChorcha.",
        type: "success",
      })
      router.refresh()
      router.push("/")
    } catch {
      toast.add({
        title: "Sign out failed",
        description:
          "We could not reach RupChorcha. Check your connection and try again.",
        type: "error",
      })
    } finally {
      setSigningOut(false)
    }
  }

  const profileMenu = user ? (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="h-11 gap-1 rounded-full pr-2 pl-1 hover:bg-blush"
            aria-label={
              name ? `Open profile menu for ${name}` : "Open profile menu"
            }
          />
        }
      >
        <UserAvatar user={user} size="lg" />
        <ChevronDownIcon
          className="size-3.5 text-muted-foreground"
          aria-hidden="true"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-64">
        <div className="flex items-center gap-3 px-1.5 py-2">
          <UserAvatar user={user} size="lg" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-plum">
              {name || "Your account"}
            </p>
            {user.email ? (
              <p className="truncate text-xs text-muted-foreground">
                {user.email}
              </p>
            ) : null}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          render={<Link href={dashboardHref ?? "/"} />}
        >
          <LayoutDashboardIcon aria-hidden="true" />
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={handleSignOut}
          disabled={signingOut}
        >
          <LogOutIcon aria-hidden="true" />
          {signingOut ? "Signing out" : "Logout"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : null

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-ivory">
      <Container className="flex h-20 items-center justify-between gap-6">
        <Logo wordmarkClassName="text-2xl sm:text-[1.65rem]" />

        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-8 md:flex"
        >
          {navLinks.map((link) => {
            const active = isActive(pathname, link.href)

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  linkClasses,
                  "relative py-2",
                  active && "text-plum"
                )}
              >
                {link.label}
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-primary transition-opacity",
                    active ? "opacity-100" : "opacity-0"
                  )}
                />
              </Link>
            )
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isPending ? (
            <span
              aria-hidden="true"
              className="size-10 animate-pulse rounded-full bg-muted"
            />
          ) : user ? (
            profileMenu
          ) : (
            <>
              <Link
                href="/sign-in"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-10 rounded-full border-border bg-transparent px-5 text-sm hover:bg-blush hover:text-plum"
                )}
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-10 rounded-full px-5 text-sm"
                )}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        <Sheet>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon-lg"
                className="md:hidden"
                aria-label="Open navigation menu"
              />
            }
          >
            <MenuIcon aria-hidden="true" />
          </SheetTrigger>
          <SheetContent side="right" className="bg-ivory">
            <SheetHeader className="border-b border-border/60">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <Logo wordmarkClassName="text-2xl" />
            </SheetHeader>

            <nav
              aria-label="Mobile navigation"
              className="flex flex-col gap-1 px-4"
            >
              {navLinks.map((link) => {
                const active = isActive(pathname, link.href)

                return (
                  <SheetClose
                    key={link.href}
                    render={
                      <Link
                        href={link.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "rounded-lg px-3 py-3 text-base font-medium transition-colors hover:bg-blush hover:text-plum focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                          active ? "bg-blush/60 text-plum" : "text-foreground"
                        )}
                      />
                    }
                  >
                    {link.label}
                  </SheetClose>
                )
              })}
            </nav>

            <div className="mt-auto flex flex-col gap-2 border-t border-border/60 p-4">
              {isPending ? (
                <span
                  aria-hidden="true"
                  className="h-10 w-full animate-pulse rounded-full bg-muted"
                />
              ) : user ? (
                <>
                  <div className="flex items-center gap-3 rounded-xl bg-blush/50 p-3">
                    <UserAvatar user={user} size="lg" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-plum">
                        {name || "Your account"}
                      </p>
                      {user.email ? (
                        <p className="truncate text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <SheetClose
                    render={
                      <Link
                        href={dashboardHref ?? "/"}
                        className={cn(
                          buttonVariants({ variant: "outline", size: "lg" }),
                          "h-10 w-full justify-start rounded-full border-border bg-transparent px-5 text-sm hover:bg-blush hover:text-plum"
                        )}
                      />
                    }
                  >
                    <LayoutDashboardIcon aria-hidden="true" />
                    Dashboard
                  </SheetClose>
                  <SheetClose
                    render={
                      <Button
                        variant="destructive"
                        size="lg"
                        className="h-10 w-full justify-start rounded-full px-5 text-sm"
                        onClick={handleSignOut}
                        disabled={signingOut}
                      />
                    }
                  >
                    <LogOutIcon aria-hidden="true" />
                    {signingOut ? "Signing out" : "Logout"}
                  </SheetClose>
                </>
              ) : (
                authLinks.map((link) => (
                  <SheetClose
                    key={link.href}
                    render={
                      <Link
                        href={link.href}
                        className={cn(
                          buttonVariants({
                            variant:
                              link.style === "outline" ? "outline" : "default",
                            size: "lg",
                          }),
                          "h-10 w-full rounded-full px-5 text-sm",
                          link.style === "outline" &&
                            "border-border bg-transparent hover:bg-blush hover:text-plum"
                        )}
                      />
                    }
                  >
                    {link.label}
                  </SheetClose>
                ))
              )}
            </div>
          </SheetContent>
        </Sheet>
      </Container>
    </header>
  )
}

export default Navbar
export { Navbar }
