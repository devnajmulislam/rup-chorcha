"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CircleAlertIcon,
  Clock3,
  Loader2Icon,
  RotateCwIcon,
} from "lucide-react"

import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import { useAuthSession } from "@/lib/auth-client"
import {
  MAX_BOOKING_ADVANCE_DAYS,
  MAX_BOOKING_MESSAGE_LENGTH,
  SALON_TIMEZONE,
  addDaysToDateString,
  calendarDateToDateString,
  createdAppointmentResponseSchema,
  dateStringToCalendarDate,
  formatDateStringReadable,
  getSalonTodayDateString,
  slotAvailabilityResponseSchema,
  type CreatedAppointment,
  type SlotAvailability,
} from "@/lib/booking"
import { TIME_SLOTS, type TimeSlot } from "@/lib/constants"
import { formatCurrency, formatDuration, formatTimeSlot } from "@/lib/format"
import type { PublicService } from "@/lib/services-query"
import { cn } from "cn"

type AvailabilityFetchState = {
  date: string
  nonce: number
  data: SlotAvailability | null
  error: string | null
}

function AppointmentBookingForm({
  service,
  initialDate,
}: {
  service: PublicService
  initialDate: string
}) {
  const router = useRouter()
  const { setUser } = useAuthSession()
  const inFlightRef = React.useRef(false)

  const [selectedDate, setSelectedDate] = React.useState(initialDate)
  const [calendarOpen, setCalendarOpen] = React.useState(false)
  const [selectedSlot, setSelectedSlot] = React.useState<TimeSlot | "">("")
  const [message, setMessage] = React.useState("")
  const [reloadNonce, setReloadNonce] = React.useState(0)
  const [availabilityState, setAvailabilityState] =
    React.useState<AvailabilityFetchState | null>(null)
  const [submitting, setSubmitting] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)
  const [slotError, setSlotError] = React.useState<string | null>(null)
  const [dateError, setDateError] = React.useState<string | null>(null)
  const [messageError, setMessageError] = React.useState<string | null>(null)
  const [createdAppointment, setCreatedAppointment] =
    React.useState<CreatedAppointment | null>(null)

  const todayDateStr = getSalonTodayDateString()
  const maxDateStr = addDaysToDateString(
    todayDateStr,
    MAX_BOOKING_ADVANCE_DAYS
  )
  const minCalendarDate = dateStringToCalendarDate(todayDateStr)
  const maxCalendarDate = dateStringToCalendarDate(maxDateStr)
  const selectedCalendarDate = dateStringToCalendarDate(selectedDate)

  React.useEffect(() => {
    const controller = new AbortController()
    let active = true

    async function loadAvailability() {
      try {
        const response = await fetch(
          `/api/backend/services/${encodeURIComponent(service.id)}/availability?date=${encodeURIComponent(selectedDate)}`,
          {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
          }
        )

        const payload = (await response.json().catch(() => null)) as {
          success?: boolean
          data?: unknown
          message?: string
          code?: string
        } | null

        if (!active) {
          return
        }

        if (response.status === 401) {
          setUser(null)
          router.push(
            `/sign-in?redirect=${encodeURIComponent(`/services/${service.id}`)}`
          )
          return
        }

        if (payload?.code === "USER_BLOCKED") {
          setUser(null)
          router.push("/sign-in?blocked=1")
          return
        }

        const parsed =
          response.ok && payload?.success
            ? slotAvailabilityResponseSchema.safeParse(payload.data)
            : null

        if (!response.ok || !parsed || !parsed.success) {
          setAvailabilityState({
            date: selectedDate,
            nonce: reloadNonce,
            data: null,
            error:
              payload?.message?.trim() ||
              "Could not load time slot availability for this date.",
          })
          return
        }

        setAvailabilityState({
          date: selectedDate,
          nonce: reloadNonce,
          data: parsed.data,
          error: null,
        })
      } catch (error) {
        if (!active || (error instanceof Error && error.name === "AbortError")) {
          return
        }

        setAvailabilityState({
          date: selectedDate,
          nonce: reloadNonce,
          data: null,
          error: "Could not check slot availability. Please try again.",
        })
      }
    }

    void loadAvailability()
    return () => {
      active = false
      controller.abort()
    }
  }, [reloadNonce, router, selectedDate, service.id, setUser])

  const isLoadingSlots =
    availabilityState === null ||
    availabilityState.date !== selectedDate ||
    availabilityState.nonce !== reloadNonce

  const availabilityData = !isLoadingSlots ? availabilityState.data : null
  const availabilityError = !isLoadingSlots ? availabilityState.error : null

  const bookedSet = new Set<TimeSlot>(availabilityData?.bookedSlots ?? [])
  const pastSet = new Set<TimeSlot>(availabilityData?.pastSlots ?? [])
  const availableCount = availabilityData?.availableSlots.length ?? 0

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (inFlightRef.current || submitting) {
      return
    }

    setFormError(null)
    setDateError(null)
    setSlotError(null)
    setMessageError(null)

    if (!selectedDate) {
      setDateError("Choose an appointment date.")
      return
    }

    if (!selectedSlot) {
      setSlotError("Choose one of the available time slots.")
      return
    }

    if (bookedSet.has(selectedSlot) || pastSet.has(selectedSlot)) {
      setSlotError("That time slot is not available. Select another slot.")
      return
    }

    if (message.trim().length > MAX_BOOKING_MESSAGE_LENGTH) {
      setMessageError(
        `Notes must be ${MAX_BOOKING_MESSAGE_LENGTH} characters or fewer.`
      )
      return
    }

    inFlightRef.current = true
    setSubmitting(true)

    try {
      const response = await fetch("/api/backend/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceId: service.id,
          appointmentDate: selectedDate,
          timeSlot: selectedSlot,
          message: message.trim() || null,
        }),
      })

      const payload = (await response.json().catch(() => null)) as {
        success?: boolean
        data?: unknown
        message?: string
        code?: string
        fieldErrors?: Record<string, string>
      } | null

      if (response.status === 401) {
        toast.add({
          title: "Session expired",
          description: "Please sign in again to submit your booking.",
          type: "error",
        })
        setUser(null)
        router.push(
          `/sign-in?redirect=${encodeURIComponent(`/services/${service.id}`)}`
        )
        return
      }

      if (payload?.code === "USER_BLOCKED") {
        toast.add({
          title: "Account blocked",
          description:
            payload.message ||
            "This account is blocked. Contact RupChorcha to restore access.",
          type: "error",
        })
        setUser(null)
        router.push("/sign-in?blocked=1")
        return
      }

      const parsedCreated =
        response.ok && payload?.success
          ? createdAppointmentResponseSchema.safeParse(payload.data)
          : null

      if (!response.ok || !parsedCreated || !parsedCreated.success) {
        const errMessage =
          payload?.message?.trim() ||
          "We could not submit your appointment request. Please try again."

        if (payload?.fieldErrors?.appointmentDate) {
          setDateError(payload.fieldErrors.appointmentDate)
        }
        if (payload?.fieldErrors?.timeSlot) {
          setSlotError(payload.fieldErrors.timeSlot)
        }
        if (payload?.fieldErrors?.message) {
          setMessageError(payload.fieldErrors.message)
        }

        setFormError(errMessage)

        if (
          response.status === 409 ||
          payload?.code === "DUPLICATE_APPOINTMENT_SLOT"
        ) {
          setSelectedSlot("")
          setReloadNonce((current) => current + 1)
        }

        toast.add({
          title: "Booking could not be completed",
          description: errMessage,
          type: "error",
        })
        return
      }

      setCreatedAppointment(parsedCreated.data)
      setSelectedSlot("")
      setMessage("")
      setReloadNonce((current) => current + 1)

      toast.add({
        title: "Appointment request submitted",
        description: `${service.serviceName} requested for ${formatDateStringReadable(selectedDate)} at ${formatTimeSlot(parsedCreated.data.timeSlot)}.`,
        type: "success",
      })
    } catch {
      const errMessage =
        "Could not reach the RupChorcha booking server. Please check your connection and try again."
      setFormError(errMessage)
      toast.add({
        title: "Booking failed",
        description: errMessage,
        type: "error",
      })
    } finally {
      inFlightRef.current = false
      setSubmitting(false)
    }
  }

  if (createdAppointment) {
    const displayDate =
      createdAppointment.appointmentDateLocal || selectedDate

    return (
      <section
        aria-live="polite"
        className="flex flex-col gap-6 rounded-3xl border border-success/30 bg-card p-6 shadow-[0_18px_40px_-32px_rgba(58,24,48,0.4)] sm:p-8"
      >
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="size-5" aria-hidden="true" />
          </span>
          <div className="flex flex-col gap-1">
            <h2 className="font-heading text-3xl leading-tight font-medium text-plum">
              Appointment request received
            </h2>
            <p className="text-sm leading-6 text-muted-foreground">
              The salon will review and confirm your booking shortly. Payment
              opens once your request is confirmed.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={createdAppointment.status} />
          <StatusBadge status={createdAppointment.paymentStatus} />
        </div>

        <dl className="grid grid-cols-1 gap-4 rounded-2xl border border-border/70 bg-ivory p-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">
              Service
            </dt>
            <dd className="mt-1 text-sm font-medium text-plum">
              {createdAppointment.serviceName}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">
              Price
            </dt>
            <dd className="mt-1 font-heading text-lg font-semibold text-plum">
              {formatCurrency(createdAppointment.servicePrice)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">
              Date ({SALON_TIMEZONE})
            </dt>
            <dd className="mt-1 text-sm text-foreground">
              {formatDateStringReadable(displayDate)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">
              Time slot
            </dt>
            <dd className="mt-1 text-sm text-foreground">
              {formatTimeSlot(createdAppointment.timeSlot)}
            </dd>
          </div>
          {createdAppointment.message ? (
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">
                Your note
              </dt>
              <dd className="mt-1 text-sm text-foreground">
                {createdAppointment.message}
              </dd>
            </div>
          ) : null}
        </dl>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/customer/appointments"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-11 flex-1 gap-2 rounded-full px-5 text-sm"
            )}
          >
            View my appointments
            <ArrowRight aria-hidden="true" />
          </Link>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => {
              setCreatedAppointment(null)
              setFormError(null)
              setReloadNonce((current) => current + 1)
            }}
            className="h-11 rounded-full border-border bg-transparent px-5 text-sm hover:bg-blush hover:text-plum"
          >
            Book another slot
          </Button>
        </div>
      </section>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-6 rounded-3xl border border-border/70 bg-card p-6 shadow-[0_18px_40px_-32px_rgba(58,24,48,0.4)] sm:p-8"
    >
      <div className="flex flex-col gap-1.5 border-b border-border/60 pb-5">
        <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
          Request an appointment
        </p>
        <h2 className="font-heading text-3xl leading-tight font-medium text-plum">
          Reserve your visit
        </h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Choose a preferred day and time in{" "}
          <span className="font-medium text-plum">{SALON_TIMEZONE}</span>.
          Requests start as pending until confirmed by the salon.
        </p>
      </div>

      <FieldGroup className="gap-5">
        <Field data-invalid={Boolean(dateError)}>
          <FieldLabel htmlFor="appointment-date-trigger">
            Appointment date
          </FieldLabel>

          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger
              render={
                <Button
                  id="appointment-date-trigger"
                  type="button"
                  variant="outline"
                  aria-invalid={Boolean(dateError)}
                  className={cn(
                    "h-11 w-full justify-between rounded-xl border-input bg-card px-3.5 text-left font-normal text-foreground hover:bg-blush/50",
                    dateError && "border-destructive"
                  )}
                  disabled={submitting}
                />
              }
            >
              <span>{formatDateStringReadable(selectedDate)}</span>
              <CalendarDays
                className="size-4 text-primary"
                aria-hidden="true"
              />
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-2">
              <Calendar
                mode="single"
                selected={selectedCalendarDate}
                defaultMonth={selectedCalendarDate}
                onSelect={(date) => {
                  if (!date) {
                    return
                  }
                  const next = calendarDateToDateString(date)
                  setSelectedDate(next)
                  setSelectedSlot("")
                  setDateError(null)
                  setSlotError(null)
                  setFormError(null)
                  setCalendarOpen(false)
                }}
                disabled={[
                  ...(minCalendarDate ? [{ before: minCalendarDate }] : []),
                  ...(maxCalendarDate ? [{ after: maxCalendarDate }] : []),
                ]}
              />
            </PopoverContent>
          </Popover>

          <FieldDescription>
            Bookings are open up to {MAX_BOOKING_ADVANCE_DAYS} days ahead.
          </FieldDescription>
          <FieldError>{dateError}</FieldError>
        </Field>

        <Field data-invalid={Boolean(slotError)}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <FieldLabel>Available time slots</FieldLabel>
            {availabilityData ? (
              <span className="text-xs text-muted-foreground">
                {availableCount} of {TIME_SLOTS.length} available
              </span>
            ) : null}
          </div>

          {isLoadingSlots ? (
            <div
              aria-busy="true"
              aria-label="Checking available time slots"
              className="grid grid-cols-2 gap-2.5 sm:grid-cols-3"
            >
              {Array.from({ length: TIME_SLOTS.length }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-12 w-full rounded-xl bg-blush/70"
                />
              ))}
            </div>
          ) : availabilityError ? (
            <div
              role="alert"
              className="flex flex-col items-start gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4"
            >
              <p className="flex items-start gap-2 text-sm text-destructive">
                <CircleAlertIcon
                  className="mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />
                {availabilityError}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setReloadNonce((current) => current + 1)}
                className="h-9 rounded-full border-border bg-card px-4 text-xs text-plum hover:bg-blush"
              >
                <RotateCwIcon aria-hidden="true" />
                Retry availability check
              </Button>
            </div>
          ) : (
            <div
              role="group"
              aria-label="Appointment time slots"
              className="grid grid-cols-2 gap-2.5 sm:grid-cols-3"
            >
              {TIME_SLOTS.map((slot) => {
                const isBooked = bookedSet.has(slot)
                const isPast = pastSet.has(slot)
                const isUnavailable = isBooked || isPast
                const isSelected = selectedSlot === slot

                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={isUnavailable || submitting}
                    aria-pressed={isSelected}
                    onClick={() => {
                      setSelectedSlot(slot)
                      setSlotError(null)
                      setFormError(null)
                    }}
                    className={cn(
                      "flex min-h-12 flex-col items-start justify-center rounded-xl border px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                      isSelected
                        ? "border-primary bg-primary text-white shadow-sm"
                        : isUnavailable
                          ? "cursor-not-allowed border-border/50 bg-blush/35 text-muted-foreground opacity-65"
                          : "border-border bg-ivory/70 text-plum hover:border-rose hover:bg-blush/70"
                    )}
                  >
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                      <Clock3 className="size-3.5 shrink-0" aria-hidden="true" />
                      {formatTimeSlot(slot)}
                    </span>
                    {isBooked ? (
                      <span className="mt-0.5 text-[11px] font-medium text-muted-foreground">
                        Booked
                      </span>
                    ) : isPast ? (
                      <span className="mt-0.5 text-[11px] font-medium text-muted-foreground">
                        Passed
                      </span>
                    ) : null}
                  </button>
                )
              })}
            </div>
          )}

          <FieldDescription>
            Slots already in your schedule for this day are marked as booked.
          </FieldDescription>
          <FieldError>{slotError}</FieldError>
        </Field>

        <Field data-invalid={Boolean(messageError)}>
          <div className="flex items-center justify-between gap-2">
            <FieldLabel htmlFor="appointment-message">
              Additional notes (optional)
            </FieldLabel>
            <span className="text-xs text-muted-foreground">
              {message.length}/{MAX_BOOKING_MESSAGE_LENGTH}
            </span>
          </div>
          <Textarea
            id="appointment-message"
            name="message"
            rows={3}
            maxLength={MAX_BOOKING_MESSAGE_LENGTH}
            value={message}
            onChange={(event) => {
              setMessage(event.target.value)
              setMessageError(null)
              setFormError(null)
            }}
            placeholder="Share allergies, styling preferences, or notes for your stylist."
            aria-invalid={Boolean(messageError)}
            className="min-h-24 rounded-xl px-3.5 py-2.5"
            disabled={submitting}
          />
          <FieldError>{messageError}</FieldError>
        </Field>
      </FieldGroup>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-ivory px-4 py-3.5">
        <div className="flex flex-col">
          <span className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Service summary
          </span>
          <span className="text-sm font-medium text-plum">
            {service.serviceName} · {formatDuration(service.duration)}
          </span>
        </div>
        <div className="text-right">
          <span className="block font-heading text-2xl font-semibold text-plum">
            {formatCurrency(service.price)}
          </span>
          <span className="text-xs text-muted-foreground">
            Pending confirmation
          </span>
        </div>
      </div>

      {formError ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl bg-destructive/10 px-3.5 py-3 text-sm text-destructive"
        >
          <CircleAlertIcon
            className="mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />
          {formError}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={
          submitting ||
          isLoadingSlots ||
          Boolean(availabilityError) ||
          availableCount === 0
        }
        className="h-11 w-full rounded-full px-6 text-sm"
      >
        {submitting ? (
          <>
            <Loader2Icon className="animate-spin" aria-hidden="true" />
            Submitting request…
          </>
        ) : (
          "Request appointment"
        )}
      </Button>
    </form>
  )
}

export { AppointmentBookingForm }
