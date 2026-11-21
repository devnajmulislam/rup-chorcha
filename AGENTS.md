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

#### Backend (Step 2A — Completed)

- [x] Add service validation schemas (`modules/services/services.validation.js`).
- [x] Add the ImgBB upload utility with MIME, magic-byte, and size validation (`lib/imgbb.js`, `middleware/upload.js`).
- [x] Add the admin service image upload endpoint (`POST /api/admin/uploads/service-image`).
- [x] Add service create, read, update, delete/deactivate, and status APIs (`/api/admin/services*`).
- [x] Add public service list with search, category filter, price sorting, and pagination (`GET /api/services`).
- [x] Add public service detail with active-only enforcement (`GET /api/services/:id`).
- [x] Add compound `services` indexes for search, filter, and sort (`db/indexes.js`).
- [x] Test upload, validation, inactive filtering, and invalid IDs (`npm test`: 8/8 passed + live ImgBB upload verified).
- [x] Acceptance: public APIs never expose inactive services; only admins can mutate services.
- [x] Commit: `449a45c` (`feat(server): add public and admin services APIs with ImgBB upload infrastructure`) & `ede3cc1` (`docs(server): add backend AGENTS.md and update README for Step 2A services APIs`).

#### Client (Step 2B & Step 3 — Completed)

- [x] Build the shared service card (`ServiceCard`), resilient image (`ServiceImage`), skeleton (`ServiceGridSkeleton`), and status badge components.
- [x] Update the home page hero CTA, live featured services (`FeaturedServicesSection`), interactive category links, and Footer navigation links.
- [x] Build the Browse Services page (`/services`, isolated under `src/app/services/(list)/`) connected to Express `GET /api/services` with debounced search, category filter, price/name/date sort, pagination (`12`/page), `loading.tsx`, empty/error states, and URL query sync.
- [x] Build the protected service details page (`/services/[id]` with `layout.tsx`, `loading.tsx`, `not-found.tsx`, `error.tsx`, invalid ID handling, and inactive/404 hiding) *(Step 3, commit `4f327dd`)*.
- [x] Show the booking option only for customers; admins see a clear policy notice that admins cannot book *(Step 3, commit `4f327dd`)*.
- [~] Test responsive layouts, loading, empty state, and search behavior (`6/6` Step 2B E2E, `2/2` backend-down SSR, and `5/5` Step 3 E2E passed; interactive Chrome responsive click-through blocked by unavailable `chrome_devtools` MCP `DevToolsActivePort`).
- [x] Acceptance (Step 2B): only active Express services appear publicly on `/` and `/services`; search/filter/sort/pagination work together via URL query state.
- [x] Commit: `4eefb87` (`feat(client): integrate Express services API on homepage and Browse Services`) & `4f327dd` (`feat(client): add protected service details page and customer appointment booking flow`).

### Phase 3 — Appointments and customer dashboard

#### Backend (Step 3 — Completed, commit `fc3b1d8`; Dashboard completed in Step 4A, commit `7405266`)

- [x] Add appointment validation (`modules/appointments/appointments.validation.js`) and the per-customer duplicate index (`uniq_appointments_customer_active_slot` in `db/indexes.js`).
- [x] Add the booking API (`POST /api/appointments`) with active-service check, `Asia/Dhaka` date/slot validation (`09:00`–`18:00`, `90`-day limit), server `servicePrice` snapshot, `pending` status, and `unpaid` paymentStatus.
- [x] Add the availability endpoint for the customer's booked slots and elapsed same-day slots (`GET /api/services/:id/availability?date=`).
- [x] Add customer appointment list, detail, and pending cancel APIs (`GET /api/appointments/my`, `GET /api/appointments/my/:id`, `PATCH /api/appointments/my/:id/cancel`).
- [x] Add the customer dashboard stats API (`GET /api/dashboard/customer` — Step 4A, commit `7405266`).
- [x] Test duplicate slot conflicts, overlapping cross-service conflicts, inactive services, past dates, payload spoofing, ownership, cancel/rebook rules, and customer dashboard aggregations (`npm test`: `20/20` passed across `4` suites).
- [x] Acceptance: duplicate active slots for the same customer return 409; different customers can use the same slot; customers cannot see or modify others' appointments.
- [x] Commit: `fc3b1d8` (`feat(server): add customer appointment booking, availability, and ownership APIs`).

#### Client (Step 3 Booking Flow Completed; Customer Dashboard Migration Pending Step 4B)

- [x] Build `/services/[id]`, BFF availability/booking proxy (`/api/backend/services/[id]/availability`, `/api/backend/appointments`), and the booking form (`AppointmentBookingForm`) with Base UI calendar popover, `Asia/Dhaka` time slots, booked/past slot badges, and optional 500-char notes.
- [x] Add booking confirmation panel, inline `409 DUPLICATE_APPOINTMENT_SLOT` conflict handling, toast feedback, and `401`/`403 USER_BLOCKED` redirect handling.
- [ ] Migrate the customer dashboard layout, overview stats, My Appointments list/detail/cancel actions off direct MongoDB to Express APIs *(Step 4B)*.
- [~] Test booking lifecycle, conflict recovery, blocked-user rejection, loading, and error/not-found states (`5/5` Step 3 E2E passed; live Chrome mobile viewport QA pending manual check due to unavailable `chrome_devtools` MCP).
- [x] Acceptance (Step 3): customer can book an active service with server price snapshot; same-customer duplicate slots return 409; different customers can book the same slot; admin/blocked users cannot book.
- [x] Commit: `4f327dd` (`feat(client): add protected service details page and customer appointment booking flow`).

### Phase 4 — Admin management

#### Backend (Step 4A — Completed, commit `7405266`)

- [x] Add admin appointment list, filter/search/pagination, detail, confirm, cancel, and status update APIs (`/api/admin/appointments*`).
- [x] Add admin customer list, search/filter/pagination, detail, and session-revoking block/unblock APIs (`/api/admin/users*`).
- [x] Add admin dashboard stats & live transaction revenue aggregation (`GET /api/dashboard/admin`).
- [x] Add profile get, strict PATCH update, and ImgBB upload APIs (`GET /api/profile`, `PATCH /api/profile`, `POST /api/uploads/profile-image`).
- [x] Test every role, status transition, session revocation, protected field tampering, and upload failure (`tests/dashboard-admin-profile.test.js`: `20/20` passed across `4` suites + live ImgBB upload smoke test).
- [x] Acceptance: only pending appointments can be confirmed; admins cannot block admins; profile cannot change role, email, or blocked status.
- [x] Commit: `7405266` (`feat(server): add customer/admin dashboard, admin appointment/user management, and profile APIs`).

#### Client (Pending Step 4B Migration off Direct MongoDB / ImgBB)

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

### Client — target 20+, current 14 (15 with Step 4A docs)

- [x] Theme, fonts, providers, toaster
- [x] Public layout, navbar, footer (Footer route links updated to `/`, `/services`, `/#categories`, `/#why`)
- [x] Home hero and featured services (live Express active services via `FeaturedServicesSection`; `demoServices` removed)
- [x] Home categories and extra section (all 7 category cards link to `/services?category=...`)
- [x] Shared service card, resilient `ServiceImage`, skeletons, and status badges (`ServiceCard` links to `/services/[id]` with `prefetch={false}`)
- [x] Browse search, filter, sort, and pagination (`/services` isolated under `src/app/services/(list)/`, connected to Express `GET /api/services` with URL sync)
- [x] Service details page (`/services/[id]` with `layout.tsx`, `loading.tsx`, `not-found.tsx`, `error.tsx`, admin policy notice, invalid/inactive checks)
- [x] Booking form and dialog (`AppointmentBookingForm` with calendar popover, `Asia/Dhaka` slot selector, notes counter, BFF routes `/api/backend/*`, and confirmation panel)
- [x] Auth client, BFF routes, and sign-up
- [x] Sign-in and Google OAuth BFF initiation/callback
- [x] Route guards (`src/proxy.ts`, `src/lib/session.ts`) and role redirects
- [~] Customer dashboard layout and overview (auth/BFF wired; data queries migrate in Step 4)
- [~] Customer appointments list and detail (backend `/api/appointments/my*` complete in Step 3A; dashboard UI migrates in Step 4)
- [~] Customer cancel flow (backend `PATCH /api/appointments/my/:id/cancel` complete in Step 3A; dashboard UI migrates in Step 4)
- [ ] Pay Now and checkout redirect
- [ ] Payment success and cancel pages
- [ ] Customer payment history
- [~] Profile management (auth BFF `/api/auth/profile` wired; ImgBB profile upload in Step 4)
- [~] Admin dashboard layout and overview (auth/BFF wired; data queries migrate in Step 4)
- [~] Admin services table (migrates in Step 4)
- [~] Add/edit service and image upload (migrates in Step 4; Express API ready in Step 2A)
- [~] Admin appointment management (migrates in Step 4)
- [~] Admin user management (migrates in Step 4)
- [~] Admin transactions (migrates in Step 5)
- [ ] Responsive, loading, error, and empty-state polish
- [ ] README and env example (frontend `.env.example` synchronized; `README.md` pending Step 7)

### Server — target 12+, current 11 (commits `7e52bfc` .. Step 4A docs)

- [x] Express foundation, env, health, error handling
- [x] MongoDB connection, collections, and indexes
- [x] Better Auth configuration
- [x] Admin seed script
- [x] JWT, role, and blocked-user middleware
- [x] ImgBB uploads (shared service & profile image upload pipelines)
- [x] Service CRUD APIs
- [x] Public service search, filter, and sort
- [x] Appointment booking and availability (`GET /api/services/:id/availability`, `POST /api/appointments`)
- [x] Customer appointment APIs (`GET /api/appointments/my`, `GET /api/appointments/my/:id`, `PATCH /api/appointments/my/:id/cancel`)
- [x] Admin appointment APIs (`/api/admin/appointments*`: list/filter/search/paginate, detail, confirm, cancel, status)
- [x] Dashboard statistics APIs (`GET /api/dashboard/customer`, `GET /api/dashboard/admin`)
- [x] User management APIs (`/api/admin/users*`: customer directory, search/filter/paginate, detail, session-revoking block/unblock)
- [x] Profile APIs (`GET /api/profile`, `PATCH /api/profile`, `POST /api/uploads/profile-image`)
- [ ] Stripe checkout API
- [ ] Stripe webhook and transactions
- [ ] Customer/admin transaction APIs
- [x] Validation, rate limiting, CORS, and security hardening (ongoing review in Step 6)
- [~] README and env example (`.env.example` synchronized; backend `README.md` updated through Step 4A; final deployment links pending Step 7)

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
- [x] Blocked user cannot use protected APIs (verified live DB `isBlocked` check on `/api/jwt/me`, `/api/auth/me`, `/api/auth/session`, `/customer`, `/services/[id]`, `/api/backend/appointments`, `/api/dashboard/customer`, `/api/profile`, and `/api/uploads/profile-image`).
- [x] Admin cannot be created from public registration (verified injected `role: "admin"` forced to `"customer"`).
- [x] Session survives page refresh (verified repeated SSR requests with HttpOnly cookies).
- [~] Sign-out clears the session and updates the navbar (`POST /api/auth/logout` verified clearing cookies + invalidating Express Better Auth DB session; live Chrome UI visual check pending manual verification).

### Services

- [x] Admin can add a service with an image (backend API verified via `POST /api/admin/services` + live ImgBB upload; admin dashboard UI wires to Express in Step 4B).
- [x] Admin can update and deactivate a service (backend API verified; admin UI migration pending Step 4B).
- [x] Admin can delete an unreferenced service (backend API verified; admin UI migration pending Step 4B).
- [x] Invalid price and duration are rejected (backend Zod `.strict()` verified).
- [x] Public pages show active services only (verified on live `/` and `/services`).
- [x] Search by name works (verified via live `/services?search=...`).
- [x] Category filter works (verified via live `/services?category=...` + homepage category links + invalid category fallback).
- [x] Price sorting works in both directions (verified via live `/services?sort=price_asc` & `price_desc`).
- [x] Invalid service ID shows a proper error (verified `400 INVALID_SERVICE_ID` on Express and `"Invalid service ID"` UI on `/services/[id]`).
- [x] Inactive service cannot be booked (verified hidden via `404` on `GET /api/services/:id`, `GET /api/services/:id/availability`, `POST /api/appointments`, and streamed not-found UI on `/services/[id]`).

### Appointments

- [x] Customer can submit a booking (verified via `POST /api/backend/appointments` -> Express `POST /api/appointments` -> `201`).
- [x] Appointment defaults to pending and unpaid (verified `status: "pending"`, `paymentStatus: "unpaid"`, and server-derived `servicePrice` snapshot).
- [x] Same customer cannot duplicate an active date and time slot (verified pre-check + concurrent cross-service race hitting `uniq_appointments_customer_active_slot` -> `409 DUPLICATE_APPOINTMENT_SLOT`).
- [x] Different customers can book the same slot (verified Customer B booking the exact same service/date/slot -> `201`).
- [x] Customer sees only their own appointments (verified in `tests/appointments.test.js` & `tests/dashboard-admin-profile.test.js` `GET /api/appointments/my`, `GET /api/dashboard/customer`, and `403 FORBIDDEN` on cross-customer `/my/:id`).
- [x] Customer can cancel only pending appointments (verified in `tests/appointments.test.js`, freeing the slot for rebooking).
- [x] Customer cannot cancel confirmed or cancelled appointments (verified `409 INVALID_STATUS_TRANSITION` in `tests/appointments.test.js`).
- [x] Admin can confirm only pending appointments *(backend API verified via `PATCH /api/admin/appointments/:id/confirm` & `/status`; UI migration in Step 4B)*.
- [x] Admin can cancel pending and confirmed appointments *(backend API verified preserving `paymentStatus` history; UI migration in Step 4B)*.
- [x] Admin sees customer, service, message, price, status, payment status, and request date *(backend `/api/admin/appointments*` verified; UI migration in Step 4B)*.
- [x] Blocked customer cannot book (verified `307 /sign-in?blocked=1` on `/services/[id]` and `403 USER_BLOCKED` on `POST /api/backend/appointments` + Express).

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
- [x] No browser `alert()` is used (verified across auth, public services, and Step 3 booking components).
- [~] Toasts appear for success and failure (Toast hooks wired for sign-in/up/out and `AppointmentBookingForm`; interactive Chrome visual confirmation pending manual check).
- [~] Loading states appear during fetch, booking, and payment (blush `loading.tsx` skeletons and in-flight disabled buttons implemented; payment loading deferred to Step 5).
- [x] Error, not-found, and empty states are visible (verified across `/`, `/services`, and `/services/[id]`).
- [x] Private routes work after refresh (verified via HttpOnly cookies + SSR checks on `/customer`, `/admin`, and `/services/[id]`).
- [ ] Production routes do not 404 or 504.
- [ ] Stripe webhook works on the live site.
- [ ] Admin credentials work on the live site.
- [ ] No `.env` file or secret is committed.
- [~] Both READMEs are complete (backend `README.md` updated through Step 4A; client `README.md` & deployment links pending Step 7).
- [ ] Client commit count is at least 20.
- [ ] Server commit count is at least 12.

---

## 14. Security checklist

- [x] All secrets are in environment variables.
- [x] `.env` files are gitignored in both repositories.
- [x] `role` and `isBlocked` are server-controlled and cannot be changed by clients.
- [~] Every protected API verifies JWT, role, blocked status, and ownership (verified on `/api/jwt/*`, `/api/admin/services*`, `/api/services/:id/availability`, `/api/appointments*`, `/api/dashboard/*`, `/api/admin/appointments*`, `/api/admin/users*`, `/api/profile`, `/api/uploads/profile-image`, and `/api/backend/*`; Stripe/transaction routes pending Step 5).
- [x] Admin endpoints reject customers (verified on `/admin*`, `/api/jwt/admin-check`, `/api/dashboard/admin`, `/api/admin/services*`, `/api/admin/uploads/service-image`, `/api/admin/appointments*`, and `/api/admin/users*`).
- [x] Customer endpoints reject admins where required (verified `403 FORBIDDEN` on `/api/jwt/customer-check`, `/api/services/:id/availability`, `/api/appointments*`, `/api/dashboard/customer`, and `/api/backend/appointments`).
- [x] Service price and appointment price are server-derived, never trusted from the client (`POST /api/appointments` rejects client `servicePrice` via `.strict()` and copies `service.price` server-side; admin appointment updates use `.strict()` schemas rejecting `servicePrice` and `paymentStatus`).
- [ ] Payment status is set only by the verified Stripe webhook.
- [ ] Stripe webhook uses a raw body and signature verification.
- [ ] Webhook handling is idempotent.
- [x] File uploads validate MIME type and size (verified on Express `lib/imgbb.js` + `middleware/upload.js` magic bytes & `5 MB` cap for both service and profile image uploads).
- [x] Search input is escaped and length-limited (`escapeRegex()`, max `100` chars across services, admin appointments, and admin users).
- [x] Request bodies are validated and do not pass raw objects into MongoDB queries (`.strict()` Zod schemas + explicit allowlisted field projections).
- [~] Auth, checkout, and upload routes are rate-limited (`/api`, `/api/auth`, `/api/admin/uploads/service-image`, and `/api/uploads/profile-image` rate-limited on Express; Stripe checkout limiter pending Step 5).
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

> Last updated: 2026-11-21 (Step 1–3 complete; **Step 4A: Express Dashboard, Admin & Profile APIs** completed in `rup-chorcha-backend` `7405266`; **Step 4B: Frontend Dashboard, Admin & Profile Migration** is next).
>
> Checkbox legend:
> - `[x]` Completed and verified
> - `[ ]` Not completed
> - `[~]` Partially completed
> - `[?]` Needs manual verification

## A. Completed Work

### Step 1 — Backend Part A (`0b2c6eb`), Part B (`5a961b2`) & Client Part C Stage 1 (`8e713d8`)

- [x] Express 5 ESM foundation, MongoDB Atlas connection & index bootstrap, Helmet/CORS/rate limiting, Better Auth + `@better-auth/mongo-adapter`, `jose` HS256 JWT bridge (`/api/jwt/*`), `requireAuth`/`requireNotBlocked`/`requireRole`, and `seed:admin`.
- [x] Next.js same-origin auth BFF (`/api/auth/*`: `register`, `login`, `logout`, `session`, `me`, `providers`, `google`, `callback/[provider]`, `profile`, `error`), Zod v4 validation, `src/proxy.ts` + server route guards (`getServerSession`, `requireSession`, `requireRole`), CSRF protection, open-redirect sanitation, and `AuthSessionProvider`.

### Step 2A — Express Services APIs & ImgBB Image Upload Infrastructure (`rup-chorcha-backend`, commits `449a45c`, `ede3cc1`, `1bf7ec6`)

- [x] Public Services API (`GET /api/services`, `GET /api/services/:id`), Admin Services API (`/api/admin/services*`), and ImgBB Service Image Upload (`POST /api/admin/uploads/service-image`) with `.strict()` Zod validation, magic-byte checks, compound `services` indexes, and `IMGBB_API_KEY` kept server-only.

### Step 2B — Frontend Services & Public Pages Integration (`rup-chorcha`, commits `4eefb87`, `8e209c8`)

- [x] Integrated homepage (`/`), category navigation, and Browse Services (`/services` isolated under `src/app/services/(list)/`) with live Express active services, debounced search, category filters, price/name/date sorting, pagination, and resilient loading/empty/error states.

### Step 3 — Protected Service Details (`/services/[id]`) & Appointment Booking System (`rup-chorcha-backend` `fc3b1d8` / `ef10f2b`; `rup-chorcha` `4f327dd` / `c5c69f0`)

- [x] Express customer booking & availability APIs (`GET /api/services/:id/availability`, `POST /api/appointments`, `GET /api/appointments/my`, `GET /api/appointments/my/:id`, `PATCH /api/appointments/my/:id/cancel`) + Next.js `/services/[id]` page, `AppointmentBookingForm`, and `/api/backend/*` booking BFF routes.

### Step 4A — Express Dashboard, Admin & Profile APIs (`rup-chorcha-backend`, commit `7405266`)

- [x] **Customer & Admin Dashboards (`modules/dashboard/*`, `routes/dashboard.routes.js`):**
  - `GET /api/dashboard/customer` (`...protect("customer")`): strictly scoped to `req.user.id`, returning safe profile, `$group` booking/payment counters, future `Asia/Dhaka` upcoming appointments, and recent 5 items.
  - `GET /api/dashboard/admin` (`...protect("admin")`): parallel aggregations for customers (`active`/`blocked`), services (`active`/`inactive`), appointments, transactions (`totalRevenueCents`, `successfulPayments`, `failedPayments`, explicit `hasRecordedTransactions` flag), and recent 5 hydrated appointments.
- [x] **Admin Appointments Management (`modules/appointments/*`, `routes/admin.appointments.routes.js`):**
  - `GET /api/admin/appointments` (status, `paymentStatus`, `date`, regex-escaped `search`, `$facet` pagination + `meta.counts`), `GET /api/admin/appointments/:id`, `PATCH /api/admin/appointments/:id/confirm`, `PATCH /api/admin/appointments/:id/cancel` (preserves `paymentStatus` history), and `PATCH /api/admin/appointments/:id/status` (`.strict()` schema blocking invalid status transitions or price/customer/service tampering).
- [x] **Admin User Management (`modules/users/*`, `routes/admin.users.routes.js`):**
  - `GET /api/admin/users`, `GET /api/admin/users/:id`, `PATCH /api/admin/users/:id/block`, `PATCH /api/admin/users/:id/unblock`: strictly customer-only (`403 CANNOT_BLOCK_ADMIN` on admin/self), excludes sensitive fields (`password`, `token`, `_id`), revokes Better Auth `session` docs across `ObjectId`/`string` IDs on block, and enforces `USER_BLOCKED` on protected routes.
- [x] **Profile & Profile Image Upload (`modules/profile/*`, `routes/profile.routes.js`, `routes/uploads.routes.js`):**
  - `GET /api/profile` & `PATCH /api/profile` (`.strict()` `{ name?, phone?, image? }`), and `POST /api/uploads/profile-image` reusing `lib/imgbb.js` & `middleware/upload.js` to persist hosted ImgBB URLs solely on `req.user.id`.
- [x] **Verification:** `node --check` passed on all backend `.js` files; `npm.cmd test` passed **20/20 across 4 suites** (`tests/dashboard-admin-profile.test.js` + existing suites); live ImgBB `POST /api/uploads/profile-image` smoke test passed (`200 OK`, `https://i.ibb.co/W4sYxgLq/stage4a-profile-1795248691995.png`).

## B. Current Project Status

### Implemented Functionality

- **Backend (`rup-chorcha-backend`, latest code commit `7405266`, 11 commits after Step 4A docs):** Auth, services, ImgBB service/profile uploads, customer appointments & availability, customer/admin dashboards, admin appointment & user management, and profile APIs are complete and tested.
- **Frontend (`rup-chorcha`, `14` code/docs commits + Step 4A docs update):** Same-origin auth BFF, server route guards, public `/`, `/services`, protected `/services/[id]`, and `/api/backend/*` booking/availability BFF routes are complete. Existing dashboard UI remains preserved without regression during Step 4A.

### Frontend Migration Findings for Step 4B (`rup-chorcha` -> Express API)

- **Customer dashboard direct-MongoDB dependencies (`src/lib/appointments.ts` -> `src/lib/db.ts`):**
  - `src/app/(dashboard)/customer/page.tsx` (`getCustomerAppointments`, `getAppointmentStats`)
  - `src/app/(dashboard)/customer/appointments/page.tsx` (`getCustomerAppointments`, `getCustomerTransactions`)
  - `src/app/(dashboard)/customer/appointments/actions.ts` (`cancelPendingAppointment`)
  - `src/components/dashboard/AppointmentCard.tsx` & `CustomerAppointmentsView.tsx`
- **Admin dashboard direct-MongoDB & direct-ImgBB dependencies (`src/lib/admin.ts`, `src/lib/services.ts`, `src/app/api/admin/uploads/service-image/route.ts`):**
  - `src/app/(dashboard)/admin/page.tsx` (`getAdminOverview`)
  - `src/app/(dashboard)/admin/services/{page.tsx,actions.ts,new/page.tsx,update/page.tsx,update/[id]/page.tsx}` + `ServiceForm.tsx` / `AdminServices.tsx`
  - `src/app/(dashboard)/admin/appointments/{page.tsx,actions.ts}` + `AdminAppointments.tsx`
  - `src/app/(dashboard)/admin/users/{page.tsx,actions.ts}` + `AdminUsers.tsx`
  - `src/app/api/admin/uploads/service-image/route.ts`: lines `94–143` call `https://api.imgbb.com/1/upload` directly with `process.env.IMGBB_API_KEY`; its `API_URL` fallback (`lines 147–198`) lacks Bearer JWT forwarding.
  - `src/app/(dashboard)/admin/transactions/page.tsx` & customer `getCustomerTransactions` remain pending **Step 5** Stripe/transactions APIs.
- **Profile pages & component (`src/app/(dashboard)/{customer,admin}/profile/page.tsx`, `src/components/dashboard/ProfileForm.tsx`, `src/app/api/auth/profile/route.ts`):**
  - Currently read SSR session user and post to Better Auth `/api/auth/update-user` without file upload. Step 4B should switch profile reads/updates to Express `GET`/`PATCH /api/profile` (keeping session/JWT cookies synced) and wire profile image file upload via BFF -> Express `POST /api/uploads/profile-image`.
- **Required Step 4B Frontend BFF / Server Client Integrations (keeping existing UI intact):**
  - Shared server/BFF authenticated Express client helper (forwarding verified Bearer JWT + auto-refresh via `resolveBffSession` / `requireRole`).
  - Browser BFF routes `/api/backend/profile`, `/api/backend/uploads/profile-image`, `/api/backend/admin/uploads/service-image`, `/api/backend/appointments/[id]/cancel` (or equivalent Express-backed Server Actions), `/api/backend/admin/services*`, `/api/backend/admin/appointments*`, and `/api/backend/admin/users*`.
- **Defer to Step 5:** Stripe Checkout (`POST /api/payments/checkout`), webhook, `/api/payments/session/:id`, `/api/transactions/*`, `/payment/success`, and `/payment/cancel`.

### Known Issues & Limitations

- **Chrome DevTools MCP Unavailable for Live Visual QA:** `chrome_devtools` MCP could not connect (`ENOENT` on `DevToolsActivePort`).
- **Temporary Direct Env Vars in `rup-chorcha`:** `MONGODB_URI`, `MONGODB_DB_NAME`, and `IMGBB_API_KEY` remain temporarily on the Next.js server until Step 4B & Step 5 complete dashboard & transaction migration.
- **Paid Appointment Cancellation:** Admin cancellation of a paid confirmed appointment preserves `paymentStatus: "paid"` in MongoDB without automatic Stripe refunds.

## C. Architecture (Step 4A Backend APIs Added)

- Express `/api/dashboard/customer`, `/api/dashboard/admin`, `/api/admin/appointments*`, `/api/admin/users*`, `/api/profile`, and `/api/uploads/profile-image` run `requireAuth` (JWT signature + live MongoDB user lookup) -> `requireNotBlocked` -> `requireRole` (where role-restricted) -> strict Zod validation -> MongoDB aggregation/update -> standard `{ success, data, meta }` JSON responses.

## D. Environment Variables

Same env schema as Step 3 (`rup-chorcha-backend` uses `IMGBB_API_KEY`, `MAX_UPLOAD_MB`, `UPLOAD_RATE_LIMIT_*`, `MONGODB_URI`, `JWT_*`, `BETTER_AUTH_*`; zero secrets in docs). Step 4B will remove `IMGBB_API_KEY` dependency from `rup-chorcha`.

## E. Executed Tests & Verification Results (Step 4A Backend)

- **Backend Syntax Check:** `node --check` exited `0` across all `.js` files in `rup-chorcha-backend`.
- **Backend Automated Test Suite (`npm.cmd test` -> `node --test tests/*.test.js`):** **20/20 passed across 4 suites, 0 failed, 0 skipped** (MongoDB Atlas + ephemeral Express server; `"Jhanker makeup"` `6b008bfdeda8c9a56f80bc57` untouched; temporary test records cleaned).
- **Live ImgBB Profile Image Upload (`verify-step4a-live-imgbb.mjs`):** `POST /api/uploads/profile-image` -> `200 OK`, returned `https://i.ibb.co/W4sYxgLq/stage4a-profile-1795248691995.png`, persisted on temp customer, fetched `200 image/png`, temp user cleaned.
- **No frontend files modified in Step 4A** (frontend build/lint unchanged from Step 3 verified commit `c5c69f0`).

## F. Development Roadmap

1. [x] **Step 1 — Express Foundation, DB Indexes, Better Auth/JWT & Same-Origin Next.js Auth BFF (`Part A` `0b2c6eb`, `Part B` `5a961b2`, `Part C Stage 1` `8e713d8`)**
2. [x] **Step 2 — Services APIs & Public Pages (`Step 2A` `449a45c` / `ede3cc1` / `1bf7ec6`, `Step 2B` `4eefb87` / `8e209c8`)**
3. [x] **Step 3 — Protected Service Details (`/services/[id]`) & Appointment Booking System (`rup-chorcha-backend` `fc3b1d8` / `ef10f2b`; `rup-chorcha` `4f327dd` / `c5c69f0`)**
4. [~] **Step 4 — Express Dashboard, Admin & Profile APIs + Frontend Migration:**
   - [x] **Step 4A (Backend `7405266`)**: Express `/api/dashboard/*`, `/api/admin/appointments*`, `/api/admin/users*`, `/api/profile`, and `/api/uploads/profile-image` complete & verified (`20/20`).
   - [ ] **Step 4B (Frontend Migration)** *(Next Recommended Task)*: Replace direct MongoDB (`src/lib/{db,admin,appointments,services}.ts`) and direct Next.js ImgBB (`src/app/api/admin/uploads/service-image/route.ts`, `IMGBB_API_KEY`) usage across Customer/Admin dashboard pages, Server Actions, and `ProfileForm` (with profile image file upload) using Express + Next.js BFF calls, preserving existing UI and deferring transaction history/Stripe to Step 5.
5. [ ] **Step 5 — Stripe Checkout, Verified Webhook & Payment Pages**: Implement Stripe Checkout, idempotent raw-body webhook, transaction APIs, `/payment/success`, and `/payment/cancel`.
6. [ ] **Step 6 — Error Boundaries, Polish, Security & Manual QA**: Add `src/app/not-found.tsx`, remaining loading skeletons, responsive/accessibility/security verification, and clean unused assets.
7. [ ] **Step 7 — Documentation, Commit Targets & Production Deployment**: Complete both `README.md` files, satisfy >=20 client & >=12 server commits, deploy client (Vercel) and backend (Render/Railway), configure production Stripe/OAuth, and verify live refresh/reload.

## G. Development Rules & Lessons Learned

- **Better Auth vs. Seeded User ID Lookup Compatibility:** Better Auth `user` docs may omit the string `id` field (relying on `_id`), while seeded docs and `session.userId` can use either `ObjectId` or string IDs. `buildUserCandidateIds(doc, rawId)` and dual `$toString: "$_id"` / `$id` `$lookup` pipelines ensure reliable admin lookups and immediate session revocation across both formats.
- **Reusing Upload Validation Across Service & Profile Endpoints:** Keeping `lib/imgbb.js` + `middleware/upload.js` as a single parameterized pipeline prevents duplicated Multer/magic-byte logic while guaranteeing identical security limits and secret isolation.
- **Windows / Sandbox verification rules:** Run `node --check` locally; run `npm.cmd test`, ImgBB upload verification, and Git commits with network/workspace lock permissions enabled.


