import { z } from "zod"

import { TIME_SLOTS, type TimeSlot } from "@/lib/constants"

const SALON_TIMEZONE = "Asia/Dhaka"
const MAX_BOOKING_ADVANCE_DAYS = 90
const MAX_BOOKING_MESSAGE_LENGTH = 500
const DATE_STRING_REGEX = /^\d{4}-\d{2}-\d{2}$/
const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/

type SlotAvailability = {
  serviceId: string
  date: string
  timezone: string
  slots: TimeSlot[]
  bookedSlots: TimeSlot[]
  pastSlots: TimeSlot[]
  availableSlots: TimeSlot[]
}

type CreatedAppointment = {
  id: string
  serviceId: string
  serviceName: string
  serviceCategory: string
  serviceImage: string | null
  serviceDuration: number | null
  customerId: string
  appointmentDate: string
  appointmentDateLocal: string | null
  timeSlot: TimeSlot | string
  message: string | null
  servicePrice: number
  status: "pending" | "confirmed" | "cancelled"
  paymentStatus: "unpaid" | "paid"
  createdAt: string | null
  updatedAt: string | null
}

function isValidDateString(value: string): boolean {
  const trimmed = value.trim()
  if (!DATE_STRING_REGEX.test(trimmed)) {
    return false
  }

  const [y, m, d] = trimmed.split("-").map(Number)
  if (m < 1 || m > 12 || d < 1 || d > 31) {
    return false
  }

  const utc = new Date(Date.UTC(y, m - 1, d))
  return (
    utc.getUTCFullYear() === y &&
    utc.getUTCMonth() === m - 1 &&
    utc.getUTCDate() === d
  )
}

function getSalonTodayDateString(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: SALON_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now)
}

function addDaysToDateString(dateStr: string, days: number): string {
  if (!isValidDateString(dateStr)) {
    return getSalonTodayDateString()
  }

  const [y, m, d] = dateStr.split("-").map(Number)
  const utc = new Date(Date.UTC(y, m - 1, d + days))
  return utc.toISOString().slice(0, 10)
}

/**
 * Local noon avoids UTC/local timezone shifts when passing calendar dates to
 * DayPicker in browsers outside Asia/Dhaka.
 */
function dateStringToCalendarDate(dateStr: string): Date | undefined {
  if (!isValidDateString(dateStr)) {
    return undefined
  }

  const [y, m, d] = dateStr.split("-").map(Number)
  return new Date(y, m - 1, d, 12, 0, 0, 0)
}

function calendarDateToDateString(date: Date): string {
  const year = String(date.getFullYear())
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function formatDateStringReadable(dateStr: string): string {
  if (!isValidDateString(dateStr)) {
    return dateStr
  }

  const date = new Date(`${dateStr}T12:00:00.000+06:00`)
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: SALON_TIMEZONE,
  }).format(date)
}

const bookingRequestSchema = z.object({
  serviceId: z
    .string({ error: "Service ID is required." })
    .trim()
    .regex(OBJECT_ID_REGEX, "Invalid service ID."),
  appointmentDate: z
    .string({ error: "Select an appointment date." })
    .trim()
    .refine(isValidDateString, "Select a valid appointment date."),
  timeSlot: z.enum(TIME_SLOTS, {
    error: "Select one of the salon time slots.",
  }),
  message: z
    .union([z.string(), z.null()])
    .optional()
    .transform((value) => {
      if (typeof value !== "string") {
        return null
      }
      const trimmed = value.trim()
      return trimmed.length > 0 ? trimmed : null
    })
    .refine(
      (value) => value === null || value.length <= MAX_BOOKING_MESSAGE_LENGTH,
      `Message must be ${MAX_BOOKING_MESSAGE_LENGTH} characters or fewer.`
    ),
})

const slotAvailabilityResponseSchema = z.object({
  serviceId: z.string(),
  date: z.string(),
  timezone: z.string(),
  slots: z.array(z.enum(TIME_SLOTS)),
  bookedSlots: z.array(z.enum(TIME_SLOTS)),
  pastSlots: z.array(z.enum(TIME_SLOTS)),
  availableSlots: z.array(z.enum(TIME_SLOTS)),
})

const createdAppointmentResponseSchema = z.object({
  id: z.string().min(1),
  serviceId: z.string(),
  serviceName: z.string(),
  serviceCategory: z.string(),
  serviceImage: z.string().nullable(),
  serviceDuration: z.number().nullable(),
  customerId: z.string(),
  appointmentDate: z.string(),
  appointmentDateLocal: z.string().nullable(),
  timeSlot: z.string(),
  message: z.string().nullable(),
  servicePrice: z.number(),
  status: z.enum(["pending", "confirmed", "cancelled"]),
  paymentStatus: z.enum(["unpaid", "paid"]),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
})

export {
  DATE_STRING_REGEX,
  MAX_BOOKING_ADVANCE_DAYS,
  MAX_BOOKING_MESSAGE_LENGTH,
  OBJECT_ID_REGEX,
  SALON_TIMEZONE,
  addDaysToDateString,
  bookingRequestSchema,
  calendarDateToDateString,
  createdAppointmentResponseSchema,
  dateStringToCalendarDate,
  formatDateStringReadable,
  getSalonTodayDateString,
  isValidDateString,
  slotAvailabilityResponseSchema,
}

export type { CreatedAppointment, SlotAvailability }
