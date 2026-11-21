# RupChorcha - Frontend Client & Same-Origin BFF

Frontend web application and same-origin Backend-for-Frontend (BFF) for **RupChorcha** (*Beauty, Elegance & Confidence*), a full-stack salon appointment booking and payment platform.

## Project Overview

RupChorcha enables customers to explore active salon services, filter and sort by category and price, book appointments within `Asia/Dhaka` salon hours (`09:00`–`18:00`), manage pending bookings, and pay for confirmed appointments through **Stripe Checkout**. Salon administrators manage the service menu (with ImgBB image hosting), confirm or cancel appointment requests, manage customer accounts, and audit the read-only Stripe transaction ledger.

All browser authentication, booking, dashboard, profile, image upload, and payment interactions flow through Next.js Server Components and same-origin `/api/auth/*` and `/api/backend/*` Route Handlers to the separate Express REST API repository (`rup-chorcha-backend`). The frontend has zero direct database connections and stores no secrets or raw tokens in `localStorage`.

## Important Features

### Public & Shared Experience
- **Homepage (`/`)**: Editorial RupChorcha hero, live featured active services from Express (`GET /api/services`), interactive category exploration grid, "Why RupChorcha" section, auth-aware Navbar, and salon Footer.
- **Browse Services (`/services`)**: Active-only services directory with debounced search by service name, category filter, price/name/date sorting, URL query synchronization, and `12`/page pagination.
- **Protected Service Details & Booking (`/services/[id]`)**: Server-guarded service details with `AppointmentBookingForm`, `Asia/Dhaka` date picker (`90`-day window), live per-customer slot availability (`GET /api/services/:id/availability`), server-derived price snapshot, and `409 DUPLICATE_APPOINTMENT_SLOT` conflict handling.

### Customer Dashboard (`/customer/*` & `/payment/*`)
- **Customer Overview (`/customer`)**: Total, pending, confirmed, cancelled, and payable appointment metrics plus upcoming and recent bookings (`GET /api/dashboard/customer`).
- **My Appointments & Payments Tab (`/customer/appointments`)**: Status-filtered appointment cards (`10`/page), appointment details dialog, pending-only cancellation (`PATCH /api/backend/appointments/[id]/cancel`), **Pay Now** button for confirmed unpaid appointments (`POST /api/backend/payments/checkout`), and a dedicated **Payments** tab (`GET /api/transactions/my`) with status filtering and pagination.
- **Stripe Checkout Return Pages (`/payment/success`, `/payment/cancel`)**:
  - `/payment/success`: Reads `session_id` and verifies status via `GET /api/backend/payments/session/[sessionId]` (polling while `"pending"` until the verified Stripe webhook marks the transaction `"paid"` or `"failed"`). Never marks a payment paid from the redirect URL alone.
  - `/payment/cancel`: Explains checkout cancellation without altering the appointment and offers an eligibility-checked **Retry payment** action when the appointment remains confirmed and unpaid.
- **Customer Profile (`/customer/profile`)**: Update full name, phone, and profile image (via URL or live file upload through `POST /api/backend/uploads/profile-image` -> Express ImgBB pipeline).

### Admin Dashboard (`/admin/*`)
- **Admin Overview (`/admin`)**: Registered customer counts, active/inactive service counts, appointment status breakdown, and verified paid transaction count & USD revenue (`GET /api/dashboard/admin`).
- **Manage Services (`/admin/services`, `/admin/services/new`, `/admin/services/update/[id]`)**: Full service CRUD, search/category/status filtering, activation toggle, safe delete (hard-delete when unreferenced; soft-deactivate when referenced by appointments), and service image upload (`POST /api/admin/uploads/service-image` -> Express ImgBB pipeline).
- **Manage Appointments (`/admin/appointments`)**: Filter by status, search customer/service, inspect hydrated booking details (`GET /api/backend/admin/appointments/[id]`), confirm pending requests, or cancel pending/confirmed appointments.
- **Manage Users (`/admin/users`)**: Search and filter customers, inspect customer booking stats (`GET /api/backend/admin/users/[id]`), and block/unblock customer accounts (immediately revoking Better Auth sessions on block).
- **Read-Only Transactions Ledger (`/admin/transactions`)**: Filter by payment status (`All`, `Paid`, `Pending`, `Failed`), search by customer name/email, service name, or Stripe session ID, paginate (`10`/page), and inspect verified USD revenue (`GET /api/admin/transactions`).

## Technology Stack

- **Framework:** Next.js `16.4.6` (App Router, Server Components, Route Handlers, `proxy.ts`, Turbopack)
- **Language & UI:** React `19.3.0`, TypeScript `5`, Tailwind CSS v4, Base UI (`@base-ui/react`) / shadcn components, `lucide-react`
- **Validation & Security:** `zod`, `HttpOnly` SameSite cookies (`rc_access_token` + Better Auth session cookie forwarding), same-origin CSRF origin verification (`verifySameOriginCsrf`), open-redirect sanitization
- **Backend Integration:** Separate Express 5 + MongoDB native driver + Better Auth + `jose` JWT + Stripe Checkout + ImgBB API server (`rup-chorcha-backend`)

## Installation & Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and configure the environment variables:
   ```bash
   cp .env.example .env
   ```
3. Ensure the Express backend (`rup-chorcha-backend`) is running on `http://localhost:5000` (see the backend repository `README.md` for MongoDB Atlas, Better Auth, admin seeding, ImgBB, and Stripe setup).
4. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000`.
5. Production build & verification:
   ```bash
   npx next typegen
   npx tsc --noEmit
   npm run lint
   npm run build
   npm start
   ```

## Required Environment Variables

Names only — never commit `.env` or secret values.

| Variable | Scope | Default (Local) | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Public / Server | `http://localhost:3000` | Canonical origin of the Next.js client (used for CSRF verification and redirect construction) |
| `API_URL` | Server-only | `http://localhost:5000` | Base URL of the Express backend REST API |

*(All database, Better Auth, JWT, Google OAuth, ImgBB, and Stripe secret variables live exclusively in `rup-chorcha-backend/.env`.)*

## Repositories & Links

- **Frontend Repository (Client):** https://github.com/devnajmulislam/rup-chorcha
- **Backend Repository (Server):** https://github.com/devnajmulislam/rup-chorcha-backend
- **Live Website:** Pending Step 7 deployment
