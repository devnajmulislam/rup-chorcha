"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ImageIcon,
  Loader2Icon,
  Pencil,
  Plus,
  Scissors,
  Search,
  Trash2,
} from "lucide-react"

import {
  deleteServiceAction,
  setServiceStatusAction,
} from "@/app/(dashboard)/admin/services/actions"
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
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/toast"
import { SALON_CATEGORIES } from "@/lib/constants"
import { formatCurrency, formatDuration } from "@/lib/format"
import type { Service, ServiceStatus } from "@/lib/services"
import { cn } from "cn"

type AdminServicesProps = {
  services: Service[]
}

type StatusFilter = "all" | ServiceStatus

const addServiceLinkClass = cn(
  buttonVariants({ size: "lg" }),
  "h-10 rounded-full px-5 text-sm"
)

function AdminServices({ services }: AdminServicesProps) {
  const router = useRouter()
  const [busyId, setBusyId] = React.useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<Service | null>(null)
  const [deleting, setDeleting] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [categoryFilter, setCategoryFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all")

  const normalizedQuery = search.trim().toLowerCase()
  const filteredServices = services.filter((service) => {
    if (
      normalizedQuery &&
      !service.serviceName.toLowerCase().includes(normalizedQuery)
    ) {
      return false
    }

    if (categoryFilter !== "all" && service.category !== categoryFilter) {
      return false
    }

    if (statusFilter !== "all" && service.status !== statusFilter) {
      return false
    }

    return true
  })

  const hasFilters =
    Boolean(normalizedQuery) ||
    categoryFilter !== "all" ||
    statusFilter !== "all"

  function resetFilters() {
    setSearch("")
    setCategoryFilter("all")
    setStatusFilter("all")
  }

  async function handleStatusChange(service: Service, nextActive: boolean) {
    setBusyId(service.id)

    try {
      const result = await setServiceStatusAction(
        service.id,
        nextActive ? "active" : "inactive"
      )

      if (!result.success) {
        toast.add({
          title: "Status not changed",
          description: result.message,
          type: "error",
        })
        return
      }

      toast.add({
        title: nextActive ? "Service activated" : "Service deactivated",
        description: result.message,
        type: "success",
      })
      router.refresh()
    } catch {
      toast.add({
        title: "Status not changed",
        description: "We could not reach RupChorcha. Please try again.",
        type: "error",
      })
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) {
      return
    }

    setDeleting(true)

    try {
      const result = await deleteServiceAction(deleteTarget.id)

      if (!result.success) {
        toast.add({
          title: "Service not deleted",
          description: result.message,
          type: "error",
        })
        return
      }

      toast.add({
        title: "Service removed",
        description: result.message,
        type: "success",
      })
      setDeleteTarget(null)
      router.refresh()
    } catch {
      toast.add({
        title: "Service not deleted",
        description: "We could not reach RupChorcha. Please try again.",
        type: "error",
      })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {services.length === 0
            ? "No services yet"
            : `${services.length} service${services.length === 1 ? "" : "s"}`}{" "}
          · only active services appear on the public menu.
        </p>
        <Link href="/admin/services/new" className={addServiceLinkClass}>
          <Plus aria-hidden="true" />
          Add service
        </Link>
      </div>

      {services.length > 0 ? (
        <div className="grid gap-3 rounded-2xl border border-border/70 bg-card p-4 sm:grid-cols-[minmax(0,1fr)_13rem_10rem]">
          <div className="relative">
            <label htmlFor="admin-services-search" className="sr-only">
              Search services by name
            </label>
            <Search
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="admin-services-search"
              type="search"
              placeholder="Search services by name…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-10 rounded-xl pl-9"
            />
          </div>

          <div>
            <label htmlFor="admin-services-category" className="sr-only">
              Filter by category
            </label>
            <NativeSelect
              id="admin-services-category"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="h-10 w-full"
            >
              <NativeSelectOption value="all">
                All categories
              </NativeSelectOption>
              {SALON_CATEGORIES.map((category) => (
                <NativeSelectOption key={category} value={category}>
                  {category}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>

          <div>
            <label htmlFor="admin-services-status" className="sr-only">
              Filter by status
            </label>
            <NativeSelect
              id="admin-services-status"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as StatusFilter)
              }
              className="h-10 w-full"
            >
              <NativeSelectOption value="all">All statuses</NativeSelectOption>
              <NativeSelectOption value="active">Active</NativeSelectOption>
              <NativeSelectOption value="inactive">Inactive</NativeSelectOption>
            </NativeSelect>
          </div>
        </div>
      ) : null}

      {services.length === 0 ? (
        <EmptyState
          icon={Scissors}
          title="No services yet"
          description="Add the first RupChorcha service and it will appear on the public menu for customers to browse."
        >
          <Link href="/admin/services/new" className={addServiceLinkClass}>
            <Plus aria-hidden="true" />
            Add service
          </Link>
        </EmptyState>
      ) : filteredServices.length === 0 ? (
        <EmptyState
          icon={Scissors}
          title="No matching services"
          description="No services match the current search or filter selection."
        >
          {hasFilters ? (
            <Button
              type="button"
              variant="outline"
              onClick={resetFilters}
              className="h-10 rounded-full border-border bg-transparent px-5 text-sm hover:bg-blush hover:text-plum"
            >
              Reset filters
            </Button>
          ) : null}
        </EmptyState>
      ) : (
        <ul className="flex flex-col gap-3">
          {filteredServices.map((service) => {
            const busy = busyId === service.id

            return (
              <li
                key={service.id}
                className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-4 shadow-[0_18px_40px_-34px_rgba(58,24,48,0.4)] sm:flex-row sm:items-center"
              >
                <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-blush">
                  {service.image ? (
                    <Image
                      src={service.image}
                      alt={service.serviceName}
                      fill
                      sizes="4rem"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex size-full items-center justify-center text-plum/50">
                      <ImageIcon className="size-5" aria-hidden="true" />
                    </span>
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-heading text-xl leading-tight font-medium text-foreground">
                      {service.serviceName}
                    </h3>
                    <StatusBadge status={service.status} />
                  </div>
                  <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
                    {service.category}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(service.price)} ·{" "}
                    {formatDuration(service.duration)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 border-t border-border/70 pt-3 sm:justify-end sm:border-t-0 sm:pt-0">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={service.status === "active"}
                      onCheckedChange={(checked) =>
                        handleStatusChange(service, checked)
                      }
                      disabled={busy}
                      aria-label={`Show ${service.serviceName} on the public menu`}
                    />
                    <span className="text-xs font-medium text-muted-foreground">
                      {service.status === "active" ? "Visible" : "Hidden"}
                    </span>
                  </div>

                  <Link
                    href={`/admin/services/update/${service.id}`}
                    aria-disabled={busy}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "rounded-full border-border bg-transparent",
                      busy && "pointer-events-none opacity-50"
                    )}
                  >
                    <Pencil aria-hidden="true" />
                    Edit
                  </Link>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full border-destructive/30 bg-transparent text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setDeleteTarget(service)}
                    disabled={busy}
                  >
                    <Trash2 aria-hidden="true" />
                    Delete
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !deleting) {
            setDeleteTarget(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {deleteTarget?.serviceName ?? "this service"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Services with existing appointments are deactivated instead of
              deleted, so customers keep their booking history. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Keep service</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2Icon className="animate-spin" aria-hidden="true" />
                  Deleting
                </>
              ) : (
                "Delete service"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export { AdminServices }
export type { AdminServicesProps }
