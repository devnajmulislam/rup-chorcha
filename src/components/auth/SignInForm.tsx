"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  CircleAlertIcon,
  EyeIcon,
  EyeOffIcon,
  Loader2Icon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { authClient } from "@/lib/auth-client"
import { dashboardPathForRole, roleOf } from "@/lib/roles"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const CONTINUE_PATH = "/auth/continue"

type FormValues = {
  email: string
  password: string
}

type FormErrors = Partial<Record<keyof FormValues | "form", string>>

const emptyValues: FormValues = {
  email: "",
  password: "",
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {}

  if (!values.email.trim()) {
    errors.email = "Enter your email address."
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = "Enter a valid email address."
  }

  if (!values.password) {
    errors.password = "Enter your password."
  }

  return errors
}

function authErrorMessage(error: {
  message?: string
  code?: string
  status?: number
}) {
  if (
    error.code === "INVALID_EMAIL_OR_PASSWORD" ||
    error.code === "INVALID_PASSWORD" ||
    error.status === 401
  ) {
    return "Email or password is incorrect. Please try again."
  }

  if (
    error.code === "BANNED_USER" ||
    error.code === "USER_BLOCKED" ||
    error.status === 403
  ) {
    return "This account is blocked. Contact RupChorcha to restore access."
  }

  if (error.code === "EMAIL_NOT_VERIFIED") {
    return "Verify your email address before signing in."
  }

  if (error.status === 429) {
    return "Too many attempts. Please wait a moment and try again."
  }

  if (error.status === 503 || error.status === 502) {
    return "Sign in is temporarily unavailable. Please try again shortly."
  }

  return error.message?.trim() || "We could not sign you in."
}

function SignInForm({ blocked = false }: { blocked?: boolean }) {
  const router = useRouter()
  const [values, setValues] = React.useState<FormValues>(emptyValues)
  const [errors, setErrors] = React.useState<FormErrors>({})
  const [showPassword, setShowPassword] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [googleLoading, setGoogleLoading] = React.useState(false)

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
      const { error } = await authClient.signIn.email({
        email: values.email.trim().toLowerCase(),
        password: values.password,
        rememberMe: true,
      })

      if (error) {
        const message = authErrorMessage(error)
        setErrors({ form: message })
        toast.add({
          title: "Sign in failed",
          description: message,
          type: "error",
        })
        return
      }

      const { data: session } = await authClient.getSession()
      const destination = dashboardPathForRole(roleOf(session?.user))

      toast.add({
        title: `You logged in successfully.`,
        description: "Welcome back to RupChorcha.",
        type: "success",
      })

      router.refresh()
      router.push(destination)
    } catch {
      const message =
        "We could not reach RupChorcha. Check your connection and try again."
      setErrors({ form: message })
      toast.add({
        title: "Sign in failed",
        description: message,
        type: "error",
      })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true)
    setErrors((current) => ({ ...current, form: undefined }))

    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}${CONTINUE_PATH}`,
      })

      if (error) {
        const message =
          error.message?.trim() ||
          "Google sign-in could not be started. Please try again."
        setErrors({ form: message })
        toast.add({
          title: "Google sign-in failed",
          description: message,
          type: "error",
        })
      }
    } catch {
      const message =
        "We could not reach Google sign-in. Check your connection and try again."
      setErrors({ form: message })
      toast.add({
        title: "Google sign-in failed",
        description: message,
        type: "error",
      })
    } finally {
      setGoogleLoading(false)
    }
  }

  const busy = submitting || googleLoading
  const showBlockedBanner = blocked && !errors.form

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-3xl leading-tight font-medium text-foreground">
          Sign in to your account
        </h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Follow your appointments, confirmations, and payments in one place.
        </p>
      </div>

      {showBlockedBanner ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl bg-destructive/10 px-3.5 py-3 text-sm text-destructive"
        >
          <CircleAlertIcon
            className="mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />
          This account is blocked. Contact RupChorcha to restore access.
        </p>
      ) : null}

      <Button
        type="button"
        variant="outline"
        className="h-11 w-full rounded-full border-border bg-transparent text-sm hover:bg-blush hover:text-plum"
        onClick={handleGoogleSignIn}
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
          <Field data-invalid={Boolean(errors.email)}>
            <FieldLabel htmlFor="sign-in-email">Email</FieldLabel>
            <Input
              id="sign-in-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={values.email}
              onChange={(event) => updateValue("email", event.target.value)}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "sign-in-email-error" : undefined}
              className="h-11 rounded-xl px-3.5"
              disabled={busy}
              required
            />
            <FieldError id="sign-in-email-error">{errors.email}</FieldError>
          </Field>

          <Field data-invalid={Boolean(errors.password)}>
            <FieldLabel htmlFor="sign-in-password">Password</FieldLabel>
            <div className="relative">
              <Input
                id="sign-in-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Your password"
                value={values.password}
                onChange={(event) =>
                  updateValue("password", event.target.value)
                }
                aria-invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password ? "sign-in-password-error" : undefined
                }
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
            <FieldError id="sign-in-password-error">
              {errors.password}
            </FieldError>
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
            disabled={busy}
          >
            {submitting ? (
              <>
                <Loader2Icon className="animate-spin" aria-hidden="true" />
                Signing in
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </FieldGroup>
      </form>

      <p className="text-sm leading-6 text-muted-foreground">
        New to RupChorcha?{" "}
        <Link
          href="/sign-up"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
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

export { SignInForm }
