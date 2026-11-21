type AppointmentStatus = "pending" | "confirmed" | "cancelled"
type PaymentStatus = "unpaid" | "paid"
type TransactionStatus = "paid" | "failed"
type ServiceStatus = "active" | "inactive"
type UserAccessStatus = "active" | "blocked"

type AdminService = {
  id: string
  serviceName: string
  category: string
  description: string
  price: number
  duration: number
  image: string
  status: ServiceStatus
  createdAt: string | null
  updatedAt: string | null
}

type ServiceInput = {
  serviceName: string
  category: string
  description: string
  price: number
  duration: number
  image: string
  status?: ServiceStatus
}

type CustomerAppointment = {
  id: string
  serviceId: string
  serviceName: string
  serviceCategory: string
  serviceImage: string | null
  serviceDuration: number | null
  appointmentDate: string
  appointmentDateLocal: string | null
  timeSlot: string
  servicePrice: number
  status: AppointmentStatus
  paymentStatus: PaymentStatus
  message: string | null
  requestedAt: string
  createdAt: string | null
  updatedAt: string | null
}

type AppointmentStats = {
  total: number
  pending: number
  confirmed: number
  cancelled: number
}

type CustomerDashboardStats = {
  totalAppointments: number
  pendingAppointments: number
  confirmedAppointments: number
  cancelledAppointments: number
  paidAppointments: number
  unpaidAppointments: number
  payableAppointments: number
}

type UserProfile = {
  id: string
  name: string
  email: string
  image: string | null
  phone: string | null
  role: "customer" | "admin"
  isBlocked: boolean
  emailVerified: boolean
  createdAt: string | null
  updatedAt: string | null
}

type CustomerDashboardData = {
  profile: UserProfile
  stats: CustomerDashboardStats
  upcomingAppointments: CustomerAppointment[]
  recentAppointments: CustomerAppointment[]
  timezone: string
}

type AdminAppointment = {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  customerPhone: string | null
  customerImage: string | null
  customerIsBlocked: boolean
  serviceId: string
  serviceName: string
  serviceCategory: string
  serviceImage: string | null
  serviceDuration: number | null
  appointmentDate: string
  appointmentDateLocal: string | null
  timeSlot: string
  message: string | null
  servicePrice: number
  status: AppointmentStatus
  paymentStatus: PaymentStatus
  requestedAt: string
  createdAt: string | null
  updatedAt: string | null
}

type AdminDashboardOverview = {
  totalCustomers: number
  activeCustomers: number
  blockedCustomers: number
  totalServices: number
  activeServices: number
  inactiveServices: number
  totalAppointments: number
  pendingAppointments: number
  confirmedAppointments: number
  cancelledAppointments: number
  paidAppointments: number
  unpaidAppointments: number
  successfulPayments: number
  failedPayments: number
  totalTransactions: number
  totalRevenueCents: number
  currency: string
  hasRecordedTransactions: boolean
}

type AdminDashboardData = {
  overview: AdminDashboardOverview
  recentAppointments: AdminAppointment[]
  timezone: string
}

type AdminCustomer = {
  id: string
  name: string
  email: string
  phone: string | null
  image: string | null
  role: "customer"
  isBlocked: boolean
  emailVerified: boolean
  createdAt: string
  updatedAt: string | null
  appointmentCount: number
}

type AdminCustomerDetail = AdminCustomer & {
  appointmentStats: AppointmentStats
  recentAppointments: CustomerAppointment[]
}

type CustomerTransaction = {
  id: string
  appointmentId: string
  serviceName: string
  appointmentDate: string | null
  amount: number
  currency: string
  stripeSessionId: string
  status: TransactionStatus
  createdAt: string
}

type AdminTransaction = {
  id: string
  appointmentId: string
  customerId: string
  customerName: string
  customerEmail: string
  serviceName: string
  appointmentDate: string | null
  amount: number
  currency: string
  stripeSessionId: string
  status: TransactionStatus
  createdAt: string
}

type PaginationMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

type AdminAppointmentCounts = {
  all: number
  pending: number
  confirmed: number
  cancelled: number
}

type AdminUserCounts = {
  all: number
  active: number
  blocked: number
}

const SERVICE_IMAGE_HOSTS = [
  "i.ibb.co",
  "i.ibb.co.com",
  "images.unsplash.com",
  "lh3.googleusercontent.com",
  "lh4.googleusercontent.com",
  "lh5.googleusercontent.com",
  "lh6.googleusercontent.com",
] as const

function isAllowedServiceImage(value: string): boolean {
  try {
    const url = new URL(value)
    return (
      url.protocol === "https:" &&
      (SERVICE_IMAGE_HOSTS as readonly string[]).includes(url.hostname)
    )
  } catch {
    return false
  }
}

export { SERVICE_IMAGE_HOSTS, isAllowedServiceImage }
export type {
  AdminAppointment,
  AdminAppointmentCounts,
  AdminCustomer,
  AdminCustomerDetail,
  AdminDashboardData,
  AdminDashboardOverview,
  AdminService,
  AdminTransaction,
  AdminUserCounts,
  AppointmentStats,
  AppointmentStatus,
  CustomerAppointment,
  CustomerDashboardData,
  CustomerDashboardStats,
  CustomerTransaction,
  PaginationMeta,
  PaymentStatus,
  ServiceInput,
  ServiceStatus,
  TransactionStatus,
  UserAccessStatus,
  UserProfile,
}
