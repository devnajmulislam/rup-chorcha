"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Eye,
  Loader2Icon,
  Search,
  ShieldBan,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react"

import { setCustomerBlockAction } from "@/app/(dashboard)/admin/users/actions"
import { EmptyState } from "@/components/shared/EmptyState"
import { StatusBadge } from "@/components/shared/StatusBadge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "@/components/ui/toast"
import type { AdminCustomer } from "@/lib/admin"
import { formatSalonDate } from "@/lib/format"
import { cn } from "cn"

type UserStatusFilter = "all" | "active" | "blocked"

const USER_FILTERS: { value: UserStatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "blocked", label: "Blocked" },
]

function initialsOf(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || null
  )
}

function DetailRow({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="text-sm text-foreground">{value}</dd>
    </div>
  )
}

type AdminUsersProps = {
  customers: AdminCustomer[]
}

function AdminUsers({ customers }: AdminUsersProps) {
  const router = useRouter()
  const [statusFilter, setStatusFilter] =
    React.useState<UserStatusFilter>("all")
  const [search, setSearch] = React.useState("")
  const [pendingTarget, setPendingTarget] = React.useState<{
    customer: AdminCustomer
    block: boolean
  } | null>(null)
  const [updating, setUpdating] = React.useState(false)

  const counts: Record<UserStatusFilter, number> = {
    all: customers.length,
    active: customers.filter((c) => !c.isBlocked).length,
    blocked: customers.filter((c) => c.isBlocked).length,
  }

  const normalizedQuery = search.trim().toLowerCase()
  const filteredCustomers = customers.filter((customer) => {
    if (statusFilter === "active" && customer.isBlocked) {
      return false
    }

    if (statusFilter === "blocked" && !customer.isBlocked) {
      return false
    }

    if (normalizedQuery) {
      const matchesName = customer.name.toLowerCase().includes(normalizedQuery)
      const matchesEmail = customer.email
        .toLowerCase()
        .includes(normalizedQuery)
      if (!matchesName && !matchesEmail) {
        return false
      }
    }

    return true
  })

  async function handleConfirmToggle() {
    if (!pendingTarget) {
      return
    }

    setUpdating(true)

    try {
      const result = await setCustomerBlockAction(
        pendingTarget.customer.id,
        pendingTarget.block
      )

      if (!result.success) {
        toast.add({
          title: "Access not updated",
          description: result.message,
          type: "error",
        })
        return
      }

      toast.add({
        title: pendingTarget.block
          ? "Customer blocked"
          : "Customer unblocked",
        description: result.message,
        type: "success",
      })
      setPendingTarget(null)
      router.refresh()
    } catch {
      toast.add({
        title: "Access not updated",
        description: "We could not reach RupChorcha. Please try again.",
        type: "error",
      })
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {customers.length > 0 ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-4 lg:flex-row lg:items-center lg:justify-between">
          <div
            role="group"
            aria-label="Filter customers by access status"
            className="flex flex-wrap items-center gap-2"
          >
            {USER_FILTERS.map((item) => {
              const active = statusFilter === item.value

              return (
                <Button
                  key={item.value}
                  type="button"
                  size="sm"
                  variant={active ? "default" : "outline"}
                  aria-pressed={active}
                  onClick={() => setStatusFilter(item.value)}
                  className={cn(
                    "rounded-full px-4",
                    !active &&
                      "border-border bg-transparent text-foreground hover:bg-blush hover:text-plum"
                  )}
                >
                  {item.label} ({counts[item.value]})
                </Button>
              )
            })}
          </div>

          <div className="relative w-full lg:w-72">
            <label htmlFor="admin-users-search" className="sr-only">
              Search customers by name or email
            </label>
            <Search
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="admin-users-search"
              type="search"
              placeholder="Search name or email…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-10 rounded-xl pl-9"
            />
          </div>
        </div>
      ) : null}

      {customers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No registered customers yet"
          description="Customers who sign up for RupChorcha will appear here."
        />
      ) : filteredCustomers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No matching customers"
          description="No registered customers match the current search or status filter."
        >
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setStatusFilter("all")
              setSearch("")
            }}
            className="h-10 rounded-full border-border bg-transparent px-5 text-sm hover:bg-blush hover:text-plum"
          >
            Reset filters
          </Button>
        </EmptyState>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_18px_40px_-34px_rgba(58,24,48,0.4)]">
          <Table>
            <TableHeader className="bg-blush/35">
              <TableRow className="hover:bg-blush/35">
                <TableHead className="px-4 py-3 text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                  Customer
                </TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                  Phone
                </TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                  Joined
                </TableHead>
                <TableHead className="px-4 py-3 text-right text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                  Appointments
                </TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                  Status
                </TableHead>
                <TableHead className="px-4 py-3 text-right text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => {
                const initials = initialsOf(customer.name)

                return (
                  <TableRow key={customer.id} className="hover:bg-blush/25">
                    <TableCell className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar size="default" className="shrink-0">
                          {customer.image ? (
                            <AvatarImage
                              src={customer.image}
                              alt={customer.name}
                            />
                          ) : null}
                          <AvatarFallback className="bg-blush text-xs font-medium text-plum">
                            {initials ?? (
                              <UserRound
                                className="size-4"
                                aria-hidden="true"
                              />
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">
                            {customer.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {customer.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3.5 text-muted-foreground">
                      {customer.phone || "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3.5 text-muted-foreground">
                      {formatSalonDate(customer.createdAt)}
                    </TableCell>
                    <TableCell className="px-4 py-3.5 text-right font-medium text-plum tabular-nums">
                      {customer.appointmentCount}
                    </TableCell>
                    <TableCell className="px-4 py-3.5">
                      <StatusBadge
                        status={customer.isBlocked ? "blocked" : "active"}
                      />
                    </TableCell>
                    <TableCell className="px-4 py-3.5 text-right">
                      <div className="inline-flex items-center justify-end gap-2">
                        <Dialog>
                          <DialogTrigger
                            render={
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full border-border bg-transparent"
                              />
                            }
                          >
                            <Eye aria-hidden="true" />
                            Details
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <div className="flex items-center gap-3">
                                <Avatar size="lg" className="shrink-0">
                                  {customer.image ? (
                                    <AvatarImage
                                      src={customer.image}
                                      alt={customer.name}
                                    />
                                  ) : null}
                                  <AvatarFallback className="bg-blush font-medium text-plum">
                                    {initials ?? (
                                      <UserRound
                                        className="size-4"
                                        aria-hidden="true"
                                      />
                                    )}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <DialogTitle className="text-lg">
                                    {customer.name}
                                  </DialogTitle>
                                  <DialogDescription>
                                    {customer.email}
                                  </DialogDescription>
                                </div>
                              </div>
                            </DialogHeader>

                            <dl className="grid grid-cols-2 gap-4 pt-2">
                              <DetailRow
                                label="Phone"
                                value={customer.phone || "Not provided"}
                              />
                              <DetailRow
                                label="Account status"
                                value={
                                  <StatusBadge
                                    status={
                                      customer.isBlocked ? "blocked" : "active"
                                    }
                                  />
                                }
                              />
                              <DetailRow label="Account type" value="Customer" />
                              <DetailRow
                                label="Joined on"
                                value={formatSalonDate(customer.createdAt)}
                              />
                              <DetailRow
                                label="Appointment requests"
                                value={customer.appointmentCount}
                              />
                            </dl>

                            <DialogFooter>
                              <DialogClose
                                render={<Button variant="outline" />}
                              >
                                Close
                              </DialogClose>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        {customer.isBlocked ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-full border-success/30 bg-transparent text-success hover:bg-success/10 hover:text-success"
                            onClick={() =>
                              setPendingTarget({ customer, block: false })
                            }
                          >
                            <ShieldCheck aria-hidden="true" />
                            Unblock
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-full border-destructive/30 bg-transparent text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() =>
                              setPendingTarget({ customer, block: true })
                            }
                          >
                            <ShieldBan aria-hidden="true" />
                            Block
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog
        open={Boolean(pendingTarget)}
        onOpenChange={(open) => {
          if (!open && !updating) {
            setPendingTarget(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingTarget?.block
                ? `Block ${pendingTarget.customer.name}?`
                : `Unblock ${pendingTarget?.customer.name ?? "this customer"}?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingTarget?.block
                ? "Blocking revokes active sessions immediately and prevents this customer from signing in or accessing protected booking and dashboard features."
                : "Unblocking restores account access so this customer can sign in, book services, and manage appointments again."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmToggle}
              disabled={updating}
              className={
                pendingTarget?.block
                  ? "bg-destructive text-white hover:bg-destructive/90"
                  : undefined
              }
            >
              {updating ? (
                <>
                  <Loader2Icon className="animate-spin" aria-hidden="true" />
                  {pendingTarget?.block ? "Blocking…" : "Unblocking…"}
                </>
              ) : pendingTarget?.block ? (
                "Block customer"
              ) : (
                "Unblock customer"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export { AdminUsers }
export type { AdminUsersProps }
