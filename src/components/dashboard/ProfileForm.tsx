"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { CircleAlertIcon, Loader2Icon, Upload } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import {
  updateMyProfile,
  uploadMyProfileImage,
  useAuthSession,
} from "@/lib/auth-client"

type ProfileFormProps = {
  name: string
  email: string
  phone: string
  image: string
  role: string
}

type FormValues = {
  name: string
  phone: string
  image: string
}

type FormErrors = Partial<Record<keyof FormValues | "form", string>>

const PHONE_PATTERN = /^[+]?[0-9][0-9\s()-]{5,19}$/
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
])
const MAX_IMAGE_BYTES = 5 * 1024 * 1024

function isHttpUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

function ProfileForm({ name, email, phone, image, role }: ProfileFormProps) {
  const router = useRouter()
  const { setUser } = useAuthSession()
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)
  const [values, setValues] = React.useState<FormValues>({
    name,
    phone,
    image,
  })
  const [errors, setErrors] = React.useState<FormErrors>({})
  const [uploadingImage, setUploadingImage] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

  const busy = uploadingImage || saving

  const previewImage = isHttpUrl(values.image.trim())
    ? values.image.trim()
    : undefined
  const initials =
    values.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "RC"

  function updateValue(field: keyof FormValues, value: string) {
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

  function validate(): FormErrors {
    const nextErrors: FormErrors = {}

    const trimmedName = values.name.trim()

    if (!trimmedName) {
      nextErrors.name = "Enter your full name."
    } else if (trimmedName.length > 80) {
      nextErrors.name = "Keep your name under 80 characters."
    }

    const trimmedPhone = values.phone.trim()

    if (trimmedPhone && !PHONE_PATTERN.test(trimmedPhone)) {
      nextErrors.phone = "Enter a valid phone number with 6 to 20 digits."
    }

    if (values.image.trim() && !isHttpUrl(values.image.trim())) {
      nextErrors.image =
        "Enter a full image URL that starts with http:// or https://."
    }

    return nextErrors
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    event.target.value = ""

    if (!file) {
      return
    }

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      const message = "Upload a JPEG, PNG, WebP, or GIF image."
      setErrors((current) => ({ ...current, image: message }))
      toast.add({
        title: "Invalid image file",
        description: message,
        type: "error",
      })
      return
    }

    if (file.size > MAX_IMAGE_BYTES) {
      const message = "Image size must be 5 MB or smaller."
      setErrors((current) => ({ ...current, image: message }))
      toast.add({
        title: "Image too large",
        description: message,
        type: "error",
      })
      return
    }

    setUploadingImage(true)
    setErrors((current) => {
      const next = { ...current }
      delete next.image
      delete next.form
      return next
    })

    try {
      const result = await uploadMyProfileImage(file)

      if (!result.ok) {
        if (result.code === "USER_BLOCKED") {
          setUser(null)
          router.replace("/sign-in?blocked=1")
          return
        }
        if (result.status === 401) {
          setUser(null)
          router.replace("/sign-in")
          return
        }

        setErrors((current) => ({
          ...current,
          image: result.message,
          form: result.message,
        }))
        toast.add({
          title: "Photo upload failed",
          description: result.message,
          type: "error",
        })
        return
      }

      setValues((current) => ({ ...current, image: result.url }))
      if (result.user) {
        setUser(result.user)
      }
      toast.add({
        title: "Profile photo updated",
        description: "Your new profile image is saved to your account.",
        type: "success",
      })
      router.refresh()
    } finally {
      setUploadingImage(false)
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors = validate()
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setSaving(true)

    try {
      const result = await updateMyProfile({
        name: values.name.trim(),
        phone: values.phone.trim(),
        image: values.image.trim() || null,
      })

      if (!result.ok) {
        if (result.code === "USER_BLOCKED") {
          setUser(null)
          router.replace("/sign-in?blocked=1")
          return
        }
        if (result.status === 401) {
          setUser(null)
          router.replace("/sign-in")
          return
        }

        setErrors({
          ...(result.fieldErrors ?? {}),
          form: result.message,
        })
        toast.add({
          title: "Profile not saved",
          description: result.message,
          type: "error",
        })
        return
      }

      setUser(result.user)
      toast.add({
        title: "Profile updated",
        description: "Your details have been saved.",
        type: "success",
      })
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <input
        ref={fileInputRef}
        id="profile-image-file"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileUpload}
        className="sr-only"
        disabled={busy}
      />

      <div className="flex flex-wrap items-center gap-4">
        <Avatar size="lg" className="size-16 shrink-0">
          {previewImage ? <AvatarImage src={previewImage} alt="" /> : null}
          <AvatarFallback className="bg-blush text-lg text-plum">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <p className="text-sm font-medium text-foreground">Profile picture</p>
          <p className="text-xs leading-5 text-muted-foreground">
            Upload a JPEG, PNG, WebP, or GIF image (up to 5 MB), or paste a
            photo URL below.
          </p>
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={busy}
              className="rounded-full border-border bg-card hover:bg-blush hover:text-plum"
            >
              {uploadingImage ? (
                <>
                  <Loader2Icon className="animate-spin" aria-hidden="true" />
                  Uploading photo…
                </>
              ) : (
                <>
                  <Upload aria-hidden="true" />
                  Upload photo
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <FieldGroup className="gap-5">
        <Field data-invalid={Boolean(errors.name)}>
          <FieldLabel htmlFor="profile-name">Full name</FieldLabel>
          <Input
            id="profile-name"
            name="name"
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={(event) => updateValue("name", event.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "profile-name-error" : undefined}
            className="h-11 rounded-xl px-3.5"
            disabled={busy}
            required
          />
          <FieldError id="profile-name-error">{errors.name}</FieldError>
        </Field>

        <Field data-invalid={Boolean(errors.phone)}>
          <FieldLabel htmlFor="profile-phone">Phone number</FieldLabel>
          <Input
            id="profile-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+880 1700 000000"
            value={values.phone}
            onChange={(event) => updateValue("phone", event.target.value)}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={
              errors.phone ? "profile-phone-error" : "profile-phone-description"
            }
            className="h-11 rounded-xl px-3.5"
            disabled={busy}
          />
          <FieldDescription id="profile-phone-description">
            Optional. Used only so the salon can reach you about a booking.
          </FieldDescription>
          <FieldError id="profile-phone-error">{errors.phone}</FieldError>
        </Field>

        <Field data-invalid={Boolean(errors.image)}>
          <FieldLabel htmlFor="profile-image">Profile image URL</FieldLabel>
          <Input
            id="profile-image"
            name="image"
            type="url"
            inputMode="url"
            autoComplete="url"
            placeholder="https://example.com/photo.jpg"
            value={values.image}
            onChange={(event) => updateValue("image", event.target.value)}
            aria-invalid={Boolean(errors.image)}
            aria-describedby="profile-image-description"
            className="h-11 rounded-xl px-3.5"
            disabled={busy}
          />
          <FieldDescription id="profile-image-description">
            Filled automatically after upload, or leave empty to clear your
            photo and show your initials.
          </FieldDescription>
          <FieldError id="profile-image-error">{errors.image}</FieldError>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="profile-email">Email</FieldLabel>
            <Input
              id="profile-email"
              name="email"
              type="email"
              value={email}
              readOnly
              disabled
              className="h-11 rounded-xl px-3.5"
            />
            <FieldDescription>Email cannot be changed here.</FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="profile-role">Account type</FieldLabel>
            <Input
              id="profile-role"
              name="role"
              type="text"
              value={role}
              readOnly
              disabled
              className="h-11 rounded-xl px-3.5 capitalize"
            />
            <FieldDescription>
              Assigned by RupChorcha and cannot be changed.
            </FieldDescription>
          </Field>
        </div>

        {errors.form ? (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-xl bg-destructive/10 px-3.5 py-3 text-sm text-destructive"
          >
            <CircleAlertIcon
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            {errors.form}
          </p>
        ) : null}

        <Button
          type="submit"
          className="h-11 w-full rounded-full text-sm sm:w-auto sm:px-6"
          disabled={busy}
        >
          {saving ? (
            <>
              <Loader2Icon className="animate-spin" aria-hidden="true" />
              Saving
            </>
          ) : (
            "Save changes"
          )}
        </Button>
      </FieldGroup>
    </form>
  )
}

export { ProfileForm }
export type { ProfileFormProps }
