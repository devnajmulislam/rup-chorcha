"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  CircleAlertIcon,
  ImagePlus,
  Loader2Icon,
  Upload,
} from "lucide-react"

import {
  createServiceAction,
  updateServiceAction,
  type ServiceField,
} from "@/app/(dashboard)/admin/services/actions"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import { useAuthSession } from "@/lib/auth-client"
import { SALON_CATEGORIES } from "@/lib/constants"
import type { AdminService, ServiceStatus } from "@/lib/dashboard-types"
import { cn } from "cn"

type ServiceFormProps = {
  /** Omit to add a new service; pass a service to update it. */
  service?: AdminService | null
}

type FormErrors = Partial<Record<ServiceField | "form", string>>

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
])
const MAX_IMAGE_BYTES = 5 * 1024 * 1024

function initialCategory(service?: AdminService | null) {
  const categories: readonly string[] = SALON_CATEGORIES

  return service && categories.includes(service.category)
    ? service.category
    : SALON_CATEGORIES[0]
}

function ServiceForm({ service }: ServiceFormProps) {
  const router = useRouter()
  const { setUser } = useAuthSession()
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)
  const [values, setValues] = React.useState<{
    serviceName: string
    category: string
    description: string
    price: string
    duration: string
    status: ServiceStatus
  }>(() => ({
    serviceName: service?.serviceName ?? "",
    category: initialCategory(service),
    description: service?.description ?? "",
    price: service ? (service.price / 100).toFixed(2) : "",
    duration: service ? String(service.duration) : "",
    // New services default to Active.
    status: service?.status ?? "active",
  }))
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [errors, setErrors] = React.useState<FormErrors>({})
  const [uploading, setUploading] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

  const isEditing = Boolean(service)
  const existingImage = service?.image?.trim() || ""
  const backHref = isEditing ? "/admin/services/update" : "/admin/services"
  const busy = uploading || saving

  // Derived from the chosen file; the effect only revokes the old object URL.
  const previewUrl = React.useMemo(
    () => (selectedFile ? URL.createObjectURL(selectedFile) : null),
    [selectedFile]
  )

  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const activePreview = previewUrl || existingImage

  function updateValue(field: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => {
      if (!current[field] && !current.form) {
        return current
      }

      const next = { ...current }
      delete next[field]
      delete next.form
      return next
    })
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null

    if (!file) {
      return
    }

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      event.target.value = ""
      setSelectedFile(null)
      setErrors((current) => ({
        ...current,
        image: "Upload a JPEG, PNG, WebP, or GIF image.",
      }))
      return
    }

    if (file.size > MAX_IMAGE_BYTES) {
      event.target.value = ""
      setSelectedFile(null)
      setErrors((current) => ({
        ...current,
        image: "Image size must be 5 MB or smaller.",
      }))
      return
    }

    setSelectedFile(file)
    setErrors((current) => {
      const next = { ...current }
      delete next.image
      delete next.form
      return next
    })
  }

  function clearSelectedFile() {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  async function uploadServiceImage(file: File): Promise<string | null> {
    setUploading(true)

    try {
      const body = new FormData()
      body.append("image", file)

      const response = await fetch("/api/admin/uploads/service-image", {
        method: "POST",
        body,
      })

      const payload = (await response.json().catch(() => null)) as {
        success?: boolean
        message?: string
        data?: { url?: string }
      } | null

      if (!response.ok || !payload?.success || !payload.data?.url) {
        const message =
          payload?.message?.trim() ||
          "Image upload failed. Please try another file."
        setErrors((current) => ({
          ...current,
          image: message,
          form: message,
        }))
        toast.add({
          title: "Image upload failed",
          description: message,
          type: "error",
        })
        return null
      }

      return payload.data.url
    } catch {
      const message =
        "We could not upload the image right now. Check your connection and try again."
      setErrors((current) => ({
        ...current,
        image: message,
        form: message,
      }))
      toast.add({
        title: "Image upload failed",
        description: message,
        type: "error",
      })
      return null
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrors({})

    let imageUrl = existingImage

    if (selectedFile) {
      const uploaded = await uploadServiceImage(selectedFile)
      if (!uploaded) {
        return
      }
      imageUrl = uploaded
    } else if (!imageUrl) {
      setErrors({
        image: "Upload a service image.",
        form: "Check the highlighted fields and try again.",
      })
      return
    }

    setSaving(true)

    try {
      const payload = { ...values, image: imageUrl }
      const result = service
        ? await updateServiceAction(service.id, payload)
        : await createServiceAction(payload)

      if (!result.success) {
        if (result.blocked) {
          setUser(null)
          router.replace("/sign-in?blocked=1")
          return
        }
        setErrors({ ...result.fieldErrors, form: result.message })
        toast.add({
          title: isEditing ? "Service not updated" : "Service not added",
          description: result.message,
          type: "error",
        })
        return
      }

      toast.add({
        title: isEditing ? "Service updated" : "Service added",
        description: result.message,
        type: "success",
      })
      router.push("/admin/services")
      router.refresh()
    } catch {
      const message =
        "We could not reach RupChorcha. Check your connection and try again."
      setErrors({ form: message })
      toast.add({
        title: isEditing ? "Service not updated" : "Service not added",
        description: message,
        type: "error",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex max-w-3xl flex-col gap-6 rounded-2xl border border-border/70 bg-card p-5 shadow-[0_18px_40px_-34px_rgba(58,24,48,0.4)] sm:p-7"
    >
      <FieldGroup className="gap-5">
        <Field data-invalid={Boolean(errors.serviceName)}>
          <FieldLabel htmlFor="service-name">Service name</FieldLabel>
          <Input
            id="service-name"
            name="serviceName"
            type="text"
            placeholder="Signature Cut & Finish"
            value={values.serviceName}
            onChange={(event) => updateValue("serviceName", event.target.value)}
            aria-invalid={Boolean(errors.serviceName)}
            className="h-11 rounded-xl px-3.5"
            disabled={busy}
            required
          />
          <FieldError>{errors.serviceName}</FieldError>
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field data-invalid={Boolean(errors.category)}>
            <FieldLabel htmlFor="service-category">Service category</FieldLabel>
            <NativeSelect
              id="service-category"
              name="category"
              value={values.category}
              onChange={(event) => updateValue("category", event.target.value)}
              aria-invalid={Boolean(errors.category)}
              className="w-full"
              disabled={busy}
            >
              {SALON_CATEGORIES.map((category) => (
                <NativeSelectOption key={category} value={category}>
                  {category}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <FieldError>{errors.category}</FieldError>
          </Field>

          <Field data-invalid={Boolean(errors.status)}>
            <FieldLabel htmlFor="service-status">Service status</FieldLabel>
            <NativeSelect
              id="service-status"
              name="status"
              value={values.status}
              onChange={(event) => updateValue("status", event.target.value)}
              aria-invalid={Boolean(errors.status)}
              aria-describedby="service-status-description"
              className="w-full"
              disabled={busy}
            >
              <NativeSelectOption value="active">Active</NativeSelectOption>
              <NativeSelectOption value="inactive">Inactive</NativeSelectOption>
            </NativeSelect>
            <FieldDescription id="service-status-description">
              Only active services are shown publicly and can be booked.
            </FieldDescription>
            <FieldError>{errors.status}</FieldError>
          </Field>
        </div>

        <Field data-invalid={Boolean(errors.description)}>
          <FieldLabel htmlFor="service-description">Description</FieldLabel>
          <Textarea
            id="service-description"
            name="description"
            rows={4}
            placeholder="Describe what is included in this appointment."
            value={values.description}
            onChange={(event) => updateValue("description", event.target.value)}
            aria-invalid={Boolean(errors.description)}
            className="min-h-28 rounded-xl px-3.5 py-2.5"
            disabled={busy}
            required
          />
          <FieldError>{errors.description}</FieldError>
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field data-invalid={Boolean(errors.price)}>
            <FieldLabel htmlFor="service-price">Price (USD)</FieldLabel>
            <Input
              id="service-price"
              name="price"
              type="number"
              inputMode="decimal"
              min={0.01}
              step={0.01}
              placeholder="45.00"
              value={values.price}
              onChange={(event) => updateValue("price", event.target.value)}
              aria-invalid={Boolean(errors.price)}
              aria-describedby="service-price-description"
              className="h-11 rounded-xl px-3.5"
              disabled={busy}
              required
            />
            <FieldDescription id="service-price-description">
              Must be a positive amount.
            </FieldDescription>
            <FieldError>{errors.price}</FieldError>
          </Field>

          <Field data-invalid={Boolean(errors.duration)}>
            <FieldLabel htmlFor="service-duration">
              Estimated duration (minutes)
            </FieldLabel>
            <Input
              id="service-duration"
              name="duration"
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              placeholder="60"
              value={values.duration}
              onChange={(event) => updateValue("duration", event.target.value)}
              aria-invalid={Boolean(errors.duration)}
              aria-describedby="service-duration-description"
              className="h-11 rounded-xl px-3.5"
              disabled={busy}
              required
            />
            <FieldDescription id="service-duration-description">
              Must be a positive whole number.
            </FieldDescription>
            <FieldError>{errors.duration}</FieldError>
          </Field>
        </div>

        <Field data-invalid={Boolean(errors.image)}>
          <FieldLabel htmlFor="service-image-upload">
            Service image {isEditing ? "(optional to replace)" : "(required)"}
          </FieldLabel>

          <input
            ref={fileInputRef}
            id="service-image-upload"
            name="imageFile"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            aria-invalid={Boolean(errors.image)}
            aria-describedby="service-image-description"
            className="sr-only"
            disabled={busy}
          />

          <div
            className={cn(
              "flex flex-col gap-4 rounded-xl border border-dashed p-4 transition-colors sm:flex-row sm:items-center",
              errors.image
                ? "border-destructive bg-destructive/5"
                : "border-border bg-ivory/60"
            )}
          >
            <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-lg bg-blush sm:w-48">
              {activePreview ? (
                <Image
                  src={activePreview}
                  alt={values.serviceName || "Service image preview"}
                  fill
                  sizes="(min-width: 640px) 12rem, 100vw"
                  unoptimized={activePreview.startsWith("blob:")}
                  className="object-cover"
                />
              ) : (
                <span className="flex size-full items-center justify-center text-plum/50">
                  <ImagePlus className="size-7" aria-hidden="true" />
                </span>
              )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <p className="truncate text-sm font-medium text-foreground">
                {selectedFile
                  ? `${selectedFile.name} (${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)`
                  : existingImage
                    ? "Current service photo is kept unless replaced"
                    : "No image file chosen yet"}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={busy}
                  className="rounded-full border-border bg-card hover:bg-blush hover:text-plum"
                >
                  <Upload aria-hidden="true" />
                  {selectedFile || existingImage
                    ? "Choose new image"
                    : "Upload image"}
                </Button>
                {selectedFile ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearSelectedFile}
                    disabled={busy}
                    className="rounded-full text-muted-foreground hover:text-plum"
                  >
                    Reset file
                  </Button>
                ) : null}
              </div>
            </div>
          </div>

          <FieldDescription id="service-image-description">
            Upload a JPEG, PNG, WebP, or GIF file up to 5 MB. Image URLs are not
            accepted.
          </FieldDescription>
          <FieldError>{errors.image}</FieldError>
        </Field>
      </FieldGroup>

      {errors.form ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl bg-destructive/10 px-3.5 py-3 text-sm text-destructive"
        >
          <CircleAlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {errors.form}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-2 border-t border-border/70 pt-5 sm:flex-row sm:justify-end">
        <Link
          href={backHref}
          aria-disabled={busy}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-10 rounded-full border-border bg-transparent px-5 text-sm hover:bg-blush hover:text-plum",
            busy && "pointer-events-none opacity-50"
          )}
        >
          Cancel
        </Link>
        <Button type="submit" disabled={busy} className="h-10 rounded-full px-5 text-sm">
          {uploading ? (
            <>
              <Loader2Icon className="animate-spin" aria-hidden="true" />
              Uploading image…
            </>
          ) : saving ? (
            <>
              <Loader2Icon className="animate-spin" aria-hidden="true" />
              Saving…
            </>
          ) : isEditing ? (
            "Save changes"
          ) : (
            "Add service"
          )}
        </Button>
      </div>
    </form>
  )
}

export { ServiceForm }
export type { ServiceFormProps }
