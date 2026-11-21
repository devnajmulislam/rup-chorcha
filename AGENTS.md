<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## RupChorcha Brand & UI/UX (permanent)

> This section is permanent. Every new page, component, form, table, email, and dashboard must follow `BRAND_GUIDELINES.md` and `DESIGN_SYSTEM.md`.

- **Brand name:** RupChorcha. Never SalonBook or the reference image's original business name.
- **Tagline:** Beauty, Elegance & Confidence.
- **Primary Pink:** `#E50057`
- **Deep Plum:** `#3A1830`
- **Warm Ivory:** `#FFF9F7`
- **Soft Blush:** `#F7E4EA`
- **Muted Rose:** `#D99AAE`
- **Charcoal:** `#29232A`
- **White:** `#FFFFFF`
- **Headings:** Cormorant Garamond.
- **Body and interface:** DM Sans.
- **Decorative tagline only:** Allura.
- **Bengali text:** Noto Sans Bengali.
- **Logo:** use the original `Logo` / `LogoMark` components and the SVG assets in `public/brand`. The supplied reference image is inspiration only and must not be used as the production logo.
- **Do not:** add dead links, fake controls, invented statistics, ratings, years of experience, testimonials, or business claims.
- **Do not:** introduce a second design system, new colour tokens outside the approved palette, heavy gradients, glassmorphism, or unnecessary animations.
- **Do not:** change backend, database, authentication, or Stripe architecture as part of UI work.
- **Homepage data:** service cards must remain ready for live Express/MongoDB data. Demo data is temporary and must be replaced by active services from the API.
- **Status communication:** always use icon + text, never colour alone.
- **Verification:** run `npm run build`, `npm run lint`, and `npx tsc --noEmit` after UI changes.

# RupChorcha — Master Implementation Process

> This is the single master tracker for the complete project. Do not write application code until the corresponding phase is reached. Work phase by phase, test the acceptance criteria, then make the commit checkpoint before moving on.
>
> Brand rule: the assignment PDF says "SalonBook", but every user-facing name, logo, metadata title, README, email, and seed value in this project must use **RupChorcha**.

## Repositories and paths

- Client: `C:/customization/AI-Driven-Full-Stack-Web-Engineer/assignments/rup-chorcha`
- Backend: `C:/customization/AI-Driven-Full-Stack-Web-Engineer/assignments/rup-chorcha-backend`
- The two repositories must stay separate because the assignment requires separate client and server repositories.

## How to use this file

1. Read the locked decisions and assumptions before starting.
2. Complete Phase 0 first.
3. In each phase, do the backend steps, then the client steps, then test both together.
4. Tick a checkbox only after the acceptance criteria pass.
5. Make the listed commit checkpoint before starting the next phase.
6. If a new decision is made, update this file first so the process stays accurate.
7. Keep secrets in `.env` files only. Never commit `.env` files or real credentials.

---

## 1. Locked decisions

These are confirmed by the project owner:

1. **Separate repositories**: client in `rup-chorcha`, server in `rup-chorcha-backend`.
2. **Authentication**: Better Auth on the Express backend, combined with Express JWT verification middleware.
3. **Duplicate appointment rule**: uniqueness is **per customer**, not global. Two different customers may book the same date and time slot. The same customer cannot have two active appointments for the same date and time slot.
4. **Currency**: USD, international standard. Store money as integer cents. Display with the `$` symbol and two decimal places.
5. **Brand**: RupChorcha everywhere.

### Recommended defaults for items not explicitly confirmed

- **Backend language**: keep JavaScript ESM because the existing backend is already JavaScript and the assignment says TypeScript is optional. If TypeScript is wanted, convert it before Phase 1, not later.
- **Database driver**: use the native `mongodb` driver that is already installed. Do not add Mongoose. The assignment allows MongoDB without Mongoose, and using one driver avoids duplicate connections and ID mismatches with Better Auth.
- **Next.js auth transport**: use a same-origin BFF in Next.js. The browser talks to Next.js; Next.js talks to Express. This keeps cookies first-party and avoids production CORS and cookie problems.
- **Timezone**: display and validate in `Asia/Dhaka`; store dates in UTC.
- **Time slots**: 09:00, 10:00, 11:00, 12:00, 13:00, 14:00, 15:00, 16:00, 17:00, 18:00. One-hour slots, last start time 18:00.
- **Categories**: fixed shared constant, not a database collection.
- **Service deletion**: if appointments reference the service, deactivate it instead of hard-deleting it. Hard-delete only when no appointment references it.
- **Paid appointment cancellation**: admin may cancel a paid confirmed appointment, but no automatic refund is implemented. Record this limitation in the README.
- **Blocked users**: reject new sign-ins and reject all protected APIs. Public browsing remains allowed.
- **Sign-up profile image**: accept an image URL at sign-up. File upload is available after signing in from the profile page. This avoids exposing the ImgBB API key or creating a public unauthenticated upload endpoint.
- **Sign-up redirect**: auto-login after registration and redirect to the customer dashboard.
- **Payment failure records**: create `failed` transactions for failed payment intents or expired checkout sessions, only when no paid transaction exists for that appointment.
- **Customer payment history**: show it as a Payments tab inside My Appointments.
- **Appointment details**: use dialogs or sheets instead of separate detail routes.
- **Pagination**: 12 cards on public pages, 10 rows in dashboard tables.
- **Search**: case-insensitive partial match on service name using an escaped regex, with a maximum input length.
- **Email verification and password reset**: out of scope for the first complete version unless extra time remains.
- **Deployment target**: client on Vercel, backend on Render or Railway, database on MongoDB Atlas.
- **Dark mode**: optional, not required.

If any of these defaults are wrong, change them in this section before implementing the affected phase.

---

## 2. Current state

### Client

- Fresh Next.js `16.4.6` App Router project.
- React 19, TypeScript, Tailwind v4, React Compiler enabled, Turbopack default.
- 63 shadcn/Base UI components in `src/components/ui`.
- Custom Base UI toast component exists; Sonner is not installed.
- No auth, API client, database access, or env files.
- `docs/` is gitignored, so the requirements PDF is not committed.
- Default `page.tsx` and `layout.tsx` still show the create-next-app content.

### Backend

- `rup-chorcha-backend` is a separate git repository with one commit: `Finished basic set up`.
- Existing dependencies: `cors`, `dotenv`, `express` 5.3, `mongodb` 7.9.
- Existing `index.js` only starts Express and serves a plain text root route.
- ESM mode is enabled with `"type": "module"`.
- No Better Auth, JWT, Stripe, uploads, validation, TypeScript, or database models yet.

---

## 3. Architecture

```text
Browser
  -> Next.js client (RupChorcha)
       -> Next BFF: /api/auth/* and /api/backend/*
            -> Express API
                 -> MongoDB Atlas
                 -> Better Auth
                 -> Stripe Checkout + webhook
                 -> ImgBB
                 -> Google OAuth
```

### Responsibility split

- **Next.js client**: UI, routing, page guards, BFF proxy, client-side forms and tables.
- **Express backend**: Better Auth, JWT verification, authorization, business rules, MongoDB access, Stripe, ImgBB, Google OAuth callback handling.
- **MongoDB Atlas**: Better Auth collections plus `services`, `appointments`, and `transactions`.
- **Stripe**: Checkout Sessions and webhook events. Stripe is never trusted from the success redirect, only from a verified webhook.
- **ImgBB**: stores service images and profile images and returns URLs.

### BFF rules

- Browser-facing auth routes: `/api/auth/*` in Next.js proxy to the Express Better Auth handler.
- Browser-facing business routes: `/api/backend/*` in Next.js proxy to the Express API.
- The BFF forwards cookies and, when required, the JWT in the `Authorization` header.
- Server Components call Express directly with a server-only API client; they do not call the BFF.
- The Express API also has a CORS allowlist for direct health checks and local debugging, but production browser traffic should use the BFF.
- Cookies must be `httpOnly`, `secure` in production, `sameSite=lax` for the first-party BFF flow.
- Never store JWTs in `localStorage`.

### Next.js 16 rules that must be respected

- `params`, `searchParams`, `cookies()`, and `headers()` are async.
- Dynamic pages use `PageProps<'/route'>` or an inline `Promise` type and `await params`.
- Route Handlers use the second-argument `RouteContext` and await `context.params`.
- `middleware.ts` is deprecated; use `proxy.ts`.
- `proxy.ts` is only an optimistic cookie-presence check; real authorization belongs in server layouts, BFF handlers, and Express middleware.
- `error.tsx` must be a Client Component and uses `retry`.
- `loading.tsx` is the Suspense fallback for the page segment.
- `fetch` and Route Handlers are not cached by default.
- Remote images require `images.remotePatterns` in `next.config.ts`.
- shadcn components here are Base UI variants; use the `render` prop instead of Radix `asChild`.
- The existing toast is Base UI, not Sonner. Reuse it unless it blocks progress.

---

## 4. Frontend pages

### Public and shared

| Route | Access | Content and behavior |
|---|---|---|
| `/` | Public | RupChorcha hero, short description, CTA to Browse Services, salon-themed background, 6 active featured services, category grid, one extra section, footer |
| `/services` | Public | Active services, search by name, category filter, price sorting, pagination, loading/empty states |
| `/services/[id]` | Authenticated | Image, name, category, description, price, duration, booking form. Redirect to sign-in if unauthenticated. Invalid or inactive service shows an error/not-found state |
| `/sign-in` | Public | Email/password, Google sign-in, role-based redirect, blocked-account message |
| `/sign-up` | Public | Full name, email, password, confirm password, optional image URL, Google sign-up, password rules |
| `/payment/success` | Authenticated | Read-only success page; polls transaction status until the webhook marks it paid |
| `/payment/cancel` | Authenticated | Cancelled-payment message and link back to appointments |
| `/forbidden` | Authenticated | Optional role-mismatch or blocked-account page |
| `not-found.tsx`, `error.tsx`, `loading.tsx` | Shared | Invalid routes, failed requests, loading skeletons |

### Customer dashboard

| Route | Content |
|---|---|
| `/dashboard` | Server-side redirect to the correct dashboard by role |
| `/dashboard/customer` | Overview: total, pending, confirmed, cancelled appointment counts; recent appointments |
| `/dashboard/customer/appointments` | Own appointment list/cards; details, cancel pending, pay confirmed/unpaid, payments tab |
| `/dashboard/customer/profile` | Update name, phone, profile image; email and role read-only |

Navigation: Overview, My Appointments, My Profile.

### Admin dashboard

| Route | Content |
|---|---|
| `/dashboard/admin` | Overview: registered customers, active services, total/pending/confirmed appointments, successful payments and revenue |
| `/dashboard/admin/services` | All services, search/filter/sort, activate/deactivate, edit, delete |
| `/dashboard/admin/services/new` | Add service with required image upload |
| `/dashboard/admin/services/[id]/edit` | Update service; replacing the image is optional |
| `/dashboard/admin/appointments` | All appointments, filters, details, confirm pending, cancel pending/confirmed |
| `/dashboard/admin/users` | Customer list, details, block/unblock, search, pagination |
| `/dashboard/admin/transactions` | Read-only transaction table |
| `/dashboard/admin/profile` | Update own name, phone, image |

Navigation: Overview, Manage Services, Add/Update Service, Manage Appointments, Manage Users, Transactions, My Profile.

### Shared frontend components

Build these as reusable components:

- Navbar with auth-aware links, mobile sheet, profile dropdown, and immediate session updates.
- Footer with logo, short description, navigation links, contact information, address, opening hours, social links, and copyright.
- Dashboard sidebar and top bar.
- Role guard for server layouts.
- Service card, status badge, payment badge.
- Stat card, data table, pagination, confirm dialog.
- Appointment form, service form, image upload with preview.
- Empty state, page header, loading skeleton.

### Client data and state rules

- Use Better Auth's client for session state.
- Use `swr` for dashboard lists, filters, and mutations unless a simpler local fetch is enough.
- Use `zod` for form validation where it reduces duplication.
- Reuse the existing toast system for success and error feedback.
- After sign-in and sign-out, call `router.refresh()` so server-rendered navigation and layouts update.
- Use Next `<Image>` for service and profile images, with remote patterns for ImgBB and Google avatars.

---

## 5. Backend REST APIs

Base path: `/api`. Consistent response shape:

- Success: `{ success: true, data, meta? }`
- Error: `{ success: false, message, code?, errors? }`

### Auth

| Method | Route | Access | Purpose |
|---|---|---|---|
| ALL | `/api/auth/*` | Public/session | Better Auth handler: sign-up, sign-in, Google callback, session, sign-out, JWT/JWKS |
| GET | `/api/auth/me` | Authenticated | Optional convenience endpoint if not using `get-session` |

### Services

| Method | Route | Access | Rules |
|---|---|---|---|
| GET | `/api/services` | Public | Active only; search, category, sort, page, limit |
| GET | `/api/services/:id` | Public | Active only; invalid/inactive returns 404 |
| GET | `/api/services/:id/availability?date=` | Customer | Returns the customer's already-booked slots for that date |
| GET | `/api/admin/services` | Admin | All services including inactive; search/filter/sort/page |
| POST | `/api/admin/services` | Admin | Multipart image; price and duration must be positive; status defaults active |
| GET | `/api/admin/services/:id` | Admin | Single service for editing |
| PUT | `/api/admin/services/:id` | Admin | Update fields; optional new image |
| PATCH | `/api/admin/services/:id/status` | Admin | Activate or deactivate |
| DELETE | `/api/admin/services/:id` | Admin | Hard-delete if unreferenced; otherwise deactivate |

### Appointments

| Method | Route | Access | Rules |
|---|---|---|---|
| POST | `/api/appointments` | Customer | Service active; valid future date and allowed slot; no duplicate active slot for the same customer; server sets price snapshot, pending, unpaid |
| GET | `/api/appointments/my` | Customer | Own only; status filter and pagination |
| GET | `/api/appointments/my/:id` | Customer | Own only |
| PATCH | `/api/appointments/my/:id/cancel` | Customer | Own only and pending only |
| GET | `/api/admin/appointments` | Admin | All; filters and pagination |
| GET | `/api/admin/appointments/:id` | Admin | Full customer, service, and message detail |
| PATCH | `/api/admin/appointments/:id/confirm` | Admin | Pending only |
| PATCH | `/api/admin/appointments/:id/cancel` | Admin | Pending or confirmed |

### Dashboard, users, profile

| Method | Route | Access | Purpose |
|---|---|---|---|
| GET | `/api/dashboard/customer` | Customer | Own appointment counts |
| GET | `/api/dashboard/admin` | Admin | Customer, service, appointment, and payment stats |
| GET | `/api/admin/users` | Admin | Customers only; search and pagination |
| GET | `/api/admin/users/:id` | Admin | Customer details |
| PATCH | `/api/admin/users/:id/block` | Admin | Block a customer; never an admin |
| PATCH | `/api/admin/users/:id/unblock` | Admin | Unblock a customer |
| GET | `/api/profile` | Authenticated | Own profile |
| PATCH | `/api/profile` | Authenticated | Name, phone, image only; strip role, isBlocked, and email |

### Payments, uploads, health

| Method | Route | Access | Purpose |
|---|---|---|---|
| POST | `/api/payments/checkout` | Customer | Own, confirmed, unpaid appointment only |
| POST | `/api/payments/webhook` | Stripe signature | Raw body; verified signature; idempotent; only place payment status changes |
| GET | `/api/payments/session/:sessionId` | Authenticated | Read-only payment status for the success page |
| GET | `/api/transactions/my` | Customer | Own payment history |
| GET | `/api/admin/transactions` | Admin | All transactions, read-only |
| POST | `/api/uploads/profile-image` | Authenticated | Upload profile image to ImgBB |
| POST | `/api/admin/uploads/service-image` | Admin | Upload service image to ImgBB |
| GET | `/api/health` | Public | Server and database health |

### Backend middleware order

1. Helmet.
2. CORS with the client origin and credentials.
3. Global rate limiter.
4. Raw body parser for the Stripe webhook route only.
5. JSON body parser for all other routes.
6. Cookie parser.
7. Auth/JWT verification on protected routes.
8. Role and blocked-user guards.
9. Route handlers.
10. 404 handler.
11. Central error handler.

### Error status codes

- 400: validation error, invalid ID, invalid date/slot.
- 401: missing or invalid token/session.
- 403: wrong role, blocked user, or resource owned by someone else.
- 404: service, appointment, user, or transaction not found.
- 409: duplicate slot, invalid status transition, already paid, or conflicting state.
- 500: unexpected server error.

---

## 6. Database collections

All monetary fields are integer cents.

### Better Auth collections

Better Auth owns the auth collections. Do not create duplicate user records.

`user`:

- Better Auth user ID string.
- `name`, `email` unique, `emailVerified`, `image`.
- `role`: `customer` or `admin`; default `customer`.
- `isBlocked`: boolean; default `false`.
- `phone`: optional.
- `createdAt`, `updatedAt`.

`session`, `account`, `verification`: managed entirely by Better Auth.

Better Auth configuration requirements:

- Add `role`, `isBlocked`, and `phone` as additional user fields.
- Mark `role` and `isBlocked` as `input: false` so clients cannot set or change them.
- Enforce password rules on the server: minimum 6 characters, one uppercase, one lowercase.
- Reject blocked users when creating a session and on every protected API request.
- Confirm the Better Auth MongoDB adapter works with the installed `mongodb` version; adjust the driver version if the peer dependency requires it.
- Confirm the Better Auth user ID type. Store `customerId` using that exact type; do not assume it is an ObjectId.

### `services`

- `serviceName`: required, searchable.
- `category`: required, fixed shared category list.
- `description`: required.
- `price`: integer cents, greater than 0.
- `duration`: integer minutes, greater than 0.
- `image`: ImgBB URL, required on create.
- `status`: `active` or `inactive`; default `active`.
- `createdAt`, `updatedAt`.

Indexes:

- `{ status: 1 }`
- `{ category: 1 }`
- `{ price: 1 }`
- Text or normalized index on `serviceName`.
- `{ createdAt: -1 }`

### `appointments`

- `serviceId`: ObjectId referencing `services`.
- `customerId`: Better Auth user ID type.
- `appointmentDate`: UTC date normalized to the salon-local date.
- `timeSlot`: one of the fixed slots.
- `message`: optional, maximum 500 characters.
- `servicePrice`: integer cents, snapshot at booking time.
- `paymentStatus`: `unpaid` or `paid`; default `unpaid`.
- `status`: `pending`, `confirmed`, or `cancelled`; default `pending`.
- `createdAt`, `updatedAt`.

Indexes:

- `{ customerId: 1, createdAt: -1 }`
- `{ serviceId: 1 }`
- `{ status: 1 }`
- `{ appointmentDate: 1, timeSlot: 1 }`
- Unique partial index on `{ customerId: 1, appointmentDate: 1, timeSlot: 1 }` where `status` is `pending` or `confirmed`.

This unique index implements the confirmed per-customer duplicate rule. It does not enforce global salon capacity; different customers may book the same slot.

### `transactions`

- `appointmentId`: ObjectId referencing `appointments`.
- `customerId`: Better Auth user ID type.
- `amount`: integer cents.
- `currency`: `usd`.
- `stripeSessionId`: unique.
- `stripePaymentIntentId`: optional.
- `status`: `paid` or `failed`.
- `createdAt`, `updatedAt`.

Indexes:

- Unique `{ stripeSessionId: 1 }`
- `{ customerId: 1, createdAt: -1 }`
- `{ appointmentId: 1 }`
- `{ status: 1 }`
- Unique partial `{ appointmentId: 1 }` where `status` is `paid`

### Categories and relationships

Do not create a categories collection. Use one shared constant list in both repositories:

Haircut & Styling, Hair Coloring, Hair Treatment, Facial & Skincare, Makeup, Manicure & Pedicure, Spa & Massage.

Relationships:

- One user has many appointments.
- One service has many appointments.
- One appointment has many transaction attempts, but at most one paid transaction.

---

## 7. Authentication and authorization flow

### Sign-up

1. Client validates name, email, password, confirmation, and optional image URL.
2. Better Auth creates the user with `role = customer` and `isBlocked = false`.
3. Client cannot send or change `role` or `isBlocked`.
4. Google sign-up also creates a customer only.
5. Auto-login and redirect to `/dashboard/customer`.
6. Public registration must never create an admin.

### Sign-in

1. Better Auth email/password or Google.
2. Server hook rejects blocked users before creating a session.
3. Redirect by role: admin to `/dashboard/admin`, customer to `/dashboard/customer`.
4. Invalid credentials, blocked account, and network errors show field errors and toasts.
5. Already authenticated users are redirected away from auth pages.

### Session and JWT

1. Better Auth httpOnly cookie is the source of truth.
2. Enable the Better Auth JWT plugin. The BFF obtains and refreshes the JWT from the Better Auth session.
3. The BFF forwards `Authorization: Bearer <jwt>` to Express.
4. Express verifies the JWT signature with the shared secret or JWKS using `jose`.
5. After JWT verification, Express loads the user from MongoDB and checks `role` and `isBlocked`.
6. The client never stores tokens in `localStorage` or non-httpOnly cookies.
7. If the JWT plugin causes integration problems, the fallback is a short-lived JWT issued by Express only after the Better Auth session is validated. The Express JWT middleware requirement still applies.

### Route protection

- `proxy.ts` provides an optimistic cookie check only.
- Server dashboard layouts perform the real session and role checks.
- Every protected Express API uses `requireAuth`, `requireRole`, and `requireNotBlocked`.
- Customer-scoped resources also require an ownership check.
- Customer accessing `/dashboard/admin/*` or `/api/admin/*` is redirected or receives 403.
- Admin trying a customer-only action receives 403.
- Unauthenticated user is sent to `/sign-in?redirect=<validated internal path>`.
- Validate redirect paths to prevent open redirects.

### Admin creation

- No admin registration through the public UI.
- Add a `seed:admin` script using `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
- Create the admin through Better Auth's server API so password hashing is correct, then set `role = admin` directly in MongoDB.
- Provide the admin credentials for evaluation in the final submission.

### Blocked users

- Blocked at session creation and on every protected API request.
- Existing sessions stop working immediately because the database flag is checked per request.
- Show a clear blocked-account message.
- Public browsing remains available.

---

## 8. Business rules

### Services

- Only admins can create, update, delete, activate, or deactivate services.
- Public Home and Browse show active services only.
- Price and duration must be positive.
- New services default to active.
- Service image must be uploaded, not entered as a URL.
- If a service is referenced by appointments, deactivate it instead of deleting it.

### Appointments

- Only authenticated customers can book.
- Admins cannot submit customer bookings.
- Inactive services cannot be booked.
- Invalid service IDs show a not-found/error state.
- Default appointment state is `pending` plus `unpaid`.
- `servicePrice` is saved as a snapshot at booking time.
- The same customer cannot have two active appointments for the same date and time slot.
- Different customers may book the same slot.
- Customers see only their own appointments.
- Customers cancel only their own pending appointments.
- Customers cannot cancel confirmed or cancelled appointments.
- Customers pay only their own confirmed, unpaid appointments.
- Admin confirms only pending appointments.
- Admin cancels pending or confirmed appointments.
- Blocked users cannot use protected features.

### Profile

- Users update only their own name, phone, and image.
- Role, blocked status, and email cannot be changed through profile updates.
- Users cannot update another user's profile.
- Admins view, block, and unblock customers only; never other admins.

### Payments

- Payment status changes only after a verified Stripe webhook.
- The success redirect never marks an appointment paid.
- Webhook processing is idempotent.
- Admin has no endpoint to mark a transaction paid manually.
- Prevent paying an already-paid or cancelled appointment.
- At most one paid transaction per appointment.

### UI and feedback

- Use toasts for success and error feedback; never use browser `alert()`.
- Show loaders for service fetching, dashboard loading, booking, payment, and form submission.
- Use status badges: pending amber, confirmed green, cancelled red; unpaid neutral, paid green.
- Responsive on desktop, tablet, and mobile.
- Confirmation dialogs for cancellation, deletion, and block/unblock.
- Reusable components, consistent spacing, typography, and colors.
- All buttons and navigation links must work.

---

## 9. Stripe payment flow

1. Customer clicks Pay Now in My Appointments.
2. Client calls `POST /api/payments/checkout` with the appointment ID.
3. Server verifies that the appointment belongs to the customer, is confirmed, and is unpaid.
4. Server creates a Stripe Checkout Session with:
   - Service name and amount in cents.
   - Currency `usd`.
   - Metadata: appointment ID, customer ID, service ID.
   - Success URL: `/payment/success?session_id={CHECKOUT_SESSION_ID}`.
   - Cancel URL: `/payment/cancel?appointment_id=...`.
5. Client redirects to the Stripe Checkout URL.
6. The success page polls `GET /api/payments/session/:sessionId`; it never changes payment state.
7. Stripe calls `POST /api/payments/webhook`:
   - Express must use a raw body parser for this route only.
   - Verify the signature with `STRIPE_WEBHOOK_SECRET`.
   - `checkout.session.completed` with `payment_status = paid` creates or updates a paid transaction and marks the appointment paid.
   - `checkout.session.async_payment_succeeded` uses the same handling.
   - `payment_intent.payment_failed` and `checkout.session.expired` create a failed transaction only if no paid transaction exists.
   - Duplicate webhook events are harmless because `stripeSessionId` is unique.
8. The cancel page shows a friendly message and does not change the database.
9. The admin transactions page is read-only.

Edge case assumption: if an admin cancels a paid appointment, the transaction remains paid and no automatic refund is issued. Document this in the README. If an active checkout session exists, attempt to expire it when cancelling the appointment.

---

## 10. Environment variables

Names only. Never commit real values.

### Client

- `NEXT_PUBLIC_APP_URL`
- `API_URL` server-only if using the BFF
- `NEXT_PUBLIC_API_URL` only if direct Express calls are used instead of the BFF

Never put the MongoDB URI, Better Auth secret, Stripe secret, ImgBB key, or Google client secret in the client.

### Backend

- `PORT`
- `NODE_ENV`
- `CLIENT_URL`
- `MONGODB_URI`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `JWT_SECRET` and/or JWT/JWKS configuration
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_CURRENCY` = `usd`
- `IMGBB_API_KEY`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- Optional: `JWT_EXPIRES_IN`, `MAX_UPLOAD_MB`

Add `.env.example` files in both repositories with empty values and comments.

---

## 11. Step-by-step implementation checklist

Do not skip acceptance criteria. Each phase ends with a commit checkpoint.

### Phase 0 — Setup and foundations

#### Backend

- [x] Confirm Node.js 20 or newer (`v24.18.0`).
- [x] Verify Better Auth compatibility with the installed `mongodb` driver version (`mongodb` `7.9.0`, `better-auth` `1.7.27`, `@better-auth/mongo-adapter` `1.7.27`).
- [~] Install backend dependencies: `better-auth`, `jose`, `zod`, `express-rate-limit`, `helmet`, `cookie-parser` installed in Part A/B (`stripe` and `multer` deferred to Phases 2 & 5).
- [x] Add scripts: `dev` using `node --watch`, `start`, and `seed:admin`.
- [x] Create `.env` locally and `.env.example` with names only.
- [x] Create the backend folder structure: config, db, lib, middleware, routes, scripts, utils (`modules` deferred to Step 2+).
- [x] Connect to MongoDB and export the database plus the `services`, `appointments`, and `transactions` collections.
- [x] Add index creation for all collections, including the per-customer slot index.
- [x] Add Helmet, CORS allowlist, global rate limiter, JSON parser, cookie parser, 404 handler, and central error handler.
- [x] Add the health endpoint (`GET /api/health`).
- [x] Add the backend README with project name, description, features, stack, installation, run instructions, env names, and repository link.
- [x] Acceptance: `GET /api/health` returns success; unknown routes return JSON 404; the client origin is allowed; no secrets are committed.
- [x] Commit: `0b2c6eb` (`chore(server): scaffold express foundation, mongo connection, health and error handling`).

#### Client

- [x] Update metadata, logo text, and branding to RupChorcha.
- [x] Update theme tokens and fonts for a professional salon look.
- [x] Add a client Providers component and mount the toaster.
- [~] Create `.env` locally and `.env.example` with names only (synchronized in `.env.example`; uses `.env` rather than `.env.local`).
- [~] Add the server-only auth/BFF helpers, auth BFF routes, shared types, constants, and auth validators (business `/api/backend/*` client deferred to Steps 2–4).
- [x] Configure `next.config.ts` image remote patterns for ImgBB and Google avatars.
- [ ] Add the client README with the required sections.
- [~] Acceptance: `npm run build` / `npm run dev` work and toaster renders (home page still uses `demoServices` until Step 2).
- [ ] Commit: `chore(client): establish RupChorcha theme, providers, and app foundation`.

### Phase 1 — Authentication

#### Backend

- [x] Configure Better Auth with the MongoDB adapter.
- [x] Add email/password and Google providers.
- [x] Add `role`, `isBlocked`, and `phone` additional fields; protect `role` and `isBlocked` from client input.
- [x] Enforce password rules on sign-up.
- [x] Add a session hook that rejects blocked users.
- [x] Implement the HS256 JWT issuer/verifier (`jose`) via `POST /api/jwt/token` and `GET /api/jwt/me`.
- [x] Mount the Better Auth handler (`/api/auth/*splat`).
- [x] Add JWT verification, role, and blocked-user middleware (`requireAuth`, `requireNotBlocked`, `requireRole`, `protect`; resource ownership middleware deferred to Steps 3–4).
- [x] Add the admin seed script (`npm run seed:admin`).
- [~] Test sign-up, sign-in, Google initiation, blocked user, admin role, and JWT-protected endpoints (interactive Google consent requires manual browser verification).
- [x] Acceptance: customers and admins receive correct roles; blocked users are rejected; no client can create an admin through registration.
- [x] Commit: `5a961b2` (`feat(server): add better auth, jose jwt verification, role guards, and admin seed script`).

#### Client

- [x] Add the same-origin auth BFF routes (`/api/auth/*`) and client session provider (`src/lib/auth-client.ts`).
- [x] Build the sign-up page with password rules and image URL support.
- [x] Build the sign-in page with email/password and Google initiation.
- [x] Build the auth-aware navbar, profile dropdown, mobile sheet, and sign-out connected to the BFF.
- [x] Add auth redirects (`?redirect=` sanitized), Next.js 16 `src/proxy.ts`, and server-side protected dashboard layouts/guards (`src/lib/session.ts`).
- [~] Test refresh persistence, role redirects, blocked users, and sign-out (all verified via live E2E HTTP/cookie/SSR integration suite; live Chrome DevTools click-through could not run because remote debugging was not active).
- [x] Acceptance (server/API/SSR verified): session persists via HttpOnly cookies; private routes survive refresh; role mismatch cannot open the other dashboard.
- [x] Commit: `8e713d8` (`feat(client): add same-origin auth BFF, session integration, and server route guards`).

### Phase 2 — Services

#### Backend

- [ ] Add service validation schemas.
- [ ] Add the ImgBB upload utility with MIME and size validation.
- [ ] Add the admin service image upload endpoint.
- [ ] Add service create, read, update, delete, and status APIs.
- [ ] Add public service list with search, category filter, price sorting, and pagination.
- [ ] Add public service detail with active-only enforcement.
- [ ] Add indexes for search, filter, and sort.
- [ ] Test upload, validation, inactive filtering, and invalid IDs.
- [ ] Acceptance: public APIs never expose inactive services; only admins can mutate services.
- [ ] Commit: `feat(server): add imgbb uploads and admin/public service APIs`.

#### Client

- [ ] Build the shared service card, status badge, and image components.
- [ ] Build the home hero, featured services, categories, and extra section.
- [ ] Build the Browse Services page with search, category filter, price sort, and pagination.
- [ ] Build the protected service details page with invalid/inactive handling.
- [ ] Show the booking option only for customers; admins see a clear message that admins cannot book.
- [ ] Test responsive layouts, loading, empty state, and search behavior.
- [ ] Acceptance: only active services appear publicly; details require authentication; search/filter/sort work together.
- [ ] Commit: `feat(client): add home, browse services, and protected service details`.

### Phase 3 — Appointments and customer dashboard

#### Backend

- [ ] Add appointment validation and the per-customer duplicate index.
- [ ] Add the booking API with active-service check, date/slot validation, price snapshot, pending status, and unpaid status.
- [ ] Add the availability endpoint for the customer's booked slots.
- [ ] Add customer appointment list, detail, and cancel APIs.
- [ ] Add the customer dashboard stats API.
- [ ] Test duplicate slot conflicts, inactive services, past dates, ownership, and cancel rules.
- [ ] Acceptance: duplicate active slots for the same customer return 409; different customers can use the same slot; customers cannot see or modify others' appointments.
- [ ] Commit: `feat(server): add appointment booking, availability, and customer appointment APIs`.

#### Client

- [ ] Build the booking form with calendar, time slots, and optional message.
- [ ] Add booking success, conflict, and error feedback.
- [ ] Build the customer dashboard layout, sidebar, and overview stats.
- [ ] Build My Appointments with details, cancel confirmation, and status badges.
- [ ] Test refresh, loading, empty state, and mobile layout.
- [ ] Acceptance: customer can book, see only their appointments, and cancel only pending ones.
- [ ] Commit: `feat(client): add booking flow and customer dashboard appointments`.

### Phase 4 — Admin management

#### Backend

- [ ] Add admin appointment list, detail, confirm, and cancel APIs.
- [ ] Add admin customer list, detail, block, and unblock APIs.
- [ ] Add admin dashboard stats.
- [ ] Add profile get and update APIs.
- [ ] Test every role and status transition.
- [ ] Acceptance: only pending appointments can be confirmed; admins cannot block admins; profile cannot change role or blocked status.
- [ ] Commit: `feat(server): add admin appointment, user, dashboard, and profile APIs`.

#### Client

- [ ] Build the admin dashboard layout and overview.
- [ ] Build Manage Services with search, filter, sort, status toggle, edit, and delete.
- [ ] Build Add Service and Edit Service forms with image upload and preview.
- [ ] Build Manage Appointments with details, confirm, and cancel.
- [ ] Build Manage Users with details and block/unblock.
- [ ] Add profile pages for customer and admin.
- [ ] Add a transactions page placeholder until Phase 5.
- [ ] Test role-based navigation and URL guards.
- [ ] Acceptance: admin can manage services, appointments, and users; customers cannot open admin routes.
- [ ] Commit: `feat(client): add admin dashboard, service management, appointments, and users`.

### Phase 5 — Payments

#### Backend

- [ ] Add the Stripe client and checkout session API.
- [ ] Add the raw-body webhook route and signature verification.
- [ ] Add idempotent transaction creation and appointment payment updates.
- [ ] Add the read-only session status endpoint.
- [ ] Add customer and admin transaction list APIs.
- [ ] Test with Stripe CLI, duplicate webhook events, failed payments, and expired sessions.
- [ ] Acceptance: payment status changes only after a verified webhook; duplicate events are harmless; admins cannot mutate transactions.
- [ ] Commit: `feat(server): add stripe checkout, webhook, and transaction APIs`.

#### Client

- [ ] Add Pay Now to confirmed and unpaid appointments.
- [ ] Add the payment success and cancel pages.
- [ ] Add the customer payments tab with payment history.
- [ ] Add the admin transactions table.
- [ ] Test success redirect, webhook delay, cancel, and refresh.
- [ ] Acceptance: success page shows the correct final state; no client code marks payments paid.
- [ ] Commit: `feat(client): add stripe checkout redirect, payment status, and transaction views`.

### Phase 6 — Polish and completeness

- [ ] Add loading skeletons for all data pages.
- [ ] Add `error.tsx`, `not-found.tsx`, and empty states.
- [ ] Add toasts for every success and failure action.
- [ ] Remove all `alert()` usage.
- [ ] Verify responsive layouts on mobile, tablet, and desktop.
- [ ] Verify keyboard navigation and form labels.
- [ ] Verify all buttons and navigation links.
- [ ] Add rate limiting to auth, checkout, and uploads.
- [ ] Add input sanitization and NoSQL injection protection.
- [ ] Review files for secrets and sensitive logging.
- [ ] Add optional demo seed data if useful for screenshots.
- [ ] Test service deactivation, invalid IDs, booking conflicts, and payment failures.
- [ ] Acceptance: no broken links, no layout overflow, no browser alerts, and all error paths have feedback.
- [ ] Commit: `polish: loading, error, empty, responsive, and accessibility improvements`.

### Phase 7 — Deployment and final QA

- [ ] Deploy the backend.
- [ ] Deploy the client.
- [ ] Configure production environment variables on both platforms.
- [ ] Configure CORS and cookie settings.
- [ ] Register the production Stripe webhook URL.
- [ ] Add production Google OAuth redirect URIs.
- [ ] Seed the production admin account.
- [ ] Test private routes after refresh.
- [ ] Test no 404/504 on production routes.
- [ ] Test the complete Stripe test-mode flow on the live site.
- [ ] Test admin credentials on the live site.
- [ ] Update both READMEs with live links, repository links, and env names.
- [ ] Prepare the submission: admin email, admin password, live site, client repo, server repo.
- [ ] Acceptance: all final checklist items pass with separate admin and customer accounts.
- [ ] Commit: `docs: add deployment links, setup instructions, and final project documentation`.

---

## 12. Commit tracker

The assignment requires at least 20 meaningful client commits and 12 meaningful server commits.

### Client — target 20+, current 10

- [x] Theme, fonts, providers, toaster
- [x] Public layout, navbar, footer (initial build; Footer/CTA/Home updates pending Step 2)
- [~] Home hero and featured services (uses `demoServices` until Step 2)
- [~] Home categories and extra section (non-interactive categories until Step 2)
- [~] Shared service card and status badges (details link pending Step 2)
- [ ] Browse search, filter, and sort
- [ ] Service details page
- [ ] Booking form and dialog
- [x] Auth client, BFF routes, and sign-up
- [x] Sign-in and Google OAuth BFF initiation/callback
- [x] Route guards (`src/proxy.ts`, `src/lib/session.ts`) and role redirects
- [~] Customer dashboard layout and overview (auth/BFF wired; data queries migrate in Step 4)
- [~] Customer appointments list and detail (data queries migrate in Step 3–4)
- [~] Customer cancel flow (migrates in Step 3–4)
- [ ] Pay Now and checkout redirect
- [ ] Payment success and cancel pages
- [ ] Customer payment history
- [~] Profile management (auth BFF `/api/auth/profile` wired; ImgBB profile upload in Step 4)
- [~] Admin dashboard layout and overview (auth/BFF wired; data queries migrate in Step 4)
- [~] Admin services table (migrates in Step 2–4)
- [~] Add/edit service and image upload (migrates in Step 2)
- [~] Admin appointment management (migrates in Step 4)
- [~] Admin user management (migrates in Step 4)
- [~] Admin transactions (migrates in Step 5)
- [ ] Responsive, loading, error, and empty-state polish
- [ ] README and env example (frontend `.env.example` synchronized; `README.md` pending Step 7)

### Server — target 12+, current 4

- [x] Express foundation, env, health, error handling
- [x] MongoDB connection, collections, and indexes
- [x] Better Auth configuration
- [x] Admin seed script
- [x] JWT, role, and blocked-user middleware
- [ ] ImgBB uploads
- [ ] Service CRUD APIs
- [ ] Public service search, filter, and sort
- [ ] Appointment booking and availability
- [ ] Customer appointment APIs
- [ ] Admin appointment APIs
- [ ] Dashboard statistics APIs
- [ ] User management APIs
- [ ] Profile APIs
- [ ] Stripe checkout API
- [ ] Stripe webhook and transactions
- [ ] Customer/admin transaction APIs
- [ ] Validation, rate limiting, CORS, and security hardening
- [ ] README and env example

Do not fake commits by splitting unrelated changes. Each commit should represent the work described.

---

## 13. Final testing checklist

### Authentication

- [x] Sign-up works with valid fields (verified via `POST /api/auth/register` E2E test).
- [x] Password shorter than 6, without uppercase, or without lowercase is rejected (verified by Zod BFF & Express Better Auth hooks).
- [x] Duplicate email shows a useful error (verified `409 USER_ALREADY_EXISTS`).
- [~] Google sign-in works (`GET /api/auth/providers`, `POST /api/auth/google`, and `GET /api/auth/callback/google` verified; full interactive Google consent requires manual browser login).
- [x] Customer and admin redirect to the correct dashboard (verified via SSR + E2E redirects).
- [x] Blocked user cannot sign in (verified `403 USER_BLOCKED` + `/sign-in?blocked=1`).
- [x] Blocked user cannot use protected APIs (verified live DB `isBlocked` check on `/api/jwt/me`, `/api/auth/me`, `/api/auth/session`, `/customer`).
- [x] Admin cannot be created from public registration (verified injected `role: "admin"` forced to `"customer"`).
- [x] Session survives page refresh (verified repeated SSR requests with HttpOnly cookies).
- [~] Sign-out clears the session and updates the navbar (`POST /api/auth/logout` verified clearing cookies + invalidating Express Better Auth DB session; live Chrome UI visual check pending manual verification).

### Services

- [ ] Admin can add a service with an image.
- [ ] Admin can update and deactivate a service.
- [ ] Admin can delete an unreferenced service.
- [ ] Invalid price and duration are rejected.
- [ ] Public pages show active services only.
- [ ] Search by name works.
- [ ] Category filter works.
- [ ] Price sorting works in both directions.
- [ ] Invalid service ID shows a proper error.
- [ ] Inactive service cannot be booked.

### Appointments

- [ ] Customer can submit a booking.
- [ ] Appointment defaults to pending and unpaid.
- [ ] Same customer cannot duplicate an active date and time slot.
- [ ] Different customers can book the same slot.
- [ ] Customer sees only their own appointments.
- [ ] Customer can cancel only pending appointments.
- [ ] Customer cannot cancel confirmed or cancelled appointments.
- [ ] Admin can confirm only pending appointments.
- [ ] Admin can cancel pending and confirmed appointments.
- [ ] Admin sees customer, service, message, price, status, payment status, and request date.
- [ ] Blocked customer cannot book.

### Payments

- [ ] Pay Now appears only for confirmed and unpaid appointments.
- [ ] Pending and cancelled appointments cannot be paid.
- [ ] Checkout redirects to Stripe.
- [ ] Success page shows the final state only after the webhook.
- [ ] Duplicate webhook events do not create duplicate paid transactions.
- [ ] Failed or expired payment is recorded correctly.
- [ ] Admin cannot manually mark a payment successful.
- [ ] Customer payment history is correct.
- [ ] Admin transactions are read-only.

### UI and deployment

- [ ] Desktop, tablet, and mobile layouts are usable.
- [ ] No browser `alert()` is used.
- [ ] Toasts appear for success and failure.
- [ ] Loading states appear during fetch, booking, and payment.
- [ ] Error, not-found, and empty states are visible.
- [ ] Private routes work after refresh.
- [ ] Production routes do not 404 or 504.
- [ ] Stripe webhook works on the live site.
- [ ] Admin credentials work on the live site.
- [ ] No `.env` file or secret is committed.
- [ ] Both READMEs are complete.
- [ ] Client commit count is at least 20.
- [ ] Server commit count is at least 12.

---

## 14. Security checklist

- [x] All secrets are in environment variables.
- [x] `.env` files are gitignored in both repositories.
- [x] `role` and `isBlocked` are server-controlled and cannot be changed by clients.
- [ ] Every protected API verifies JWT, role, blocked status, and ownership (verified on Express `/api/jwt/*` and Next.js auth BFF; business REST routes pending Steps 2–5).
- [ ] Admin endpoints reject customers (verified on `/admin*` pages and `/api/jwt/admin-check`; business APIs pending Steps 2–5).
- [ ] Customer endpoints reject admins where required (verified on `/customer*` pages and `/api/jwt/customer-check`; business APIs pending Steps 2–5).
- [ ] Service price and appointment price are server-derived, never trusted from the client.
- [ ] Payment status is set only by the verified Stripe webhook.
- [ ] Stripe webhook uses a raw body and signature verification.
- [ ] Webhook handling is idempotent.
- [ ] File uploads validate MIME type and size.
- [ ] Search input is escaped and length-limited.
- [ ] Request bodies are validated and do not pass raw objects into MongoDB queries.
- [~] Auth, checkout, and upload routes are rate-limited (`/api/auth` and `/api` rate-limited on Express; checkout & upload routes pending Steps 2 & 5).
- [x] CORS uses an explicit origin allowlist with credentials (and BFF enforces same-origin CSRF verification).
- [x] Cookies are httpOnly and secure in production (`HttpOnly`, `SameSite=Lax`, `Path=/`, HTTPS-aware `Secure`).
- [x] No stack traces or secrets are exposed in production errors.
- [x] No sensitive data is logged.
- [x] Admin seeding is a server-side script, not a public endpoint.

---

## 15. Definition of done

The project is complete only when:

1. All pages and features in the requirements PDF are implemented.
2. Customer and admin role permissions are enforced on the server, not only in the UI.
3. The per-customer duplicate slot rule is enforced by a database index and returns a clear 409 error.
4. Stripe Checkout works in test mode and the verified webhook updates payment status.
5. The admin has no API to manually modify payment records.
6. Both repositories have meaningful commit history meeting the minimums.
7. Both READMEs contain project name, description, features, stack, installation, run instructions, env variable names, live link, and repository links.
8. The live client and server work together with no CORS, 404, 504, or reload issues.
9. Private routes and authentication survive refresh.
10. The production admin credentials work.
11. No secrets are committed.
12. The final submission includes admin email, admin password, live site link, client repository link, and server repository link.

---

## 16. Remaining decisions to confirm while working

These do not block Phase 0 but must be resolved before the related phase:

- Timezone: `Asia/Dhaka` is assumed. Confirm if the salon operates elsewhere.
- Opening hours and slot list: 09:00 to 18:00 in one-hour slots is assumed.
- Paid appointment cancellation: no automatic refund is assumed.
- Service deletion: deactivate if referenced is assumed.
- Sign-up image: URL at sign-up, upload after login is assumed.
- Blocked users: reject login and protected APIs is assumed.
- Email verification and password reset: out of scope is assumed.
- Customer payment history: a tab inside My Appointments is assumed.
- Appointment details: dialogs and sheets are assumed.
- Footer contact, address, hours, and social links: static content is assumed because no settings collection is specified.
- Additional home section: "Why RupChorcha" with testimonials or gallery is proposed.
- Backend language: JavaScript ESM is assumed. Convert to TypeScript before Phase 1 if desired, not later.
- Backend database access: native `mongodb` driver is assumed; do not add Mongoose unless a concrete blocker appears.

Update this file whenever one of these assumptions changes.

---

# Project Status & Development Roadmap

> Last updated: 2026-11-21 (Step 1 — Part A, Part B, and Part C Stage 1 completed and verified; Step 2 Services APIs & Public Pages is next).
>
> Checkbox legend:
> - `[x]` Completed and verified
> - `[ ]` Not completed
> - `[~]` Partially completed
> - `[?]` Needs manual verification

## A. Completed Work

### Step 1 — Part A: Express Backend Foundation (`rup-chorcha-backend`, commit `0b2c6eb`)

- [x] Separate Express 5 ESM backend structure (`config/`, `db/`, `lib/`, `middleware/`, `routes/`, `scripts/`, `utils/`) connected to MongoDB (`rup-chorcha` database) via the native `mongodb` driver.
- [x] Security and request middleware stack: Helmet, explicit CORS allowlist with credentials, global rate limiting, cookie parser, JSON parsing, central error handler, and JSON 404 handler.
- [x] `GET /api/health` endpoint and MongoDB index bootstrap.
- [x] Backend `README.md` and `.env.example` synchronized.

### Step 1 — Part B: Express Authentication & Authorization (`rup-chorcha-backend`, commit `5a961b2`)

- [x] Better Auth mounted on Express (`/api/auth/*splat`, `useSecureCookies: env.isProduction`, `sameSite: "lax"`) backed by MongoDB adapter (`user`, `session`, `account`, `verification`).
- [x] Role and block enforcement: server-owned `role` (`customer` / `admin`) and `isBlocked` fields, `seed:admin` script, and Express middleware `requireAuth`, `requireNotBlocked`, and `requireRole`.
- [x] `jose` HS256 JWT bridge routes (`POST /api/jwt/token` with 15m TTL, `GET /api/jwt/me` performing live MongoDB `findUserById` + `isBlocked` check, and `GET /api/jwt/providers`).

### Step 1 — Part C, Stage 1: Next.js Same-Origin Auth BFF & Session Integration (`rup-chorcha`)

- [x] Removed the duplicate Next.js Better Auth server (`src/app/api/auth/[...all]/route.ts`) and migrated auth/session flows to the Express backend via a same-origin Next.js BFF.
- [x] Implemented server-only Express BFF client and session resolution (`src/lib/auth.ts`, `src/lib/auth-bff.ts`, `src/lib/session.ts`) with React `cache()`-memoized `getServerSession()`, `requireSession()`, `requireRole()`, and `BackendUnavailableError`.
- [x] Implemented 10 Next.js BFF route handlers under `src/app/api/auth/*`: `register`, `login`, `logout`, `session`, `me`, `providers`, `google`, `callback/[provider]`, `profile`, and `error`.
- [x] Added Zod v4 request validation (`src/lib/auth-validators.ts`) enforcing registration password rules, URL safety, nullable/optional `image`/`phone` handling, and server-side stripping of `role`, `isBlocked`, and `email` on profile updates.
- [x] Hardened redirects and CSRF protection: `sanitizeRedirectPath()`, `isPathAllowedForRole()`, and `resolvePostAuthDestination()` in `src/lib/roles.ts`, same-origin `Origin`/`Referer`/`Sec-Fetch-Site` CSRF validation in `verifySameOriginCsrf()`, and `NEXT_PUBLIC_APP_URL`-anchored `getAppOrigin()` ignoring forged `x-forwarded-host`/`host` headers.
- [x] Replaced `better-auth/react` client with same-origin `AuthSessionProvider` and `useAuthSession()` (`src/lib/auth-client.ts`), cross-tab `BroadcastChannel("rupchorcha-auth")` sync, and zero `localStorage`/`sessionStorage` token storage.
- [x] Added Next.js 16 `src/proxy.ts` optimistic cookie check on `/customer/:path*`, `/admin/:path*`, `/dashboard/:path*`, paired with server-side route verification and Next.js 16 `error.tsx` boundaries (`{ error, retry }`) in `src/app/error.tsx` and `src/app/(dashboard)/error.tsx`.
- [x] Connected `SignInForm`, `SignUpForm`, `AuthContinue`, `Navbar`, `DashboardSidebar`, `ProfileForm`, auth pages, and `src/app/api/admin/uploads/service-image/route.ts` to the new BFF session/auth flow while preserving the RupChorcha dashboard UI.

## B. Current Project Status

### Implemented Functionality

- **Backend (`rup-chorcha-backend`, latest commit `5a961b2`):** Express foundation, MongoDB connection and indexes, security middleware, Better Auth email/password + Google OAuth support, admin seed script, `jose` HS256 JWT issuance/verification (`/api/jwt/*`), and `requireAuth`/`requireNotBlocked`/`requireRole` guards are implemented.
- **Frontend Auth & Session Integration (`rup-chorcha`):** Same-origin Next.js BFF routes (`/api/auth/*`), `HttpOnly` cookie and HS256 JWT handling (`rc_access_token`), server-side route guards on `/customer/*`, `/admin/*`, and `/dashboard/*`, cross-tab navbar/sidebar session sync, profile update BFF proxy, and Next.js 16 `proxy.ts` + `error.tsx` boundaries are implemented and verified.
- **Preserved Existing Frontend UI (pending Step 2–4 API migration):** RupChorcha branding, design system, public home/services shells, and customer/admin dashboard UI pages remain intact.

### Incomplete Functionality (Out of Stage 1 Scope)

- Express REST APIs for services (`/api/services*`, `/api/admin/services*`), ImgBB uploads on Express, appointments (`/api/appointments*`, `/api/admin/appointments*`), dashboard aggregations, admin users/transactions, and Express `/api/profile` business routes are not yet built.
- Public home (`/`) live data integration, `/services` search/filter/sort/pagination, protected `/services/[id]` appointment booking, Stripe Checkout + raw-body webhooks + `/payment/*` pages, and migrating dashboard business queries (`src/lib/db.ts`, `src/lib/services.ts`, `src/lib/appointments.ts`, `src/lib/admin.ts`) off direct Next.js MongoDB access remain pending for Steps 2–5.
- Production deployment, full `README.md` updates in `rup-chorcha`, and repository commit-count targets remain pending for Steps 6–7.

### Known Issues & Limitations

- **Interactive Browser & Google OAuth Consent Not Tested Automatically:** `chrome_devtools` MCP failed to connect (`ENOENT` on `DevToolsActivePort` in the local Chrome profile), and live Google OAuth credentials/interactive Google consent were not exercised in a browser. Google OAuth initiation (`200`), state-cookie forwarding, forged host rejection, and `/api/auth/error` callback translation were verified via HTTP integration tests.
- **Stateless JWT Window on Logout:** Logout calls Express `/api/auth/sign-out` (deleting the MongoDB `session` record) and clears `rc_access_token` plus all Better Auth cookies in the browser, but the stateless 15-minute HS256 JWT has no server-side JTI revocation blocklist if exfiltrated before logout. Blocked status (`isBlocked`) is checked live in MongoDB on every `/api/jwt/me` and `/api/jwt/token` call.
- **Temporary Direct Env Vars in Next.js:** `MONGODB_URI`, `MONGODB_DB_NAME`, and `IMGBB_API_KEY` remain temporarily configured in `rup-chorcha` for existing Steps 2–4 UI modules (`src/lib/db.ts` and `src/app/api/admin/uploads/service-image/route.ts`) until those features migrate to the Express backend in Steps 2–4. Never expose these via `NEXT_PUBLIC_*`.
- **Pre-existing Lint Warning:** `npm run lint` reports 1 pre-existing unused-import warning (`Footer` in `src/app/(root)/page.tsx`), outside Stage 1 scope.

## C. Architecture

### Authentication & Session Flow

```text
Browser
  -> Same-origin Next.js BFF (/api/auth/*)
       -> Express Backend (/api/auth/*splat + /api/jwt/*)
            -> MongoDB Atlas (user, session, account, verification)

Server Components / Route Guards
  -> getServerSession() [React cache()]
       -> Express GET /api/jwt/me (Bearer rc_access_token + live DB user/isBlocked check)
       -> Fallback refresh on TOKEN_EXPIRED only when valid Better Auth session cookie exists
```

### Next.js Same-Origin BFF Routes (`/api/auth/*`)

| Route | Methods | Responsibility |
|---|---|---|
| `/api/auth/register` | `POST` | CSRF check, Zod `registerSchema` validation, forces `customer` role via Express `/api/auth/sign-up/email`, exchanges `/api/jwt/token`, sets auth cookies (`201`) |
| `/api/auth/login` | `POST` | CSRF check, Zod `loginSchema` validation, calls Express `/api/auth/sign-in/email`, handles blocked-user rejection, sets session + `rc_access_token` (`200`) |
| `/api/auth/logout` | `POST` | CSRF check, forwards cookies to Express `/api/auth/sign-out` to delete server session, clears `rc_access_token` and all Better Auth cookies |
| `/api/auth/session` | `GET` | Non-strict current session check returning `{ authenticated, user }`; refreshes expired JWT when session cookie is valid; clears cookies on `USER_BLOCKED` (`403`); returns `503` if backend unavailable |
| `/api/auth/me` | `GET` | Strict current user lookup (`401` unauthenticated, `403` blocked, `503` backend unavailable, `200` authenticated) |
| `/api/auth/providers` | `GET` | Proxies Express `/api/jwt/providers` for Google OAuth availability |
| `/api/auth/google` | `POST`, `GET` | Initiates Google OAuth via Express `/api/auth/sign-in/social` (CSRF-checked on `POST`, Zod-validated callback target, forwards `better-auth.state` cookie) |
| `/api/auth/callback/[provider]` | `GET`, `POST` | Proxies Express `/api/auth/callback/google` with `redirect: "manual"`, sets cookies + exchanges JWT, clears cookies on `USER_BLOCKED`, translates `/api/auth/error` safely to `/sign-in?error=...`, enforces same-origin `Location` |
| `/api/auth/profile` | `PATCH`, `POST` | CSRF + live Express session verification, Zod `profileUpdateSchema` (strips `role`, `isBlocked`, `email`), proxies Express `/api/auth/update-user`, refreshes JWT |
| `/api/auth/error` | `GET` | Safely redirects auth error parameters to `/sign-in` |

### Cookie, JWT & Security Controls

- **Cookie handling:** Auth cookies (`rc_access_token` 15m HS256 JWT + Better Auth session cookies) are `HttpOnly`, `SameSite=Lax`, `Path=/`, with `Secure` enabled in HTTPS/production contexts. Zero tokens are stored in `localStorage` or `sessionStorage`.
- **Fail-closed JWT behavior:** Expired JWTs (`TOKEN_EXPIRED`) refresh silently only if Express validates the accompanying Better Auth session cookie; tampered or signature-invalid JWTs fail closed (`401`) without refreshing.
- **CSRF protection:** Cookie-authenticated BFF mutations (`POST`, `PATCH`) enforce `verifySameOriginCsrf()` using `Sec-Fetch-Site` and `Origin`/`Referer` allowlists.
- **Open redirect & origin protection:** `getAppOrigin()` prefers `NEXT_PUBLIC_APP_URL` and falls back to `request.url` origin, ignoring untrusted `x-forwarded-host` / `host` headers; `sanitizeRedirectPath()` rejects `//`, `\`, schemes, control characters, and auth paths.
- **Server route guards:** `src/proxy.ts` provides an optimistic cookie-presence redirect only (`/customer/*`, `/admin/*`, `/dashboard/*`); real authorization runs server-side via `requireSession()` / `requireRole()` calling Express `/api/jwt/me` (live MongoDB user, role, and `isBlocked` check). `src/app/api/admin/uploads/service-image/route.ts` uses server-verified admin session checks.

## D. Environment Variables

Never write actual secret values into `AGENTS.md`, READMEs, or client code. Keep `.env.example` synchronized in each repo.

### Frontend (`rup-chorcha/.env` & `.env.example`)

| Variable | Visibility | Purpose |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Public / Client+Server | Canonical Next.js origin (`http://localhost:3000` locally) used by `getAppOrigin()`, CSRF checks, and same-origin BFF URLs |
| `API_URL` | Server-only | Base URL of the Express backend (`http://localhost:5000` locally) used exclusively by Next.js server components and BFF handlers |
| `MONGODB_URI` | Server-only (temporary) | Direct MongoDB Atlas URI used only by legacy Steps 2–4 UI modules until migrated to Express |
| `MONGODB_DB_NAME` | Server-only (temporary) | Target database name (`rup-chorcha`) for legacy direct queries |
| `IMGBB_API_KEY` | Server-only (temporary) | ImgBB upload key used by Next.js `/api/admin/uploads/service-image` until Step 2 moves uploads to Express |

### Backend (`rup-chorcha-backend/.env` & `.env.example`)

| Variable | Visibility | Purpose |
|---|---|---|
| `PORT` | Server-only | Express listening port (`5000` locally) |
| `NODE_ENV` | Server-only | Runtime environment (`development` / `production`) driving `useSecureCookies` and error verbosity |
| `CLIENT_URL` | Server-only | Comma-separated allowed browser origins for CORS (`http://localhost:3000` locally) |
| `MONGODB_URI` | Server-only | MongoDB Atlas connection string |
| `MONGODB_DB_NAME` | Server-only | Target MongoDB database name (`rup-chorcha`) |
| `BETTER_AUTH_SECRET` | Server-only | Secret key used by Better Auth for session/state signing |
| `BETTER_AUTH_URL` | Server-only | Canonical Better Auth base URL (`http://localhost:5000` locally) |
| `JWT_SECRET` | Server-only | HS256 signing secret for Express JWT issuance & verification (`jose`) |
| `JWT_EXPIRES_IN` | Server-only | Access JWT lifetime (`15m`) |
| `JWT_ISSUER` | Server-only | Expected JWT `iss` claim (`rup-chorcha-api`) |
| `JWT_AUDIENCE` | Server-only | Expected JWT `aud` claim (`rup-chorcha-client`) |
| `GOOGLE_CLIENT_ID` | Server-only | Google OAuth client ID configured on Express Better Auth |
| `GOOGLE_CLIENT_SECRET` | Server-only | Google OAuth client secret configured on Express Better Auth |
| `ADMIN_EMAIL` | Server-only (seed) | Admin email consumed by `seed:admin` script |
| `ADMIN_PASSWORD` | Server-only (seed) | Admin password consumed by `seed:admin` script |
| `ADMIN_NAME` | Server-only (seed) | Admin display name consumed by `seed:admin` script (`RupChorcha Admin`) |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_CURRENCY` | Server-only (Phase 5) | Reserved in `.env.example` for Step 5 Stripe Checkout & webhooks |
| `IMGBB_API_KEY`, `MAX_UPLOAD_MB` | Server-only (Phase 2) | Reserved in `.env.example` for Step 2 Express ImgBB uploads |

## E. Executed Tests & Verification Results

- **Static Checks & Production Build (`rup-chorcha`):**
  - `node ./node_modules/next/dist/bin/next typegen` -> exit `0`.
  - `node ./node_modules/typescript/bin/tsc --noEmit` -> exit `0`, 0 errors.
  - `npm.cmd run lint` -> exit `0`, 0 errors (1 pre-existing unused-import warning in `src/app/(root)/page.tsx`).
  - `npm.cmd run build` -> exit `0`, 30/30 routes built plus `Proxy (Middleware)` (`src/proxy.ts`).
- **Live Frontend + Backend Integration Suite (`verify-auth-e2e.mjs full`, against Next.js `:3000` + Express `:5000`):** `10/10` scenarios passed:
  1. Express health & BFF `/api/auth/providers`.
  2. Weak password registration rejected (`400`).
  3. Customer registration (`201`) forces `role: "customer"` with `HttpOnly`, `SameSite=Lax`, `Path=/` cookies.
  4. Duplicate email registration rejected (`409`).
  5. Unauthenticated `/customer*`, `/admin*`, `/dashboard` redirect to `/sign-in?redirect=...`, and `/api/auth/me` returns `401`.
  6. Customer accesses `/customer` (`200`), survives refresh (`200`), profile `PATCH` role/block/email tampering ignored, and `/admin`, `/admin/users`, `/dashboard` redirect to `/customer`.
  7. Admin login (`200`), `/admin*` access (`200`), `/customer` redirects to `/admin`, logout clears cookies and revokes Express DB session (`401` on cookie replay).
  8. Blocked customer: live JWT immediately rejected (`403 USER_BLOCKED`), `/customer` redirects to `/sign-in?blocked=1`, blocked page renders banner, fresh login rejected (`403`).
  9. Tampered JWT fails closed (`401`, no refresh); expired JWT without session fails (`401`/redirect); expired JWT with valid session cookie refreshes transparently (`200`).
  10. Cross-origin CSRF `POST` (`Origin` mismatch / `Sec-Fetch-Site: cross-site`) rejected (`403`), Google OAuth initiation (`200`), callback forged `X-Forwarded-Host` ignored, backend `/api/auth/error` redirect translated safely to `/sign-in`.
- **Live Backend-Unavailable Test (`verify-auth-e2e.mjs backend-down`, against production `next start -p 3055` with unreachable `API_URL`):** `8/8` checks passed (clean `503` BFF responses and `BackendUnavailableError` boundary handling without crashing).
- **Not Verified Automatically:** Interactive Chrome UI click-through (`chrome_devtools` MCP unavailable) and end-to-end Google OAuth browser consent flow (requires manual browser verification with valid Google OAuth client/test account).

## F. Development Roadmap

1. [x] **Step 1 — Express Foundation, DB Indexes, Better Auth/JWT & Same-Origin Next.js Auth BFF (`Part A` `0b2c6eb`, `Part B` `5a961b2`, `Part C Stage 1`)**
2. [ ] **Step 2 — Services APIs & Public Pages** *(Next Recommended Task)*: Implement Express `/api/services*`, `/api/admin/services*`, and `/api/admin/uploads/service-image`; update `/` with >=6 live active services, `/services` search/category/price sort/pagination/`loading.tsx`, clickable categories, Footer fixes, and `/sign-in` / `/sign-up` shared layout polish.
3. [ ] **Step 3 — Protected Service Details (`/services/[id]`) & Appointment Booking System**: Implement Express service availability and `POST /api/appointments` / `/api/appointments/my*` APIs + `/services/[id]` customer booking flow.
4. [ ] **Step 4 — Express Dashboard, Admin & Profile APIs + Frontend Migration**: Implement Express `/api/dashboard/*`, `/api/admin/appointments*`, `/api/admin/users*`, `/api/profile`, `/api/uploads/profile-image`, and migrate remaining client direct-MongoDB queries/actions (`src/lib/db.ts`, `services.ts`, `appointments.ts`, `admin.ts`) to Express + `/api/backend/*` BFF.
5. [ ] **Step 5 — Stripe Checkout, Verified Webhook & Payment Pages**: Implement Stripe Checkout, idempotent raw-body webhook, transaction APIs, `/payment/success`, and `/payment/cancel`.
6. [ ] **Step 6 — Error Boundaries, Polish, Security & Manual QA**: Add `src/app/not-found.tsx`, missing loading skeletons, clean ESLint warnings/unused assets, and run full manual responsive/accessibility/security QA.
7. [ ] **Step 7 — Documentation, Commit Targets & Production Deployment**: Complete both `README.md` files, verify >=20 client & >=12 server commits, deploy client (Vercel) and backend (Render/Railway), configure production Stripe/OAuth, and verify live refresh/reload.

## G. Development Rules & Lessons Learned

- **Preserve all permanent RupChorcha rules:** Never alter existing UI design system tokens, never store secrets in client files or `.env.example`, never trust client-supplied `role`, `isBlocked`, or redirect hosts, and maintain strict separation between `rup-chorcha` and `rup-chorcha-backend`.
- **Zod v4 ordering trap:** In Zod v4, call `.optional()` *after* `.nullable()` / `z.union([..., z.null()])` rather than before, so optional empty/null fields validate consistently.
- **Better Auth OAuth error translation:** Express Better Auth callback errors redirect to backend `/api/auth/error`; always intercept redirects manually in the Next.js callback BFF (`redirect: "manual"`) and map error query parameters safely onto same-origin `/sign-in?error=...`.
- **Next.js 16 conventions verified here:** Use `src/proxy.ts` (`proxy` export, not `middleware.ts`), handle async `cookies()`/`headers()`/`params`, and use `{ error, retry }` in Client Component `error.tsx` files.
- **Windows / Sandbox verification rules:** Run `node ./node_modules/typescript/bin/tsc --noEmit` and `npm.cmd run lint` instead of `npx` under restricted PowerShell policy, and run `npm.cmd run build` outside the network sandbox when `next/font/google` fetches fonts.

