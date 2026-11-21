import { ObjectId } from "mongodb"

import type {
  AppointmentStatus,
  AdminTransaction,
  CustomerTransaction,
  PaymentStatus,
  TransactionStatus,
} from "@/lib/dashboard-types"
import { getDatabase } from "@/lib/db"

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

type AppointmentDocument = {
  _id: ObjectId
  serviceId: ObjectId
  customerId: string
  servicePrice: number
  paymentStatus: PaymentStatus
  status: AppointmentStatus
}

type CustomerTransactionRow = TransactionDocument & {
  appointment?: {
    appointmentDate?: Date
    serviceId?: ObjectId
  } | null
  service?: {
    serviceName?: string
  } | null
}

type AdminTransactionRow = TransactionDocument & {
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

/**
 * Step 5 temporary read helper: customer payment history migrates to Express
 * `/api/transactions/my` in Step 5 once Stripe checkout and webhooks are built.
 */
async function getCustomerTransactions(
  customerId: string
): Promise<CustomerTransaction[]> {
  if (!process.env.MONGODB_URI?.trim()) {
    return []
  }

  const db = await getDatabase()

  const rows = await db
    .collection<TransactionDocument>("transactions")
    .aggregate<CustomerTransactionRow>([
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

/**
 * Step 5 temporary payment eligibility helper until `/api/payments/checkout`
 * is implemented on Express in Step 5.
 */
async function verifyPayableAppointment(
  customerId: string,
  appointmentId: string
): Promise<PayableAppointmentResult> {
  if (!ObjectId.isValid(appointmentId) || !process.env.MONGODB_URI?.trim()) {
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
 * Step 5 temporary read-only ledger helper until `/api/admin/transactions` is
 * implemented on Express in Step 5.
 */
async function getAllTransactions(): Promise<AdminTransaction[]> {
  if (!process.env.MONGODB_URI?.trim()) {
    return []
  }

  const db = await getDatabase()

  const rows = await db
    .collection<TransactionDocument>("transactions")
    .aggregate<AdminTransactionRow>([
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
  getAllTransactions,
  getCustomerTransactions,
  verifyPayableAppointment,
}
export type { PayableAppointmentResult }
