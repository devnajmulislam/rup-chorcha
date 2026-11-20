import { ObjectId } from "mongodb"

import { getDatabase } from "@/lib/db"

type AppointmentStatus = "pending" | "confirmed" | "cancelled"
type PaymentStatus = "unpaid" | "paid"

type AppointmentDocument = {
  _id: ObjectId
  serviceId: ObjectId
  customerId: string
  appointmentDate: Date
  timeSlot: string
  message?: string
  servicePrice: number
  paymentStatus: PaymentStatus
  status: AppointmentStatus
  createdAt: Date
}

type ServiceSummary = {
  serviceName?: string
  category?: string
  image?: string
}

type AppointmentRow = AppointmentDocument & { service?: ServiceSummary | null }

/**
 * Serializable appointment shape handed to client components. Dates are ISO
 * strings so the data can cross the server/client boundary safely.
 */
type CustomerAppointment = {
  id: string
  serviceName: string
  serviceCategory: string
  serviceImage: string | null
  appointmentDate: string
  timeSlot: string
  servicePrice: number
  status: AppointmentStatus
  paymentStatus: PaymentStatus
  message: string | null
  requestedAt: string
}

type AppointmentStats = {
  total: number
  pending: number
  confirmed: number
  cancelled: number
}

type TransactionStatus = "paid" | "failed"

type TransactionDocument = {
  _id: ObjectId
  appointmentId: ObjectId
  customerId: string
  amount: number
  currency: string
  stripeSessionId: string
  status: TransactionStatus
  createdAt: Date
}

type TransactionRow = TransactionDocument & {
  appointment?: {
    appointmentDate?: Date
    serviceId?: ObjectId
  } | null
  service?: ServiceSummary | null
}

type CustomerTransaction = {
  id: string
  appointmentId: string
  serviceName: string
  appointmentDate: string | null
  amount: number
  currency: string
  stripeSessionId: string
  status: TransactionStatus
  createdAt: string
}

type PayableAppointmentResult =
  | {
      ok: true
      appointment: {
        id: string
        serviceId: string
        servicePrice: number
      }
    }
  | {
      ok: false
      reason: "not_found" | "pending" | "cancelled" | "already_paid"
    }

function toAppointment(row: AppointmentRow): CustomerAppointment {
  return {
    id: row._id.toString(),
    serviceName: row.service?.serviceName?.trim() || "Service no longer offered",
    serviceCategory: row.service?.category?.trim() || "Uncategorised",
    serviceImage: row.service?.image?.trim() || null,
    appointmentDate: new Date(row.appointmentDate).toISOString(),
    timeSlot: row.timeSlot,
    servicePrice: row.servicePrice,
    status: row.status,
    paymentStatus: row.paymentStatus,
    message: row.message?.trim() || null,
    requestedAt: new Date(row.createdAt).toISOString(),
  }
}

/**
 * Every query is scoped by the session user's id, so a customer can only ever
 * read their own appointment requests.
 */
async function getCustomerAppointments(
  customerId: string
): Promise<CustomerAppointment[]> {
  const db = await getDatabase()

  const rows = await db
    .collection<AppointmentDocument>("appointments")
    .aggregate<AppointmentRow>([
      { $match: { customerId } },
      { $sort: { appointmentDate: -1, timeSlot: -1, createdAt: -1 } },
      {
        $lookup: {
          from: "services",
          localField: "serviceId",
          foreignField: "_id",
          as: "service",
        },
      },
      { $unwind: { path: "$service", preserveNullAndEmptyArrays: true } },
    ])
    .toArray()

  return rows.map(toAppointment)
}

function getAppointmentStats(
  appointments: CustomerAppointment[]
): AppointmentStats {
  return {
    total: appointments.length,
    pending: appointments.filter((item) => item.status === "pending").length,
    confirmed: appointments.filter((item) => item.status === "confirmed").length,
    cancelled: appointments.filter((item) => item.status === "cancelled")
      .length,
  }
}

/**
 * Cancelling is filtered by owner and status in the database, so an already
 * confirmed or cancelled request can never be cancelled by a stale client.
 */
async function cancelPendingAppointment(
  customerId: string,
  appointmentId: string
): Promise<boolean> {
  if (!ObjectId.isValid(appointmentId)) {
    return false
  }

  const db = await getDatabase()

  const result = await db.collection<AppointmentDocument>("appointments").updateOne(
    {
      _id: new ObjectId(appointmentId),
      customerId,
      status: "pending",
    },
    { $set: { status: "cancelled", updatedAt: new Date() } }
  )

  return result.modifiedCount === 1
}

/**
 * Verifies ownership, confirmed status, and unpaid state in MongoDB before any
 * payment flow starts, preventing payment on pending, cancelled, or paid rows.
 */
async function verifyPayableAppointment(
  customerId: string,
  appointmentId: string
): Promise<PayableAppointmentResult> {
  if (!ObjectId.isValid(appointmentId)) {
    return { ok: false, reason: "not_found" }
  }

  const db = await getDatabase()
  const _id = new ObjectId(appointmentId)

  const appointment = await db
    .collection<AppointmentDocument>("appointments")
    .findOne({ _id, customerId })

  if (!appointment) {
    return { ok: false, reason: "not_found" }
  }

  if (appointment.status === "pending") {
    return { ok: false, reason: "pending" }
  }

  if (appointment.status === "cancelled") {
    return { ok: false, reason: "cancelled" }
  }

  if (appointment.paymentStatus === "paid") {
    return { ok: false, reason: "already_paid" }
  }

  const existingPaidTx = await db
    .collection<TransactionDocument>("transactions")
    .findOne({ appointmentId: _id, status: "paid" })

  if (existingPaidTx) {
    return { ok: false, reason: "already_paid" }
  }

  return {
    ok: true,
    appointment: {
      id: appointment._id.toString(),
      serviceId: appointment.serviceId.toString(),
      servicePrice: appointment.servicePrice,
    },
  }
}

/**
 * Payment history is strictly scoped by the session customer's id.
 */
async function getCustomerTransactions(
  customerId: string
): Promise<CustomerTransaction[]> {
  const db = await getDatabase()

  const rows = await db
    .collection<TransactionDocument>("transactions")
    .aggregate<TransactionRow>([
      { $match: { customerId } },
      { $sort: { createdAt: -1 } },
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
  cancelPendingAppointment,
  getAppointmentStats,
  getCustomerAppointments,
  getCustomerTransactions,
  verifyPayableAppointment,
}
export type {
  AppointmentStats,
  AppointmentStatus,
  CustomerAppointment,
  CustomerTransaction,
  PayableAppointmentResult,
  PaymentStatus,
  TransactionStatus,
}
