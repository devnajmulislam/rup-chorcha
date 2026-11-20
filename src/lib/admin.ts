import { ObjectId } from "mongodb"

import type { AppointmentStatus, PaymentStatus, TransactionStatus } from "@/lib/appointments"
import { getDatabase } from "@/lib/db"

type AdminOverview = {
  totalCustomers: number
  activeServices: number
  totalAppointments: number
  pendingAppointments: number
  confirmedAppointments: number
  successfulPayments: number
}

type AdminAppointment = {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  customerPhone: string | null
  serviceId: string
  serviceName: string
  serviceCategory: string
  appointmentDate: string
  timeSlot: string
  message: string | null
  servicePrice: number
  status: AppointmentStatus
  paymentStatus: PaymentStatus
  requestedAt: string
}

type AdminCustomer = {
  id: string
  name: string
  email: string
  phone: string | null
  image: string | null
  isBlocked: boolean
  createdAt: string
  appointmentCount: number
}

type AdminTransaction = {
  id: string
  appointmentId: string
  customerId: string
  customerName: string
  customerEmail: string
  serviceName: string
  appointmentDate: string | null
  amount: number
  currency: string
  stripeSessionId: string
  status: TransactionStatus
  createdAt: string
}

function userIdFilter(userId: string) {
  return ObjectId.isValid(userId)
    ? { $or: [{ _id: new ObjectId(userId) }, { id: userId }] }
    : { id: userId }
}

/**
 * Salon-wide counters for the admin overview. Payments are counted from paid
 * transaction records, the same source the payment flow writes to.
 */
async function getAdminOverview(): Promise<AdminOverview> {
  const db = await getDatabase()

  const [
    totalCustomers,
    activeServices,
    totalAppointments,
    pendingAppointments,
    confirmedAppointments,
    successfulPayments,
  ] = await Promise.all([
    db.collection("user").countDocuments({ role: { $ne: "admin" } }),
    db.collection("services").countDocuments({ status: { $ne: "inactive" } }),
    db.collection("appointments").countDocuments({}),
    db.collection("appointments").countDocuments({ status: "pending" }),
    db.collection("appointments").countDocuments({ status: "confirmed" }),
    db.collection("transactions").countDocuments({ status: "paid" }),
  ])

  return {
    totalCustomers,
    activeServices,
    totalAppointments,
    pendingAppointments,
    confirmedAppointments,
    successfulPayments,
  }
}

type RawAdminAppointmentRow = {
  _id: ObjectId
  customerId: string | ObjectId
  serviceId: ObjectId
  appointmentDate: Date
  timeSlot: string
  message?: string
  servicePrice: number
  status: AppointmentStatus
  paymentStatus: PaymentStatus
  createdAt: Date
  service?: {
    serviceName?: string
    category?: string
  } | null
  customer?: {
    name?: string
    email?: string
    phone?: string
  } | null
}

async function getAllAppointments(): Promise<AdminAppointment[]> {
  const db = await getDatabase()

  const rows = await db
    .collection("appointments")
    .aggregate<RawAdminAppointmentRow>([
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "services",
          localField: "serviceId",
          foreignField: "_id",
          as: "service",
        },
      },
      { $unwind: { path: "$service", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "user",
          let: { cid: { $toString: "$customerId" } },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: [{ $toString: "$_id" }, "$$cid"] },
                    { $eq: ["$id", "$$cid"] },
                  ],
                },
              },
            },
            { $project: { name: 1, email: 1, phone: 1 } },
          ],
          as: "customer",
        },
      },
      { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
    ])
    .toArray()

  return rows.map((row) => ({
    id: row._id.toString(),
    customerId: String(row.customerId),
    customerName: row.customer?.name?.trim() || "Unknown customer",
    customerEmail: row.customer?.email?.trim() || "",
    customerPhone: row.customer?.phone?.trim() || null,
    serviceId: row.serviceId.toString(),
    serviceName: row.service?.serviceName?.trim() || "Service no longer offered",
    serviceCategory: row.service?.category?.trim() || "Uncategorised",
    appointmentDate: new Date(row.appointmentDate).toISOString(),
    timeSlot: row.timeSlot,
    message: row.message?.trim() || null,
    servicePrice: row.servicePrice,
    status: row.status,
    paymentStatus: row.paymentStatus,
    requestedAt: new Date(row.createdAt).toISOString(),
  }))
}

async function confirmPendingAppointment(
  appointmentId: string
): Promise<"confirmed" | "not_pending" | "missing"> {
  if (!ObjectId.isValid(appointmentId)) {
    return "missing"
  }

  const db = await getDatabase()
  const _id = new ObjectId(appointmentId)

  const result = await db
    .collection("appointments")
    .updateOne(
      { _id, status: "pending" },
      { $set: { status: "confirmed", updatedAt: new Date() } }
    )

  if (result.modifiedCount === 1) {
    return "confirmed"
  }

  const existing = await db
    .collection("appointments")
    .findOne({ _id }, { projection: { status: 1 } })

  return existing ? "not_pending" : "missing"
}

async function cancelAdminAppointment(
  appointmentId: string
): Promise<"cancelled" | "already_cancelled" | "missing"> {
  if (!ObjectId.isValid(appointmentId)) {
    return "missing"
  }

  const db = await getDatabase()
  const _id = new ObjectId(appointmentId)

  const result = await db
    .collection("appointments")
    .updateOne(
      { _id, status: { $in: ["pending", "confirmed"] } },
      { $set: { status: "cancelled", updatedAt: new Date() } }
    )

  if (result.modifiedCount === 1) {
    return "cancelled"
  }

  const existing = await db
    .collection("appointments")
    .findOne({ _id }, { projection: { status: 1 } })

  return existing ? "already_cancelled" : "missing"
}

type RawCustomerRow = {
  _id: ObjectId
  id?: string
  name?: string
  email?: string
  phone?: string
  image?: string
  isBlocked?: boolean
  createdAt?: Date
  appointmentMeta?: { count: number }[]
}

async function getRegisteredCustomers(): Promise<AdminCustomer[]> {
  const db = await getDatabase()

  const rows = await db
    .collection("user")
    .aggregate<RawCustomerRow>([
      { $match: { role: { $ne: "admin" } } },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "appointments",
          let: {
            uid: "$_id",
            uidStr: { $ifNull: ["$id", { $toString: "$_id" }] },
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    {
                      $eq: [
                        { $toString: "$customerId" },
                        { $toString: "$$uid" },
                      ],
                    },
                    { $eq: ["$customerId", "$$uidStr"] },
                  ],
                },
              },
            },
            { $count: "count" },
          ],
          as: "appointmentMeta",
        },
      },
    ])
    .toArray()

  return rows.map((row) => ({
    id: row.id?.trim() || row._id.toString(),
    name: row.name?.trim() || "Unnamed customer",
    email: row.email?.trim() || "",
    phone: row.phone?.trim() || null,
    image: row.image?.trim() || null,
    isBlocked: row.isBlocked === true,
    createdAt: row.createdAt
      ? new Date(row.createdAt).toISOString()
      : new Date().toISOString(),
    appointmentCount: row.appointmentMeta?.[0]?.count ?? 0,
  }))
}

async function setCustomerBlockedStatus(
  userId: string,
  isBlocked: boolean
): Promise<"updated" | "forbidden_admin" | "missing"> {
  const db = await getDatabase()
  const filter = userIdFilter(userId)

  const existing = await db
    .collection("user")
    .findOne(filter, { projection: { _id: 1, id: 1, role: 1 } })

  if (!existing) {
    return "missing"
  }

  if (existing.role === "admin") {
    return "forbidden_admin"
  }

  await db
    .collection("user")
    .updateOne(
      { ...filter, role: { $ne: "admin" } },
      { $set: { isBlocked, updatedAt: new Date() } }
    )

  if (isBlocked) {
    const candidateIds: Array<string | ObjectId> = [
      userId,
      existing._id,
      existing._id.toString(),
    ]

    if (typeof existing.id === "string" && existing.id.trim()) {
      candidateIds.push(existing.id)
    }

    if (ObjectId.isValid(userId)) {
      candidateIds.push(new ObjectId(userId))
    }

    await db
      .collection("session")
      .deleteMany({ userId: { $in: candidateIds } })
  }

  return "updated"
}

type RawAdminTransactionRow = {
  _id: ObjectId
  appointmentId: ObjectId
  customerId: string | ObjectId
  amount: number
  currency?: string
  stripeSessionId: string
  status: TransactionStatus
  createdAt: Date
  customer?: {
    name?: string
    email?: string
  } | null
  appointment?: {
    appointmentDate?: Date
    serviceId?: ObjectId
  } | null
  service?: {
    serviceName?: string
  } | null
}

/**
 * Strictly read-only view of all payment transactions. No admin write or
 * manual payment status update helper exists by design.
 */
async function getAllTransactions(): Promise<AdminTransaction[]> {
  const db = await getDatabase()

  const rows = await db
    .collection("transactions")
    .aggregate<RawAdminTransactionRow>([
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "user",
          let: { cid: { $toString: "$customerId" } },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: [{ $toString: "$_id" }, "$$cid"] },
                    { $eq: ["$id", "$$cid"] },
                  ],
                },
              },
            },
            { $project: { name: 1, email: 1 } },
          ],
          as: "customer",
        },
      },
      { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "appointments",
          localField: "appointmentId",
          foreignField: "_id",
          as: "appointment",
        },
      },
      { $unwind: { path: "$appointment", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "services",
          localField: "appointment.serviceId",
          foreignField: "_id",
          as: "service",
        },
      },
      { $unwind: { path: "$service", preserveNullAndEmptyArrays: true } },
    ])
    .toArray()

  return rows.map((row) => ({
    id: row._id.toString(),
    appointmentId: row.appointmentId.toString(),
    customerId: String(row.customerId),
    customerName: row.customer?.name?.trim() || "Unknown customer",
    customerEmail: row.customer?.email?.trim() || "",
    serviceName:
      row.service?.serviceName?.trim() || "Service no longer offered",
    appointmentDate: row.appointment?.appointmentDate
      ? new Date(row.appointment.appointmentDate).toISOString()
      : null,
    amount: row.amount,
    currency: (row.currency || "usd").toUpperCase(),
    stripeSessionId: row.stripeSessionId,
    status: row.status === "failed" ? "failed" : "paid",
    createdAt: new Date(row.createdAt).toISOString(),
  }))
}

export {
  cancelAdminAppointment,
  confirmPendingAppointment,
  getAdminOverview,
  getAllAppointments,
  getAllTransactions,
  getRegisteredCustomers,
  setCustomerBlockedStatus,
}
export type {
  AdminAppointment,
  AdminCustomer,
  AdminOverview,
  AdminTransaction,
}
