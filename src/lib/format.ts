const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
})

const salonDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Dhaka",
})

const salonDateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Asia/Dhaka",
})

export function formatCurrency(cents: number) {
  return currencyFormatter.format(cents / 100)
}

export function formatDuration(minutes: number) {
  return `${minutes} min`
}

export function formatSalonDate(value: Date | string) {
  return salonDateFormatter.format(new Date(value))
}

export function formatSalonDateTime(value: Date | string) {
  return salonDateTimeFormatter.format(new Date(value))
}

/** Turns a stored 24-hour slot such as "09:00" into "9:00 AM". */
export function formatTimeSlot(slot: string) {
  const [hoursPart, minutesPart] = slot.split(":")
  const hours = Number(hoursPart)
  const minutes = Number(minutesPart)

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return slot
  }

  const suffix = hours >= 12 ? "PM" : "AM"
  const displayHours = hours % 12 === 0 ? 12 : hours % 12

  return `${displayHours}:${String(minutes).padStart(2, "0")} ${suffix}`
}
