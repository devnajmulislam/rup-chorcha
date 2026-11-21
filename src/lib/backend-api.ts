import { z } from "zod"

import type {
  AdminAppointment,
  AdminAppointmentCounts,
  AdminCustomer,
  AdminCustomerDetail,
  AdminDashboardData,
  AdminService,
  AdminUserCounts,
  AppointmentStatus,
  CustomerAppointment,
  CustomerDashboardData,
  PaginationMeta,
  ServiceInput,
  ServiceStatus,
  UserAccessStatus,
  UserProfile,
} from "@/lib/dashboard-types"
import type { ServiceSortOption } from "@/lib/services-query"

const REQUEST_TIMEOUT_MS = 10_000

const serviceSchema = z.object({
  id: z.string().min(1),
  serviceName: z.string(),
  category: z.string(),
  description: z.string(),
  price: z.number(),
  duration: z.number(),
  image: z.string(),
  status: z.enum(["active", "inactive"]),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
})

const userProfileSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  email: z.string(),
  image: z.string().nullable(),
  phone: z.string().nullable(),
  role: z.enum(["customer", "admin"]),
  isBlocked: z.boolean(),
  emailVerified: z.boolean(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
})

const customerAppointmentSchema = z.object({
  id: z.string().min(1),
  serviceId: z.string(),
  serviceName: z.string(),
  serviceCategory: z.string(),
  serviceImage: z.string().nullable(),
  serviceDuration: z.number().nullable(),
  customerId: z.string().optional(),
  appointmentDate: z.string().nullable(),
  appointmentDateLocal: z.string().nullable(),
  timeSlot: z.string(),
  message: z.string().nullable(),
  servicePrice: z.number(),
  status: z.enum(["pending", "confirmed", "cancelled"]),
  paymentStatus: z.enum(["unpaid", "paid"]),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
})

const adminAppointmentSchema = customerAppointmentSchema.extend({
  customerId: z.string(),
  customerName: z.string(),
  customerEmail: z.string(),
  customerPhone: z.string().nullable(),
  customerImage: z.string().nullable(),
  customerIsBlocked: z.boolean(),
  requestedAt: z.string().nullable(),
})

const paginationMetaSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
  hasNextPage: z.boolean(),
  hasPrevPage: z.boolean(),
})

const adminCustomerSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  image: z.string().nullable(),
  role: z.literal("customer"),
  isBlocked: z.boolean(),
  emailVerified: z.boolean(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
  appointmentCount: z.number().int().min(0),
})

const adminCustomerDetailSchema = adminCustomerSchema.extend({
  appointmentStats: z.object({
    total: z.number().int().min(0),
    pending: z.number().int().min(0),
    confirmed: z.number().int().min(0),
    cancelled: z.number().int().min(0),
  }),
  recentAppointments: z.array(customerAppointmentSchema),
})

const customerDashboardResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    profile: userProfileSchema,
    stats: z.object({
      totalAppointments: z.number().int().min(0),
      pendingAppointments: z.number().int().min(0),
      confirmedAppointments: z.number().int().min(0),
      cancelledAppointments: z.number().int().min(0),
      paidAppointments: z.number().int().min(0),
      unpaidAppointments: z.number().int().min(0),
      payableAppointments: z.number().int().min(0),
    }),
    upcomingAppointments: z.array(customerAppointmentSchema),
    recentAppointments: z.array(customerAppointmentSchema),
    timezone: z.string(),
  }),
})

const adminDashboardResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    overview: z.object({
      totalCustomers: z.number().int().min(0),
      activeCustomers: z.number().int().min(0),
      blockedCustomers: z.number().int().min(0),
      totalServices: z.number().int().min(0),
      activeServices: z.number().int().min(0),
      inactiveServices: z.number().int().min(0),
      totalAppointments: z.number().int().min(0),
      pendingAppointments: z.number().int().min(0),
      confirmedAppointments: z.number().int().min(0),
      cancelledAppointments: z.number().int().min(0),
      paidAppointments: z.number().int().min(0),
      unpaidAppointments: z.number().int().min(0),
      successfulPayments: z.number().int().min(0),
      failedPayments: z.number().int().min(0),
      totalTransactions: z.number().int().min(0),
      totalRevenueCents: z.number().int().min(0),
      currency: z.string(),
      hasRecordedTransactions: z.boolean(),
    }),
    recentAppointments: z.array(adminAppointmentSchema),
    timezone: z.string(),
  }),
})

const myAppointmentsListResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(customerAppointmentSchema),
  meta: paginationMetaSchema,
})

const adminServicesListResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(serviceSchema),
  meta: paginationMetaSchema,
})

const adminServiceDetailResponseSchema = z.object({
  success: z.literal(true),
  data: serviceSchema,
})

const adminServiceDeleteResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    action: z.enum(["deleted", "deactivated"]),
    id: z.string(),
  }),
})

const adminAppointmentsListResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(adminAppointmentSchema),
  meta: paginationMetaSchema.extend({
    counts: z.object({
      all: z.number().int().min(0),
      pending: z.number().int().min(0),
      confirmed: z.number().int().min(0),
      cancelled: z.number().int().min(0),
    }),
  }),
})

const adminAppointmentSingleResponseSchema = z.object({
  success: z.literal(true),
  data: adminAppointmentSchema,
})

const customerAppointmentSingleResponseSchema = z.object({
  success: z.literal(true),
  data: customerAppointmentSchema,
})

const adminUsersListResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(adminCustomerSchema),
  meta: paginationMetaSchema.extend({
    counts: z.object({
      all: z.number().int().min(0),
      active: z.number().int().min(0),
      blocked: z.number().int().min(0),
    }),
  }),
})

const adminUserSingleResponseSchema = z.object({
  success: z.literal(true),
  data: adminCustomerSchema,
})

const adminUserDetailResponseSchema = z.object({
  success: z.literal(true),
  data: adminCustomerDetailSchema,
})

const profileResponseSchema = z.object({
  success: z.literal(true),
  data: userProfileSchema,
})

type ExpressApiErrorKind =
  | "unauthorized"
  | "blocked"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "validation"
  | "unavailable"
  | "error"

type ExpressApiResult<T> =
  | { ok: true; data: T }
  | {
      ok: false
      kind: ExpressApiErrorKind
      status: number
      code: string
      message: string
      fieldErrors?: Record<string, string>
    }

function getApiBaseUrl(): string | null {
  const apiUrl = process.env.API_URL?.trim().replace(/\/+$/, "")
  return apiUrl || null
}

function getAppOriginHeader(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, "") ||
    "http://localhost:3000"
  )
}

function mapCustomerAppointment(
  item: z.infer<typeof customerAppointmentSchema>
): CustomerAppointment {
  const fallbackDate = item.appointmentDate || new Date().toISOString()
  return {
    id: item.id,
    serviceId: item.serviceId,
    serviceName: item.serviceName,
    serviceCategory: item.serviceCategory,
    serviceImage: item.serviceImage,
    serviceDuration: item.serviceDuration,
    appointmentDate: fallbackDate,
    appointmentDateLocal: item.appointmentDateLocal,
    timeSlot: item.timeSlot,
    servicePrice: item.servicePrice,
    status: item.status,
    paymentStatus: item.paymentStatus,
    message: item.message,
    requestedAt: item.createdAt || fallbackDate,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }
}

function mapAdminAppointment(
  item: z.infer<typeof adminAppointmentSchema>
): AdminAppointment {
  const fallbackDate = item.appointmentDate || new Date().toISOString()
  return {
    id: item.id,
    customerId: item.customerId,
    customerName: item.customerName,
    customerEmail: item.customerEmail,
    customerPhone: item.customerPhone,
    customerImage: item.customerImage,
    customerIsBlocked: item.customerIsBlocked,
    serviceId: item.serviceId,
    serviceName: item.serviceName,
    serviceCategory: item.serviceCategory,
    serviceImage: item.serviceImage,
    serviceDuration: item.serviceDuration,
    appointmentDate: fallbackDate,
    appointmentDateLocal: item.appointmentDateLocal,
    timeSlot: item.timeSlot,
    message: item.message,
    servicePrice: item.servicePrice,
    status: item.status,
    paymentStatus: item.paymentStatus,
    requestedAt: item.requestedAt || item.createdAt || fallbackDate,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }
}

function mapAdminCustomer(
  item: z.infer<typeof adminCustomerSchema>
): AdminCustomer {
  return {
    id: item.id,
    name: item.name,
    email: item.email,
    phone: item.phone,
    image: item.image,
    role: "customer",
    isBlocked: item.isBlocked,
    emailVerified: item.emailVerified,
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt,
    appointmentCount: item.appointmentCount,
  }
}

function mapErrorKind(status: number, code: string): ExpressApiErrorKind {
  if (status === 401) {
    return "unauthorized"
  }
  if (status === 403 && code === "USER_BLOCKED") {
    return "blocked"
  }
  if (status === 403) {
    return "forbidden"
  }
  if (status === 404) {
    return "not_found"
  }
  if (status === 409) {
    return "conflict"
  }
  if (status === 400 && code === "VALIDATION_ERROR") {
    return "validation"
  }
  if (status >= 500) {
    return "unavailable"
  }
  return "error"
}

async function requestExpressAuthenticated<TSchema extends z.ZodTypeAny>({
  path,
  accessToken,
  method = "GET",
  body,
  schema,
}: {
  path: string
  accessToken: string
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  body?: unknown
  schema: TSchema
}): Promise<ExpressApiResult<z.infer<TSchema>>> {
  const apiUrl = getApiBaseUrl()
  if (!apiUrl) {
    return {
      ok: false,
      kind: "unavailable",
      status: 503,
      code: "BACKEND_NOT_CONFIGURED",
      message: "The RupChorcha backend server URL is not configured.",
    }
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  let response: Response
  try {
    response = await fetch(`${apiUrl}${path}`, {
      method,
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
        Origin: getAppOriginHeader(),
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      signal: controller.signal,
    })
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return {
        ok: false,
        kind: "unavailable",
        status: 504,
        code: "BACKEND_TIMEOUT",
        message: "The RupChorcha server took too long to respond. Please try again.",
      }
    }

    return {
      ok: false,
      kind: "unavailable",
      status: 503,
      code: "BACKEND_UNAVAILABLE",
      message: "We could not reach the RupChorcha backend server right now.",
    }
  } finally {
    clearTimeout(timeout)
  }

  let rawJson: unknown = null
  try {
    rawJson = await response.json()
  } catch {
    rawJson = null
  }

  if (!response.ok) {
    const errObj =
      rawJson && typeof rawJson === "object"
        ? (rawJson as {
            message?: unknown
            code?: unknown
            errors?: unknown
          })
        : {}

    const code =
      typeof errObj.code === "string" && errObj.code.trim()
        ? errObj.code.trim()
        : "BACKEND_REQUEST_FAILED"

    const message =
      typeof errObj.message === "string" && errObj.message.trim()
        ? errObj.message.trim()
        : "Could not complete the request. Please try again."

    const fieldErrors: Record<string, string> = {}
    if (errObj.errors && typeof errObj.errors === "object") {
      for (const [key, val] of Object.entries(
        errObj.errors as Record<string, unknown>
      )) {
        if (typeof val === "string" && val.trim()) {
          fieldErrors[key] = val.trim()
        }
      }
    }

    return {
      ok: false,
      kind: mapErrorKind(response.status, code),
      status: response.status,
      code,
      message,
      ...(Object.keys(fieldErrors).length > 0 ? { fieldErrors } : {}),
    }
  }

  const parsed = schema.safeParse(rawJson)
  if (!parsed.success) {
    return {
      ok: false,
      kind: "error",
      status: 502,
      code: "INVALID_BACKEND_RESPONSE",
      message: "Received an unexpected response from the RupChorcha server.",
    }
  }

  return { ok: true, data: parsed.data }
}

async function fetchCustomerDashboard(
  accessToken: string
): Promise<ExpressApiResult<CustomerDashboardData>> {
  const res = await requestExpressAuthenticated({
    path: "/api/dashboard/customer",
    accessToken,
    schema: customerDashboardResponseSchema,
  })

  if (!res.ok) {
    return res
  }

  return {
    ok: true,
    data: {
      profile: res.data.data.profile,
      stats: res.data.data.stats,
      upcomingAppointments:
        res.data.data.upcomingAppointments.map(mapCustomerAppointment),
      recentAppointments:
        res.data.data.recentAppointments.map(mapCustomerAppointment),
      timezone: res.data.data.timezone,
    },
  }
}

async function fetchMyAppointments(
  accessToken: string,
  params: {
    status?: AppointmentStatus
    page?: number
    limit?: number
  } = {}
): Promise<
  ExpressApiResult<{
    items: CustomerAppointment[]
    meta: PaginationMeta
  }>
> {
  const query = new URLSearchParams()
  if (params.status) {
    query.set("status", params.status)
  }
  query.set("page", String(params.page && params.page > 0 ? Math.floor(params.page) : 1))
  query.set(
    "limit",
    String(params.limit && params.limit > 0 ? Math.floor(params.limit) : 10)
  )

  const res = await requestExpressAuthenticated({
    path: `/api/appointments/my?${query.toString()}`,
    accessToken,
    schema: myAppointmentsListResponseSchema,
  })

  if (!res.ok) {
    return res
  }

  return {
    ok: true,
    data: {
      items: res.data.data.map(mapCustomerAppointment),
      meta: res.data.meta,
    },
  }
}

async function cancelMyAppointment(
  accessToken: string,
  appointmentId: string
): Promise<ExpressApiResult<CustomerAppointment>> {
  const res = await requestExpressAuthenticated({
    path: `/api/appointments/my/${encodeURIComponent(appointmentId)}/cancel`,
    accessToken,
    method: "PATCH",
    schema: customerAppointmentSingleResponseSchema,
  })

  if (!res.ok) {
    return res
  }

  return { ok: true, data: mapCustomerAppointment(res.data.data) }
}

async function fetchAdminDashboard(
  accessToken: string
): Promise<ExpressApiResult<AdminDashboardData>> {
  const res = await requestExpressAuthenticated({
    path: "/api/dashboard/admin",
    accessToken,
    schema: adminDashboardResponseSchema,
  })

  if (!res.ok) {
    return res
  }

  return {
    ok: true,
    data: {
      overview: res.data.data.overview,
      recentAppointments:
        res.data.data.recentAppointments.map(mapAdminAppointment),
      timezone: res.data.data.timezone,
    },
  }
}

async function fetchAdminServices(
  accessToken: string,
  params: {
    search?: string
    category?: string
    status?: ServiceStatus | "all"
    sort?: ServiceSortOption
    page?: number
    limit?: number
  } = {}
): Promise<
  ExpressApiResult<{
    items: AdminService[]
    meta: PaginationMeta
  }>
> {
  const query = new URLSearchParams()
  if (params.search?.trim()) {
    query.set("search", params.search.trim())
  }
  if (params.category && params.category !== "all") {
    query.set("category", params.category)
  }
  if (params.status && params.status !== "all") {
    query.set("status", params.status)
  }
  if (params.sort) {
    query.set("sort", params.sort)
  }
  query.set("page", String(params.page && params.page > 0 ? Math.floor(params.page) : 1))
  query.set(
    "limit",
    String(params.limit && params.limit > 0 ? Math.floor(params.limit) : 10)
  )

  const res = await requestExpressAuthenticated({
    path: `/api/admin/services?${query.toString()}`,
    accessToken,
    schema: adminServicesListResponseSchema,
  })

  if (!res.ok) {
    return res
  }

  return {
    ok: true,
    data: {
      items: res.data.data,
      meta: res.data.meta,
    },
  }
}

async function fetchAdminServiceById(
  accessToken: string,
  serviceId: string
): Promise<ExpressApiResult<AdminService>> {
  const res = await requestExpressAuthenticated({
    path: `/api/admin/services/${encodeURIComponent(serviceId)}`,
    accessToken,
    schema: adminServiceDetailResponseSchema,
  })

  if (!res.ok) {
    return res
  }

  return { ok: true, data: res.data.data }
}

async function createAdminService(
  accessToken: string,
  input: ServiceInput
): Promise<ExpressApiResult<AdminService>> {
  const res = await requestExpressAuthenticated({
    path: "/api/admin/services",
    accessToken,
    method: "POST",
    body: {
      serviceName: input.serviceName,
      category: input.category,
      description: input.description,
      price: input.price,
      duration: input.duration,
      image: input.image,
      status: input.status ?? "active",
    },
    schema: adminServiceDetailResponseSchema,
  })

  if (!res.ok) {
    return res
  }

  return { ok: true, data: res.data.data }
}

async function updateAdminService(
  accessToken: string,
  serviceId: string,
  input: ServiceInput
): Promise<ExpressApiResult<AdminService>> {
  const res = await requestExpressAuthenticated({
    path: `/api/admin/services/${encodeURIComponent(serviceId)}`,
    accessToken,
    method: "PUT",
    body: {
      serviceName: input.serviceName,
      category: input.category,
      description: input.description,
      price: input.price,
      duration: input.duration,
      image: input.image,
      status: input.status ?? "active",
    },
    schema: adminServiceDetailResponseSchema,
  })

  if (!res.ok) {
    return res
  }

  return { ok: true, data: res.data.data }
}

async function updateAdminServiceStatus(
  accessToken: string,
  serviceId: string,
  status: ServiceStatus
): Promise<ExpressApiResult<AdminService>> {
  const res = await requestExpressAuthenticated({
    path: `/api/admin/services/${encodeURIComponent(serviceId)}/status`,
    accessToken,
    method: "PATCH",
    body: { status },
    schema: adminServiceDetailResponseSchema,
  })

  if (!res.ok) {
    return res
  }

  return { ok: true, data: res.data.data }
}

async function deleteAdminService(
  accessToken: string,
  serviceId: string
): Promise<ExpressApiResult<{ action: "deleted" | "deactivated"; id: string }>> {
  const res = await requestExpressAuthenticated({
    path: `/api/admin/services/${encodeURIComponent(serviceId)}`,
    accessToken,
    method: "DELETE",
    schema: adminServiceDeleteResponseSchema,
  })

  if (!res.ok) {
    return res
  }

  return { ok: true, data: res.data.data }
}

async function fetchAdminAppointments(
  accessToken: string,
  params: {
    status?: AppointmentStatus
    search?: string
    page?: number
    limit?: number
  } = {}
): Promise<
  ExpressApiResult<{
    items: AdminAppointment[]
    meta: PaginationMeta & { counts: AdminAppointmentCounts }
  }>
> {
  const query = new URLSearchParams()
  if (params.status) {
    query.set("status", params.status)
  }
  if (params.search?.trim()) {
    query.set("search", params.search.trim())
  }
  query.set("page", String(params.page && params.page > 0 ? Math.floor(params.page) : 1))
  query.set(
    "limit",
    String(params.limit && params.limit > 0 ? Math.floor(params.limit) : 10)
  )

  const res = await requestExpressAuthenticated({
    path: `/api/admin/appointments?${query.toString()}`,
    accessToken,
    schema: adminAppointmentsListResponseSchema,
  })

  if (!res.ok) {
    return res
  }

  return {
    ok: true,
    data: {
      items: res.data.data.map(mapAdminAppointment),
      meta: res.data.meta,
    },
  }
}

async function fetchAdminAppointmentById(
  accessToken: string,
  appointmentId: string
): Promise<ExpressApiResult<AdminAppointment>> {
  const res = await requestExpressAuthenticated({
    path: `/api/admin/appointments/${encodeURIComponent(appointmentId)}`,
    accessToken,
    schema: adminAppointmentSingleResponseSchema,
  })

  if (!res.ok) {
    return res
  }

  return { ok: true, data: mapAdminAppointment(res.data.data) }
}

async function confirmAdminAppointment(
  accessToken: string,
  appointmentId: string
): Promise<ExpressApiResult<AdminAppointment>> {
  const res = await requestExpressAuthenticated({
    path: `/api/admin/appointments/${encodeURIComponent(appointmentId)}/confirm`,
    accessToken,
    method: "PATCH",
    schema: adminAppointmentSingleResponseSchema,
  })

  if (!res.ok) {
    return res
  }

  return { ok: true, data: mapAdminAppointment(res.data.data) }
}

async function cancelAdminAppointment(
  accessToken: string,
  appointmentId: string
): Promise<ExpressApiResult<AdminAppointment>> {
  const res = await requestExpressAuthenticated({
    path: `/api/admin/appointments/${encodeURIComponent(appointmentId)}/cancel`,
    accessToken,
    method: "PATCH",
    schema: adminAppointmentSingleResponseSchema,
  })

  if (!res.ok) {
    return res
  }

  return { ok: true, data: mapAdminAppointment(res.data.data) }
}

async function fetchAdminUsers(
  accessToken: string,
  params: {
    status?: UserAccessStatus
    search?: string
    page?: number
    limit?: number
  } = {}
): Promise<
  ExpressApiResult<{
    items: AdminCustomer[]
    meta: PaginationMeta & { counts: AdminUserCounts }
  }>
> {
  const query = new URLSearchParams()
  if (params.status) {
    query.set("status", params.status)
  }
  if (params.search?.trim()) {
    query.set("search", params.search.trim())
  }
  query.set("page", String(params.page && params.page > 0 ? Math.floor(params.page) : 1))
  query.set(
    "limit",
    String(params.limit && params.limit > 0 ? Math.floor(params.limit) : 10)
  )

  const res = await requestExpressAuthenticated({
    path: `/api/admin/users?${query.toString()}`,
    accessToken,
    schema: adminUsersListResponseSchema,
  })

  if (!res.ok) {
    return res
  }

  return {
    ok: true,
    data: {
      items: res.data.data.map(mapAdminCustomer),
      meta: res.data.meta,
    },
  }
}

async function fetchAdminUserById(
  accessToken: string,
  userId: string
): Promise<ExpressApiResult<AdminCustomerDetail>> {
  const res = await requestExpressAuthenticated({
    path: `/api/admin/users/${encodeURIComponent(userId)}`,
    accessToken,
    schema: adminUserDetailResponseSchema,
  })

  if (!res.ok) {
    return res
  }

  return {
    ok: true,
    data: {
      ...mapAdminCustomer(res.data.data),
      appointmentStats: res.data.data.appointmentStats,
      recentAppointments:
        res.data.data.recentAppointments.map(mapCustomerAppointment),
    },
  }
}

async function setAdminUserBlocked(
  accessToken: string,
  userId: string,
  block: boolean
): Promise<ExpressApiResult<AdminCustomer>> {
  const action = block ? "block" : "unblock"
  const res = await requestExpressAuthenticated({
    path: `/api/admin/users/${encodeURIComponent(userId)}/${action}`,
    accessToken,
    method: "PATCH",
    schema: adminUserSingleResponseSchema,
  })

  if (!res.ok) {
    return res
  }

  return { ok: true, data: mapAdminCustomer(res.data.data) }
}

async function fetchMyProfile(
  accessToken: string
): Promise<ExpressApiResult<UserProfile>> {
  const res = await requestExpressAuthenticated({
    path: "/api/profile",
    accessToken,
    schema: profileResponseSchema,
  })

  if (!res.ok) {
    return res
  }

  return { ok: true, data: res.data.data }
}

async function updateMyProfileWithBackend(
  accessToken: string,
  payload: { name?: string; phone?: string | null; image?: string | null }
): Promise<ExpressApiResult<UserProfile>> {
  const res = await requestExpressAuthenticated({
    path: "/api/profile",
    accessToken,
    method: "PATCH",
    body: payload,
    schema: profileResponseSchema,
  })

  if (!res.ok) {
    return res
  }

  return { ok: true, data: res.data.data }
}

export {
  cancelAdminAppointment,
  cancelMyAppointment,
  confirmAdminAppointment,
  createAdminService,
  deleteAdminService,
  fetchAdminAppointmentById,
  fetchAdminAppointments,
  fetchAdminDashboard,
  fetchAdminServiceById,
  fetchAdminServices,
  fetchAdminUserById,
  fetchAdminUsers,
  fetchCustomerDashboard,
  fetchMyAppointments,
  fetchMyProfile,
  getApiBaseUrl,
  getAppOriginHeader,
  setAdminUserBlocked,
  updateAdminService,
  updateAdminServiceStatus,
  updateMyProfileWithBackend,
}
export type { ExpressApiErrorKind, ExpressApiResult }
