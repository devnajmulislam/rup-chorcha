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
import { DashboardPagination } from "@/components/dashboard/DashboardPagination"
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
import { useAuthSession } from "@/lib/auth-client"
import { SALON_CATEGORIES } from "@/lib/constants"
import type {
  AdminService,
  PaginationMeta,
  ServiceStatus,
} from "@/lib/dashboard-types"
import { formatCurrency, formatDuration } from "@/lib/format"
import { cn } from "cn"

type StatusFilter = "all" | ServiceStatus

type AdminServicesProps = {
  services: AdminService[]
  meta: PaginationMeta
  initialSearch: string
  activeCategory: string
  activeStatus: StatusFilter
}

const addServiceLinkClass = cn(
  buttonVariants({ size: "lg" }),
  "h-10 rounded-full px-5 text-sm"
)

function buildServicesFilterHref({
  search,
  category,
  status,
  page = 1,
}: {
  search: string
  category: string
  status: StatusFilter
  page?: number
}): string {
  const query = new URLSearchParams()
  const trimmed = search.trim()
  if (trimmed) {
    query.set("search", trimmed)
  }
  if (category && category !== "all") {
    query.set("category", category)
  }
  if (status && status !== "all") {
    query.set("status", status)
  }
  if (page > 1) {
    query.set("page", String(page))
  }
  const serialized = query.toString()
  return serialized ? `/admin/services?${serialized}` : "/admin/services"
}

function AdminServices({
  services,
  meta,
  initialSearch,
  activeCategory,
  activeStatus,
}: AdminServicesProps) {
  const router = useRouter()
  const { setUser } = useAuthSession()
  const [busyId, setBusyId] = React.useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<AdminService | null>(
    null
  )
  const [deleting, setDeleting] = React.useState(false)
  const [searchInput, setSearchInput] = React.useState(initialSearch)
  const [prevSearchProp, setPrevSearchProp] = React.useState(initialSearch)

  if (initialSearch !== prevSearchProp) {
    setPrevSearchProp(initialSearch)
    setSearchInput(initialSearch)
  }

  React.useEffect(() => {
    const trimmedInput = searchInput.trim()
    const trimmedCurrent = initialSearch.trim()
    if (trimmedInput === trimmedCurrent) {
      return
    }

    const timer = setTimeout(() => {
      router.replace(
        buildServicesFilterHref({
          search: trimmedInput,
          category: activeCategory,
          status: activeStatus,
          page: 1,
        }),
        { scroll: false }
      )
    }, 350)

    return () => clearTimeout(timer)
  }, [searchInput, initialSearch, activeCategory, activeStatus, router])

  const hasFilters =
    Boolean(initialSearch.trim()) ||
    activeCategory !== "all" ||
    activeStatus !== "all"

  function resetFilters() {
    setSearchInput("")
    router.replace("/admin/services", { scroll: false })
  }

  async function handleStatusChange(
    service: AdminService,
    nextActive: boolean
  ) {
    setBusyId(service.id)

    try {
      const result = await setServiceStatusAction(
        service.id,
        nextActive ? "active" : "inactive"
      )

      if (!result.success) {
        if (result.blocked) {
          setUser(null)
          router.replace("/sign-in?blocked=1")
          return
        }
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
        if (result.blocked) {
          setUser(null)
          router.replace("/sign-in?blocked=1")
          return
        }
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

  const filterParams = {
    ...(initialSearch.trim() ? { search: initialSearch.trim() } : {}),
    ...(activeCategory !== "all" ? { category: activeCategory } : {}),
    ...(activeStatus !== "all" ? { status: activeStatus } : {}),
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {meta.total === 0 && !hasFilters
            ? "No services yet"
            : `${meta.total} service${meta.total === 1 ? "" : "s"}${hasFilters ? " matching" : ""}`}{" "}
          · only active services appear on the public menu.
        </p>
        <Link href="/admin/services/new" className={addServiceLinkClass}>
          <Plus aria-hidden="true" />
          Add service
        </Link>
      </div>

      {meta.total > 0 || hasFilters ? (
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
              maxLength={100}
              placeholder="Search services by name…"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault()
                  router.replace(
                    buildServicesFilterHref({
                      search: searchInput.trim(),
                      category: activeCategory,
                      status: activeStatus,
                      page: 1,
                    }),
                    { scroll: false }
                  )
                }
              }}
              className="h-10 rounded-xl pl-9"
            />
          </div>

          <div>
            <label htmlFor="admin-services-category" className="sr-only">
              Filter by category
            </label>
            <NativeSelect
              id="admin-services-category"
              value={activeCategory}
              onChange={(event) => {
                router.replace(
                  buildServicesFilterHref({
                    search: searchInput.trim(),
                    category: event.target.value,
                    status: activeStatus,
                    page: 1,
                  }),
                  { scroll: false }
                )
              }}
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
              value={activeStatus}
              onChange={(event) => {
                router.replace(
                  buildServicesFilterHref({
                    search: searchInput.trim(),
                    category: activeCategory,
                    status: event.target.value as StatusFilter,
                    page: 1,
                  }),
                  { scroll: false }
                )
              }}
              className="h-10 w-full"
            >
              <NativeSelectOption value="all">All statuses</NativeSelectOption>
              <NativeSelectOption value="active">Active</NativeSelectOption>
              <NativeSelectOption value="inactive">Inactive</NativeSelectOption>
            </NativeSelect>
          </div>
        </div>
      ) : null}

      {meta.total === 0 && !hasFilters ? (
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
      ) : services.length === 0 ? (
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
        <>
          <ul className="flex flex-col gap-3">
            {services.map((service) => {
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
                      <h3 className="font-heading text-xl leading-tight font-medium break-words text-foreground">
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

          <DashboardPagination
            meta={meta}
            basePath="/admin/services"
            params={filterParams}
          />
        </>
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
            <AlertDialogCancel disabled={deleting}>
              Keep service
            </AlertDialogCancel>
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
