import { ObjectId } from "mongodb"

import { getDatabase } from "@/lib/db"

type ServiceStatus = "active" | "inactive"

/** Serializable service shape shared by the admin dashboard and public menu. */
type Service = {
  id: string
  serviceName: string
  category: string
  description: string
  price: number
  duration: number
  image: string
  status: ServiceStatus
}

type ServiceInput = {
  serviceName: string
  category: string
  description: string
  price: number
  duration: number
  image: string
  status?: ServiceStatus
}

type ServiceDocument = ServiceInput & {
  _id: ObjectId
  status?: ServiceStatus
  createdAt?: Date
  updatedAt?: Date
}

/**
 * `next/image` only renders hosts listed in `next.config.ts`, so the same
 * hosts are accepted here instead of storing URLs that would break the menu.
 */
const SERVICE_IMAGE_HOSTS = [
  "i.ibb.co",
  "i.ibb.co.com",
  "images.unsplash.com",
  "lh3.googleusercontent.com",
  "lh4.googleusercontent.com",
  "lh5.googleusercontent.com",
  "lh6.googleusercontent.com",
]

function isAllowedServiceImage(value: string) {
  try {
    const url = new URL(value)
    return (
      url.protocol === "https:" && SERVICE_IMAGE_HOSTS.includes(url.hostname)
    )
  } catch {
    return false
  }
}

function toService(row: ServiceDocument): Service {
  return {
    id: row._id.toString(),
    serviceName: row.serviceName?.trim() || "Untitled service",
    category: row.category?.trim() || "Uncategorised",
    description: row.description?.trim() || "",
    price: row.price,
    duration: row.duration,
    image: row.image?.trim() || "",
    status: row.status === "inactive" ? "inactive" : "active",
  }
}

async function servicesCollection() {
  const db = await getDatabase()
  return db.collection<ServiceDocument>("services")
}

/** Only active services are shown on the public menu or offered for booking. */
async function getActiveServices(): Promise<Service[]> {
  const collection = await servicesCollection()
  const rows = await collection
    .find({ status: { $ne: "inactive" } })
    .sort({ serviceName: 1 })
    .toArray()

  return rows.map(toService)
}

async function getAllServices(): Promise<Service[]> {
  const collection = await servicesCollection()
  const rows = await collection
    .find({})
    .sort({ status: 1, serviceName: 1 })
    .toArray()

  return rows.map(toService)
}

/** Admin lookup: returns the service whatever its status, or null. */
async function getServiceById(serviceId: string): Promise<Service | null> {
  if (!ObjectId.isValid(serviceId)) {
    return null
  }

  const collection = await servicesCollection()
  const row = await collection.findOne({ _id: new ObjectId(serviceId) })

  return row ? toService(row) : null
}

async function createService(input: ServiceInput): Promise<string> {
  const collection = await servicesCollection()
  const now = new Date()

  const result = await collection.insertOne({
    ...input,
    status: input.status === "inactive" ? "inactive" : "active",
    createdAt: now,
    updatedAt: now,
  } as ServiceDocument)

  return result.insertedId.toString()
}

async function updateService(
  serviceId: string,
  input: ServiceInput
): Promise<boolean> {
  if (!ObjectId.isValid(serviceId)) {
    return false
  }

  const collection = await servicesCollection()
  const result = await collection.updateOne(
    { _id: new ObjectId(serviceId) },
    {
      $set: {
        ...input,
        status: input.status === "inactive" ? "inactive" : "active",
        updatedAt: new Date(),
      },
    }
  )

  return result.matchedCount === 1
}

async function setServiceStatus(
  serviceId: string,
  status: ServiceStatus
): Promise<boolean> {
  if (!ObjectId.isValid(serviceId)) {
    return false
  }

  const collection = await servicesCollection()
  const result = await collection.updateOne(
    { _id: new ObjectId(serviceId) },
    { $set: { status, updatedAt: new Date() } }
  )

  return result.matchedCount === 1
}

type DeleteServiceOutcome = "deleted" | "deactivated" | "missing"

/**
 * Booked services are part of a customer's history, so they are deactivated
 * instead of deleted. Hard-deleting only happens when nothing references them.
 */
async function deleteService(
  serviceId: string
): Promise<DeleteServiceOutcome> {
  if (!ObjectId.isValid(serviceId)) {
    return "missing"
  }

  const db = await getDatabase()
  const _id = new ObjectId(serviceId)
  const service = await db.collection<ServiceDocument>("services").findOne({ _id })

  if (!service) {
    return "missing"
  }

  const referencingAppointments = await db
    .collection("appointments")
    .countDocuments({ serviceId: _id })

  if (referencingAppointments > 0) {
    await setServiceStatus(serviceId, "inactive")
    return "deactivated"
  }

  await db.collection<ServiceDocument>("services").deleteOne({ _id })
  return "deleted"
}

export {
  createService,
  deleteService,
  getActiveServices,
  getAllServices,
  getServiceById,
  isAllowedServiceImage,
  setServiceStatus,
  updateService,
}
export type {
  DeleteServiceOutcome,
  Service,
  ServiceInput,
  ServiceStatus,
}
