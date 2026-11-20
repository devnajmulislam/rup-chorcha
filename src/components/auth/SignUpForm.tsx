"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  CheckIcon,
  CircleAlertIcon,
  EyeIcon,
  EyeOffIcon,
  Loader2Icon,
} from "lucide-react"

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
import { authClient } from "@/lib/auth-client"
import { dashboardPathForRole } from "@/lib/roles"
import { cn } from "cn"

const MIN_PASSWORD_LENGTH = 6
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const POST_SIGN_UP_REDIRECT = dashboardPathForRole("customer")

type FormValues = {
  name: string
  email: string
  password: string
  imageUrl: string
}

type FormErrors = Partial<Record<keyof FormValues | "form", string>>

const emptyValues: FormValues = {
  name: "",
  email: "",
  password: "",
  imageUrl: "",
}

function passwordRules(password: string) {
  return [
    {
      label: `At least ${MIN_PASSWORD_LENGTH} characters`,
      met: password.length >= MIN_PASSWORD_LENGTH,
    },
    {
      label: "One uppercase letter",
      met: /[A-Z]/.test(password),
    },
    {
      label: "One lowercase letter",
      met: /[a-z]/.test(password),
    },
  ]
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {}

  if (!values.name.trim()) {
    errors.name = "Enter your full name."
  }

  if (!values.email.trim()) {
    errors.email = "Enter your email address."
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = "Enter a valid email address."
  }

  if (!values.password) {
    errors.password = "Create a password."
  } else if (!passwordRules(values.password).every((rule) => rule.met)) {
    errors.password = "Your password does not meet all the rules below."
  }

  if (values.imageUrl.trim() && !isHttpUrl(values.imageUrl.trim())) {
    errors.imageUrl =
      "Enter a full image URL that starts with http:// or https://."
  }

  return errors
}

function authErrorMessage(error: {
  message?: string
  code?: string
  status?: number
}) {
  if (error.code === "USER_ALREADY_EXISTS") {
    return "An account with this email already exists. Try signing in instead."
  }

  if (error.status === 429) {
    return "Too many attempts. Please wait a moment and try again."
  }

  if (error.status === 503 || error.status === 502) {
    return "Registration is temporarily unavailable. Please try again shortly."
  }

  return error.message?.trim() || "We could not create your account."
}

function SignUpForm() {
  const router = useRouter()
  const [values, setValues] = React.useState<FormValues>(emptyValues)
  const [errors, setErrors] = React.useState<FormErrors>({})
  const [showPassword, setShowPassword] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [googleLoading, setGoogleLoading] = React.useState(false)

  const rules = passwordRules(values.password)
  const rulesSatisfied = rules.every((rule) => rule.met)
  const imagePreview = isHttpUrl(values.imageUrl.trim())
    ? values.imageUrl.trim()
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors = validate(values)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setSubmitting(true)

    try {
      const { error } = await authClient.signUp.email({
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
        image: values.imageUrl.trim() || undefined,
        callbackURL: POST_SIGN_UP_REDIRECT,
      })

      if (error) {
        const message = authErrorMessage(error)
        setErrors({ form: message })
        toast.add({
          title: "Registration failed",
          description: message,
          type: "error",
        })
        return
      }

      toast.add({
        title: `Hello, ${values.name}, Welcome to RupChorcha.`,
        description:"Account created successfully",
        type: "success",
      })

      router.refresh()
      router.push(POST_SIGN_UP_REDIRECT)
    } catch {
      const message =
        "We could not reach RupChorcha. Check your connection and try again."
      setErrors({ form: message })
      toast.add({
        title: "Registration failed",
        description: message,
        type: "error",
      })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleGoogleSignUp() {
    setGoogleLoading(true)
    setErrors((current) => ({ ...current, form: undefined }))

    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: POST_SIGN_UP_REDIRECT,
      })

      if (error) {
        const message =
          error.message?.trim() ||
          "Google sign-up could not be started. Please try again."
        setErrors({ form: message })
        toast.add({
          title: "Google sign-up failed",
          description: message,
          type: "error",
        })
      }
    } catch {
      const message =
        "We could not reach Google sign-up. Check your connection and try again."
      setErrors({ form: message })
      toast.add({
        title: "Google sign-up failed",
        description: message,
        type: "error",
      })
    } finally {
      setGoogleLoading(false)
    }
  }

  const busy = submitting || googleLoading

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-3xl leading-tight font-medium text-foreground">
          Create your account
        </h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Book appointments, follow their status, and keep your payment history
          in one place.
        </p>
      </div>

      <Button
        type="button"
        variant="outline"
        className="h-11 w-full rounded-full border-border bg-transparent text-sm hover:bg-blush hover:text-plum"
        onClick={handleGoogleSignUp}
        disabled={busy}
      >
        {googleLoading ? (
          <Loader2Icon className="animate-spin" aria-hidden="true" />
        ) : (
          <GoogleIcon />
        )}
        Continue with Google
      </Button>

      <div className="flex items-center gap-3 text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
        or
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <FieldGroup className="gap-5">
          <Field data-invalid={Boolean(errors.name)}>
            <FieldLabel htmlFor="sign-up-name">Full name</FieldLabel>
            <Input
              id="sign-up-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Ayesha Rahman"
              value={values.name}
              onChange={(event) => updateValue("name", event.target.value)}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "sign-up-name-error" : undefined}
              className="h-11 rounded-xl px-3.5"
              disabled={busy}
              required
            />
            <FieldError id="sign-up-name-error">{errors.name}</FieldError>
          </Field>

          <Field data-invalid={Boolean(errors.email)}>
            <FieldLabel htmlFor="sign-up-email">Email</FieldLabel>
            <Input
              id="sign-up-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={values.email}
              onChange={(event) => updateValue("email", event.target.value)}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={
                errors.email ? "sign-up-email-error" : undefined
              }
              className="h-11 rounded-xl px-3.5"
              disabled={busy}
              required
            />
            <FieldError id="sign-up-email-error">{errors.email}</FieldError>
          </Field>

          <Field data-invalid={Boolean(errors.password)}>
            <FieldLabel htmlFor="sign-up-password">Password</FieldLabel>
            <div className="relative">
              <Input
                id="sign-up-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Create a password"
                value={values.password}
                onChange={(event) =>
                  updateValue("password", event.target.value)
                }
                aria-invalid={Boolean(errors.password)}
                aria-describedby="sign-up-password-rules"
                className="h-11 rounded-xl pr-12 pl-3.5"
                disabled={busy}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-plum"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                disabled={busy}
              >
                {showPassword ? (
                  <EyeOffIcon aria-hidden="true" />
                ) : (
                  <EyeIcon aria-hidden="true" />
                )}
              </Button>
            </div>

            <ul
              id="sign-up-password-rules"
              className="flex flex-col gap-1.5 pt-1"
            >
              {rules.map((rule) => (
                <li
                  key={rule.label}
                  className={cn(
                    "flex items-center gap-2 text-xs",
                    rule.met ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {rule.met ? (
                    <CheckIcon
                      className="size-3.5 text-primary"
                      aria-hidden="true"
                    />
                  ) : (
                    <span
                      className="size-3.5 rounded-full border border-border"
                      aria-hidden="true"
                    />
                  )}
                  {rule.label}
                  <span className="sr-only">
                    {rule.met ? "— met" : "— not met yet"}
                  </span>
                </li>
              ))}
            </ul>

            <FieldError id="sign-up-password-error">
              {errors.password}
            </FieldError>
          </Field>

          <Field data-invalid={Boolean(errors.imageUrl)}>
            <FieldLabel htmlFor="sign-up-image">Profile image URL</FieldLabel>
            <div className="flex items-center gap-3">
              <Avatar size="lg" className="size-12">
                {imagePreview ? (
                  <AvatarImage src={imagePreview} alt="" />
                ) : null}
                <AvatarFallback className="bg-blush text-plum">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <Input
                id="sign-up-image"
                name="image"
                type="url"
                inputMode="url"
                autoComplete="url"
                placeholder="https://example.com/photo.jpg"
                value={values.imageUrl}
                onChange={(event) =>
                  updateValue("imageUrl", event.target.value)
                }
                aria-invalid={Boolean(errors.imageUrl)}
                aria-describedby="sign-up-image-description"
                className="h-11 rounded-xl px-3.5"
                disabled={busy}
              />
            </div>
            <FieldDescription id="sign-up-image-description">
              Optional. Paste a link to a photo, or upload one later from your
              profile after signing in.
            </FieldDescription>
            <FieldError id="sign-up-image-error">{errors.imageUrl}</FieldError>
          </Field>

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
            className="h-11 w-full rounded-full text-sm"
            disabled={busy || !rulesSatisfied}
          >
            {submitting ? (
              <>
                <Loader2Icon className="animate-spin" aria-hidden="true" />
                Creating account
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </FieldGroup>
      </form>

      <p className="text-sm leading-6 text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>

      <p className="text-xs leading-5 text-muted-foreground">
        Accounts created here are customer accounts. RupChorcha staff access is
        assigned separately and is never granted through public registration.
      </p>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-4"
      focusable="false"
    >
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3.01h3.87c2.26-2.09 3.56-5.17 3.56-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.94-2.91l-3.87-3.01c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.29v3.11A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54V6.62H1.29a12 12 0 0 0 0 10.76l3.98-3.11Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.35.61 4.59 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.29 6.62l3.98 3.11C6.22 6.88 8.87 4.77 12 4.77Z"
      />
    </svg>
  )
}

export { SignUpForm }
