"use server"

import { revalidatePath } from "next/cache"

import {
  createAdminService,
  deleteAdminService,
  updateAdminService,
  updateAdminServiceStatus,
} from "@/lib/backend-api"
import { SALON_CATEGORIES } from "@/lib/constants"
import {
  isAllowedServiceImage,
  type ServiceInput,
  type ServiceStatus,
} from "@/lib/dashboard-types"
import { requireRole } from "@/lib/session"

type ServiceField =
  | "serviceName"
  | "category"
  | "description"
  | "price"
  | "duration"
  | "image"
  | "status"

type ServiceFormValues = Record<ServiceField, string>

type ServiceActionResult =
  | { success: true; message: string }
  | {
      success: false
      message: string
      blocked?: boolean
      fieldErrors?: Partial<Record<ServiceField, string>>
    }

type ParsedService =
  | { ok: true; input: ServiceInput }
  | { ok: false; fieldErrors: Partial<Record<ServiceField, string>> }

const MAX_PRICE_CENTS = 10_000_000
const MAX_DURATION_MINUTES = 1440

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function parseServiceValues(values: ServiceFormValues): ParsedService {
  const fieldErrors: Partial<Record<ServiceField, string>> = {}

  const serviceName = text(values.serviceName)
  if (!serviceName) {
    fieldErrors.serviceName = "Enter a service name."
  } else if (serviceName.length > 120) {
    fieldErrors.serviceName = "Keep the service name under 120 characters."
  }

  const category = text(values.category)
  if (!(SALON_CATEGORIES as readonly string[]).includes(category)) {
    fieldErrors.category = "Choose one of the RupChorcha categories."
  }

  const description = text(values.description)
  if (!description) {
    fieldErrors.description = "Describe the service in a sentence or two."
  } else if (description.length > 1000) {
    fieldErrors.description = "Keep the description under 1000 characters."
  }

  const priceInput = text(values.price).replace(/[$,\s]/g, "")
  const priceAmount = Number(priceInput)
  const price = Math.round(priceAmount * 100)
  if (
    !priceInput ||
    !Number.isFinite(priceAmount) ||
    price <= 0 ||
    price > MAX_PRICE_CENTS
  ) {
    fieldErrors.price = "Enter a price greater than 0, for example 45.00."
  }

  const durationInput = text(values.duration)
  const duration = Number(durationInput)
  if (
    !durationInput ||
    !Number.isInteger(duration) ||
    duration <= 0 ||
    duration > MAX_DURATION_MINUTES
  ) {
    fieldErrors.duration = "Enter the appointment length in whole minutes."
  }

  const image = text(values.image)
  if (!image) {
    fieldErrors.image = "Upload a service image."
  } else if (!isAllowedServiceImage(image)) {
    fieldErrors.image =
      "Service image must be hosted on an approved image host."
  }

  const rawStatus = text(values.status) || "active"
  if (rawStatus !== "active" && rawStatus !== "inactive") {
    fieldErrors.status = "Choose whether the service is active or inactive."
  }
  const status: ServiceStatus =
    rawStatus === "inactive" ? "inactive" : "active"

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors }
  }

  return {
    ok: true,
    input: {
      serviceName,
      category,
      description,
      price,
      duration,
      image,
      status,
    },
  }
}

function revalidateServicePaths(serviceId?: string) {
  revalidatePath("/admin")
  revalidatePath("/admin/services")
  revalidatePath("/admin/services/new")
  revalidatePath("/admin/services/update")
  revalidatePath("/admin/services/update/[id]", "page")
  revalidatePath("/services")
  revalidatePath("/services/[id]", "page")
  if (serviceId) {
    revalidatePath(`/services/${serviceId}`)
  }
  revalidatePath("/")
}

function mapServerFieldErrors(
  errors?: Record<string, string>
): Partial<Record<ServiceField, string>> | undefined {
  if (!errors) {
    return undefined
  }

  const allowed = new Set<ServiceField>([
    "serviceName",
    "category",
    "description",
    "price",
    "duration",
    "image",
    "status",
  ])
  const mapped: Partial<Record<ServiceField, string>> = {}
  for (const [key, val] of Object.entries(errors)) {
    if (allowed.has(key as ServiceField)) {
      mapped[key as ServiceField] = val
    }
  }
  return Object.keys(mapped).length > 0 ? mapped : undefined
}

async function createServiceAction(
  values: ServiceFormValues
): Promise<ServiceActionResult> {
  const session = await requireRole("admin")
  const parsed = parseServiceValues(values)

  if (!parsed.ok) {
    return {
      success: false,
      message: "Check the highlighted fields and try again.",
      fieldErrors: parsed.fieldErrors,
    }
  }

  const result = await createAdminService(session.accessToken, parsed.input)
  if (!result.ok) {
    return {
      success: false,
      message: result.message,
      blocked: result.kind === "blocked",
      fieldErrors: mapServerFieldErrors(result.fieldErrors),
    }
  }

  revalidateServicePaths(result.data.id)

  return {
    success: true,
    message:
      result.data.status === "active"
        ? `${result.data.serviceName} is now active on the public menu.`
        : `${result.data.serviceName} has been saved as inactive.`,
  }
}

async function updateServiceAction(
  serviceId: string,
  values: ServiceFormValues
): Promise<ServiceActionResult> {
  const session = await requireRole("admin")
  const parsed = parseServiceValues(values)

  if (!parsed.ok) {
    return {
      success: false,
      message: "Check the highlighted fields and try again.",
      fieldErrors: parsed.fieldErrors,
    }
  }

  const result = await updateAdminService(
    session.accessToken,
    serviceId,
    parsed.input
  )
  if (!result.ok) {
    return {
      success: false,
      message: result.message,
      blocked: result.kind === "blocked",
      fieldErrors: mapServerFieldErrors(result.fieldErrors),
    }
  }

  revalidateServicePaths(serviceId)

  return {
    success: true,
    message: `${result.data.serviceName} has been updated.`,
  }
}

async function setServiceStatusAction(
  serviceId: string,
  status: ServiceStatus
): Promise<ServiceActionResult> {
  const session = await requireRole("admin")

  if (status !== "active" && status !== "inactive") {
    return { success: false, message: "Unknown service status." }
  }

  const result = await updateAdminServiceStatus(
    session.accessToken,
    serviceId,
    status
  )
  if (!result.ok) {
    return {
      success: false,
      message: result.message,
      blocked: result.kind === "blocked",
    }
  }

  revalidateServicePaths(serviceId)

  return {
    success: true,
    message:
      status === "active"
        ? "Service is active and visible on the public menu."
        : "Service is inactive and hidden from the public menu.",
  }
}

async function deleteServiceAction(
  serviceId: string
): Promise<ServiceActionResult> {
  const session = await requireRole("admin")

  const result = await deleteAdminService(session.accessToken, serviceId)
  if (!result.ok) {
    return {
      success: false,
      message: result.message,
      blocked: result.kind === "blocked",
    }
  }

  revalidateServicePaths(serviceId)

  return {
    success: true,
    message:
      result.data.action === "deactivated"
        ? "This service has appointment history, so it was deactivated instead of deleted."
        : "Service deleted from the menu.",
  }
}

export {
  createServiceAction,
  deleteServiceAction,
  setServiceStatusAction,
  updateServiceAction,
}
export type { ServiceActionResult, ServiceField, ServiceFormValues }
