"use server"

import { revalidatePath } from "next/cache"

import { SALON_CATEGORIES } from "@/lib/constants"
import {
  createService,
  deleteService,
  isAllowedServiceImage,
  setServiceStatus,
  updateService,
  type DeleteServiceOutcome,
  type ServiceInput,
  type ServiceStatus,
} from "@/lib/services"
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

function revalidateServicePaths() {
  revalidatePath("/admin")
  revalidatePath("/admin/services")
  revalidatePath("/admin/services/new")
  revalidatePath("/admin/services/update")
  revalidatePath("/admin/services/update/[id]", "page")
  revalidatePath("/services")
  revalidatePath("/")
}

async function createServiceAction(
  values: ServiceFormValues
): Promise<ServiceActionResult> {
  await requireRole("admin")

  const parsed = parseServiceValues(values)

  if (!parsed.ok) {
    return {
      success: false,
      message: "Check the highlighted fields and try again.",
      fieldErrors: parsed.fieldErrors,
    }
  }

  try {
    await createService(parsed.input)
  } catch {
    return {
      success: false,
      message: "We could not save this service. Please try again.",
    }
  }

  revalidateServicePaths()

  return {
    success: true,
    message:
      parsed.input.status === "active"
        ? `${parsed.input.serviceName} is now active on the public menu.`
        : `${parsed.input.serviceName} has been saved as inactive.`,
  }
}

async function updateServiceAction(
  serviceId: string,
  values: ServiceFormValues
): Promise<ServiceActionResult> {
  await requireRole("admin")

  const parsed = parseServiceValues(values)

  if (!parsed.ok) {
    return {
      success: false,
      message: "Check the highlighted fields and try again.",
      fieldErrors: parsed.fieldErrors,
    }
  }

  try {
    const updated = await updateService(serviceId, parsed.input)

    if (!updated) {
      return { success: false, message: "That service no longer exists." }
    }
  } catch {
    return {
      success: false,
      message: "We could not update this service. Please try again.",
    }
  }

  revalidateServicePaths()

  return {
    success: true,
    message: `${parsed.input.serviceName} has been updated.`,
  }
}

async function setServiceStatusAction(
  serviceId: string,
  status: ServiceStatus
): Promise<ServiceActionResult> {
  await requireRole("admin")

  if (status !== "active" && status !== "inactive") {
    return { success: false, message: "Unknown service status." }
  }

  try {
    const updated = await setServiceStatus(serviceId, status)

    if (!updated) {
      return { success: false, message: "That service no longer exists." }
    }
  } catch {
    return {
      success: false,
      message: "We could not change this service. Please try again.",
    }
  }

  revalidateServicePaths()

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
  await requireRole("admin")

  let outcome: DeleteServiceOutcome

  try {
    outcome = await deleteService(serviceId)
  } catch {
    return {
      success: false,
      message: "We could not delete this service. Please try again.",
    }
  }

  if (outcome === "missing") {
    return { success: false, message: "That service no longer exists." }
  }

  revalidateServicePaths()

  return {
    success: true,
    message:
      outcome === "deactivated"
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
