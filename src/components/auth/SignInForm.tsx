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
import {
  getAuthProviders,
  loginWithEmail,
  startGoogleAuth,
  useAuthSession,
} from "@/lib/auth-client"
import { resolvePostAuthDestination, roleOf } from "@/lib/roles"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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

function SignInForm({
  blocked = false,
  oauthError = null,
  redirectTo = "",
}: {
  blocked?: boolean
  oauthError?: string | null
  redirectTo?: string
}) {
  const router = useRouter()
  const { setUser } = useAuthSession()
  const [values, setValues] = React.useState<FormValues>(emptyValues)
  const [errors, setErrors] = React.useState<FormErrors>({})
  const [showPassword, setShowPassword] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [googleLoading, setGoogleLoading] = React.useState(false)
  const [googleAvailable, setGoogleAvailable] = React.useState(true)

  React.useEffect(() => {
    let active = true

    async function checkProviders() {
      const providers = await getAuthProviders()
      if (active && providers) {
        setGoogleAvailable(providers.google)
      }
    }

    void checkProviders()
    return () => {
      active = false
    }
  }, [])

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
      const result = await loginWithEmail({
        email: values.email.trim().toLowerCase(),
        password: values.password,
        rememberMe: true,
      })

      if (!result.ok) {
        setErrors({
          ...(result.fieldErrors ?? {}),
          form: result.message,
        })
        toast.add({
          title: "Sign in failed",
          description: result.message,
          type: "error",
        })
        return
      }

      setUser(result.user)
      const destination = resolvePostAuthDestination(
        redirectTo,
        roleOf(result.user)
      )

      toast.add({
        title: "You logged in successfully.",
        description: "Welcome back to RupChorcha.",
        type: "success",
      })

      router.refresh()
      router.push(destination)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true)
    setErrors((current) => ({ ...current, form: undefined }))

    try {
      const result = await startGoogleAuth(redirectTo || undefined)

      if (!result.ok) {
        setErrors({ form: result.message })
        toast.add({
          title: "Google sign-in failed",
          description: result.message,
          type: "error",
        })
        setGoogleLoading(false)
        return
      }

      window.location.assign(result.url)
    } catch {
      const message =
        "We could not reach Google sign-in. Check your connection and try again."
      setErrors({ form: message })
      toast.add({
        title: "Google sign-in failed",
        description: message,
        type: "error",
      })
      setGoogleLoading(false)
    }
  }

  const busy = submitting || googleLoading
  const bannerMessage =
    !errors.form && blocked
      ? "This account is blocked. Contact RupChorcha to restore access."
      : !errors.form && oauthError
        ? oauthError
        : null
  const signUpHref = redirectTo
    ? `/sign-up?redirect=${encodeURIComponent(redirectTo)}`
    : "/sign-up"

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

      {bannerMessage ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl bg-destructive/10 px-3.5 py-3 text-sm text-destructive"
        >
          <CircleAlertIcon
            className="mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />
          {bannerMessage}
        </p>
      ) : null}

      <Button
        type="button"
        variant="outline"
        className="h-11 w-full rounded-full border-border bg-transparent text-sm hover:bg-blush hover:text-plum"
        onClick={handleGoogleSignIn}
        disabled={busy || !googleAvailable}
      >
        {googleLoading ? (
          <Loader2Icon className="animate-spin" aria-hidden="true" />
        ) : (
          <GoogleIcon />
        )}
        {googleAvailable
          ? "Continue with Google"
          : "Google sign-in unavailable"}
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
          href={signUpHref}
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
