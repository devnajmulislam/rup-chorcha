import { z } from "zod"

const MIN_PASSWORD_LENGTH = 6
const MAX_PASSWORD_LENGTH = 128
const MAX_NAME_LENGTH = 80
const MAX_EMAIL_LENGTH = 254
const MAX_URL_LENGTH = 2048
const PHONE_PATTERN = /^[+]?[0-9][0-9\s()-]{5,19}$/

function isSafeHttpUrl(value: string): boolean {
  if (!value || value.length > MAX_URL_LENGTH) {
    return false
  }

  try {
    const parsed = new URL(value)
    return parsed.protocol === "http:" || parsed.protocol === "https:"
  } catch {
    return false
  }
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

const passwordSchema = z
  .string({ error: "Create a password." })
  .min(
    MIN_PASSWORD_LENGTH,
    `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`
  )
  .max(
    MAX_PASSWORD_LENGTH,
    `Password must be at most ${MAX_PASSWORD_LENGTH} characters long.`
  )
  .regex(/[A-Z]/, "Password must include at least one uppercase letter.")
  .regex(/[a-z]/, "Password must include at least one lowercase letter.")

const emailSchema = z
  .string({ error: "Enter your email address." })
  .trim()
  .min(1, "Enter your email address.")
  .max(MAX_EMAIL_LENGTH, "Email address is too long.")
  .email("Enter a valid email address.")
  .transform((value) => value.toLowerCase())

const nameSchema = z
  .string({ error: "Enter your full name." })
  .trim()
  .min(1, "Enter your full name.")
  .max(MAX_NAME_LENGTH, `Keep your name under ${MAX_NAME_LENGTH} characters.`)

const optionalImageUrlSchema = z
  .union([z.string(), z.null()])
  .optional()
  .transform((value) => (typeof value === "string" ? value.trim() : ""))
  .refine(
    (value) => value === "" || isSafeHttpUrl(value),
    "Enter a full image URL that starts with http:// or https://."
  )
  .transform((value) => (value === "" ? undefined : value))

const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  image: optionalImageUrlSchema,
})

const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string({ error: "Enter your password." })
    .min(1, "Enter your password.")
    .max(MAX_PASSWORD_LENGTH, "Password is too long."),
  rememberMe: z.boolean().optional().default(true),
})

const googleAuthSchema = z.object({
  redirect: z.string().max(1024).optional(),
})

const profileUpdateSchema = z.object({
  name: nameSchema,
  phone: z
    .union([z.string(), z.null()])
    .optional()
    .transform((value) => (typeof value === "string" ? value.trim() : ""))
    .refine(
      (value) => value === "" || PHONE_PATTERN.test(value),
      "Enter a valid phone number with 6 to 20 digits."
    ),
  image: z
    .union([z.string(), z.null()])
    .optional()
    .transform((value) => (typeof value === "string" ? value.trim() : ""))
    .refine(
      (value) => value === "" || isSafeHttpUrl(value),
      "Enter a full image URL that starts with http:// or https://."
    )
    .transform((value) => (value === "" ? null : value)),
})

export {
  MAX_EMAIL_LENGTH,
  MAX_NAME_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  PHONE_PATTERN,
  emailSchema,
  googleAuthSchema,
  isSafeHttpUrl,
  loginSchema,
  nameSchema,
  passwordRules,
  passwordSchema,
  profileUpdateSchema,
  registerSchema,
}
