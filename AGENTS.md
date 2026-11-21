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

#### Client (Step 3 Booking Flow & Step 4B Customer Dashboard Migration — Completed)

- [x] Build `/services/[id]`, BFF availability/booking proxy (`/api/backend/services/[id]/availability`, `/api/backend/appointments`), and the booking form (`AppointmentBookingForm`) with Base UI calendar popover, `Asia/Dhaka` time slots, booked/past slot badges, and optional 500-char notes.
- [x] Add booking confirmation panel, inline `409 DUPLICATE_APPOINTMENT_SLOT` conflict handling, toast feedback, and `401`/`403 USER_BLOCKED` redirect handling.
- [x] Migrate the customer dashboard overview (`/customer`), My Appointments list/status filters/pagination (`/customer/appointments`), appointment details dialog, pending cancel BFF (`/api/backend/appointments/[id]/cancel`), and `/customer/profile` (with live ImgBB photo upload `/api/backend/uploads/profile-image`) off direct MongoDB to Express APIs *(Step 4B; Customer Payments tab & Pay Now pre-check isolated in `src/lib/transactions-legacy.ts` until Step 5)*.
- [~] Test booking lifecycle, conflict recovery, blocked-user rejection, loading, and error/not-found states (`5/5` Step 3 E2E & `12/12` Step 4B live E2E passed; live Chrome interactive UI QA remains pending manual check).
- [x] Acceptance (Step 3 & Step 4B): customer can book an active service with server price snapshot; same-customer duplicate slots return 409; different customers can book the same slot; customer dashboard/appointments/profile run solely on Express APIs with `MONGODB_URI=""` & `IMGBB_API_KEY=""`.
- [x] Commit: `4f327dd` (`feat(client): add protected service details page and customer appointment booking flow`) & Step 4B migration commit.

### Phase 4 — Admin management

#### Backend (Step 4A — Completed, commit `7405266`)

- [x] Add admin appointment list, filter/search/pagination, detail, confirm, cancel, and status update APIs (`/api/admin/appointments*`).
- [x] Add admin customer list, search/filter/pagination, detail, and session-revoking block/unblock APIs (`/api/admin/users*`).
- [x] Add admin dashboard stats & live transaction revenue aggregation (`GET /api/dashboard/admin`).
- [x] Add profile get, strict PATCH update, and ImgBB upload APIs (`GET /api/profile`, `PATCH /api/profile`, `POST /api/uploads/profile-image`).
- [x] Test every role, status transition, session revocation, protected field tampering, and upload failure (`tests/dashboard-admin-profile.test.js`: `20/20` passed across `4` suites + live ImgBB upload smoke test).
- [x] Acceptance: only pending appointments can be confirmed; admins cannot block admins; profile cannot change role, email, or blocked status.
- [x] Commit: `7405266` (`feat(server): add customer/admin dashboard, admin appointment/user management, and profile APIs`).

#### Client (Step 4B — Completed)

- [x] Build/migrate the admin dashboard layout (`/admin/layout.tsx`) and Express-backed overview (`/admin`).
- [x] Migrate Manage Services (`/admin/services`) with Express search, category/status filters, sorting, pagination, status toggle, edit, and delete (`DELETE` hard-delete or auto-deactivate).
- [x] Migrate Add Service (`/admin/services/new`), Update Service (`/admin/services/update`, `/admin/services/update/[id]`), and `POST /api/admin/uploads/service-image` proxy onto Express (`IMGBB_API_KEY` removed from Next.js code and `.env.example`).
- [x] Migrate Manage Appointments (`/admin/appointments`) with Express filters, search, pagination, live detail BFF (`/api/backend/admin/appointments/[id]`), confirm, and cancel.
- [x] Migrate Manage Users (`/admin/users`) with Express search/status/pagination, live detail BFF (`/api/backend/admin/users/[id]`), and customer block/unblock.
- [x] Migrate `/customer/profile` and `/admin/profile` onto Express `GET`/`PATCH /api/profile` + `POST /api/backend/uploads/profile-image`.
- [x] Retain transactions placeholder/legacy reader (`/admin/transactions` via `src/lib/transactions-legacy.ts`) isolated strictly until Step 5 Express Stripe/transactions APIs.
- [x] Remove obsolete direct-MongoDB modules (`src/lib/services.ts`, `src/lib/appointments.ts`, `src/lib/admin.ts`) and verify role-based navigation and URL guards (`12/12` Step 4B live E2E passed).
- [x] Acceptance: admin can manage services, appointments, and users via Express APIs; customers cannot open admin routes (`307`/`403`); Next.js dashboard runs cleanly with `MONGODB_URI=""` & `IMGBB_API_KEY=""`.
- [x] Commit: Step 4B frontend migration commit (`feat(client): migrate customer/admin dashboards, profile, and image uploads to Express APIs`).

### Phase 5 — Payments

#### Backend (Step 5A — Completed, commit `f16a6ae`, docs `b57fce3`)

- [x] Add the lazy Stripe client (`config/stripe.js`) and checkout session API (`POST /api/payments/checkout` with `checkoutRateLimiter`, `.strict()` schema, ownership + confirmed/unpaid eligibility, server USD integer cents, and open-session reuse).
- [x] Add the raw-body webhook route (`POST /api/payments/webhook` mounted before `globalRateLimiter` & `express.json()`) and signature verification (`constructVerifiedStripeEvent` with `STRIPE_WEBHOOK_SECRET`).
- [x] Add idempotent transaction creation and appointment payment updates (`checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.expired`, `checkout.session.async_payment_failed`, `uniq_transactions_pending_appointment`, `uniq_transactions_paid_appointment`).
- [x] Add the read-only session status endpoint (`GET /api/payments/session/:sessionId` enforcing customer ownership).
- [x] Add customer (`GET /api/transactions/my`) and strictly read-only admin (`GET /api/admin/transactions`) transaction list APIs.
- [~] Test with live Stripe test-mode Checkout Sessions, cryptographic HMAC webhook events (`Stripe.webhooks.generateTestHeaderString` + `constructEvent`), duplicate webhook events, failed payments, and expired sessions (`24/24` backend tests passed across `5` suites; live `stripe listen` CLI forwarding remains a manual check once `STRIPE_WEBHOOK_SECRET` & Stripe CLI are configured locally).
- [x] Acceptance: payment status changes only after a verified webhook; duplicate events are harmless; admins cannot mutate transactions.
- [x] Commit: `f16a6ae` (`feat(server): add Stripe Checkout, verified webhook, and transaction APIs`).

#### Client (Step 5B — Completed)

- [x] Connect Pay Now on confirmed and unpaid appointments (`AppointmentCard.tsx` -> `startAppointmentCheckout` -> `POST /api/backend/payments/checkout` -> Express `POST /api/payments/checkout`, with `payInFlightRef` double-click lock).
- [x] Add the protected payment success (`/payment/success`, `PaymentSuccessClient.tsx` polling `GET /api/backend/payments/session/[sessionId]`) and cancel (`/payment/cancel`, `PaymentCancelActions.tsx`) pages with `src/app/payment/{layout,loading,error}.tsx` and `src/proxy.ts` `/payment/:path*` matcher.
- [x] Migrate the customer payments tab (`/customer/appointments?tab=payments`, `CustomerAppointmentsView.tsx`) onto Express `GET /api/transactions/my` with status filters (`All`, `Paid`, `Pending`, `Failed`) and `10`/page pagination (`txPage`).
- [x] Migrate the read-only admin transactions table (`/admin/transactions`, `AdminTransactions.tsx`) onto Express `GET /api/admin/transactions` with status filters, debounced search, pagination, and verified paid revenue summary.
- [x] Remove `src/lib/db.ts`, `src/lib/transactions-legacy.ts`, `mongodb` package, and `MONGODB_URI`/`MONGODB_DB_NAME` from `.env.example`.
- [x] Test checkout redirect URL creation, pre-webhook pending state, signed-webhook confirmed state, cancel page & retry eligibility, customer transaction isolation, admin ledger filtering, and zero direct MongoDB/secret references (`7/7` Step 5B live E2E + `SCAN_CLEAN=OK`).
- [x] Acceptance: success page shows the correct final state only after a verified webhook; no client code marks payments paid; zero direct MongoDB business-data access remains in `rup-chorcha`.
- [x] Commit: Step 5B frontend payment integration commit (`feat(client): integrate Stripe Checkout, payment status pages, and Express transaction views`).

### Phase 6 — Polish and completeness

- [x] Add loading skeletons for all data pages (`admin/profile/loading.tsx` added; all dashboard/public/payment segments covered).
- [x] Add `error.tsx`, `not-found.tsx`, and empty states (added root `src/app/not-found.tsx`, `src/app/global-error.tsx`, `src/app/(root)/error.tsx`, `src/app/(auth)/error.tsx`, and `src/app/services/(list)/error.tsx`).
- [~] Add toasts for every success and failure action (wired across auth, booking, dashboard, and payment forms; live interactive browser confirmation pending manual QA).
- [x] Remove all `alert()` usage (`0` calls to `alert()`, `confirm()`, `prompt()`, `localStorage`, or `sessionStorage` in `src/`).
- [~] Verify responsive layouts on mobile, tablet, and desktop (static & Tailwind responsive audit complete — `overflow-x-auto` tables, `break-words`/`break-all` card text, `min-h-9`/`size-9` tap targets; live Chrome DevTools viewport inspection blocked by `DevToolsActivePort` `ENOENT`, pending manual browser QA).
- [x] Verify keyboard navigation and form labels (explicit `<label>`/`FieldLabel`, `aria-live`, focus-visible rings, and `Skip to main content` -> `#main-content` links added across `Navbar` and `DashboardShell`).
- [x] Verify all buttons and navigation links (brand navigation, footer links, pagination, 404/error recovery links verified).
- [x] Add rate limiting to auth, checkout, and uploads (`authRateLimiter`, `checkoutRateLimiter`, `uploadRateLimiter`, `globalRateLimiter` verified on Express).
- [x] Add input sanitization and NoSQL injection protection (Zod `.strict()` schemas, `escapeRegex()`, allowlisted fields, parameterized queries verified).
- [x] Review files for secrets and sensitive logging (static bundle scan across `57` `.next/static` files passed with `0` leaked secrets; HTTP security headers added in `next.config.ts`).
- [x] Add optional demo seed data if useful for screenshots (`Jhanker makeup` active service + `seed:admin` script present; no hardcoded client demo arrays).
- [x] Test service deactivation, invalid IDs, booking conflicts, and payment failures (`24/24` backend tests + `8/8` Step 6 live E2E checks passed).
- [~] Acceptance: no broken links, no layout overflow, no browser alerts, and all error paths have feedback *(automated E2E & code audit pass; manual Chrome click-through across mobile/tablet/desktop remains pending user verification)*.
- [x] Commit: Step 6 error boundary, accessibility/security polish, and documentation commits (`rup-chorcha` reaches `22` commits).

### Phase 7 — Deployment and final QA

- [x] Deploy the backend (`https://rup-chorcha-backend.vercel.app` via `api/index.js` + `vercel.json`).
- [x] Deploy the client (`https://rup-chorcha.vercel.app` on Vercel).
- [x] Configure production environment variables on both platforms.
- [x] Configure CORS and cookie settings (`CLIENT_URL`, `CLIENT_APP_URL`, `BETTER_AUTH_URL`, `HttpOnly` + `SameSite=Lax` + HTTPS `Secure`).
- [x] Register the production Stripe webhook URL (`https://rup-chorcha-backend.vercel.app/api/payments/webhook` — verified `400 MISSING_STRIPE_SIGNATURE` instead of `503` on unsigned check).
- [x] Add production Google OAuth redirect URIs (`https://rup-chorcha.vercel.app/api/auth/callback/google` verified via `POST /api/auth/google`).
- [~] Seed the production admin account (`seed:admin` script verified; live admin login remains a manual user check with production admin credentials).
- [x] Test private routes after refresh (`/customer`, `/customer/appointments`, `/customer/profile`, `/services/[id]` -> `200`; unauthenticated `/admin` -> `307 -> /sign-in`).
- [x] Test no 404/504 on production routes (`/`, `/services`, `/sign-in`, `/sign-up`, `/api/health`, `/api/services`, `/api/auth/providers` -> `200`; `/nonexistent-step7-check` -> branded `404`).
- [~] Test the complete Stripe test-mode flow on the live site (full local E2E + production webhook config verified; manual browser Stripe test-card entry on live site pending user visual QA).
- [?] Test admin credentials on the live site *(manual user check with production admin credentials)*.
- [x] Update both READMEs with live links, repository links, and env names.
- [~] Prepare the submission: admin email, admin password, live site, client repo, server repo.
- [~] Acceptance: all automated production checks pass; manual Chrome OAuth/Stripe/Admin visual check remains for final user sign-off.
- [x] Commit: `docs: add deployment links, setup instructions, and final project documentation`.

---

## 12. Commit tracker

The assignment requires at least 20 meaningful client commits and 12 meaningful server commits.

### Client — target 20+, reached 22 after Step 6 commits (`19` after Step 5B)

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
- [x] Customer dashboard layout and overview (`/customer` -> Express `GET /api/dashboard/customer`)
- [x] Customer appointments list and detail (`/customer/appointments` -> Express `GET /api/appointments/my`, status tabs & 10/page pagination)
- [x] Customer cancel flow (`/api/backend/appointments/[id]/cancel` -> Express `PATCH /api/appointments/my/:id/cancel`)
- [x] Pay Now and checkout redirect (`AppointmentCard.tsx` & `PaymentCancelActions.tsx` -> `POST /api/backend/payments/checkout` -> Express `POST /api/payments/checkout`)
- [x] Payment success and cancel pages (`/payment/success` polling `GET /api/backend/payments/session/[sessionId]`, `/payment/cancel`, `src/app/payment/{layout,loading,error}.tsx`)
- [x] Customer payment history (`/customer/appointments?tab=payments` -> Express `GET /api/transactions/my` with status filters & `txPage` pagination)
- [x] Profile management (`GET`/`PATCH /api/auth/profile` -> Express `/api/profile`, plus `POST /api/backend/uploads/profile-image` -> Express `POST /api/uploads/profile-image`)
- [x] Admin dashboard layout and overview (`/admin` -> Express `GET /api/dashboard/admin`)
- [x] Admin services table (`/admin/services` -> Express `GET`/`PATCH`/`DELETE /api/admin/services*`)
- [x] Add/edit service and image upload (`/admin/services/new`, `/admin/services/update/[id]`, `POST /api/admin/uploads/service-image` -> Express ImgBB proxy)
- [x] Admin appointment management (`/admin/appointments`, `/api/backend/admin/appointments/[id]` -> Express `/api/admin/appointments*`)
- [x] Admin user management (`/admin/users`, `/api/backend/admin/users/[id]` -> Express `/api/admin/users*`)
- [x] Admin transactions (`/admin/transactions`, `/api/backend/admin/transactions` -> Express `GET /api/admin/transactions`, strictly read-only with status/search/pagination & revenue summary)
- [x] Responsive, loading, error, and empty-state polish (`not-found.tsx`, `global-error.tsx`, `(root)/error.tsx`, `(auth)/error.tsx`, `services/(list)/error.tsx`, `admin/profile/loading.tsx`, contrast & wrapping fixes, skip links, touch targets)
- [~] README and env example (frontend `.env.example` & `README.md` completed in Step 5B; final live deployment links pending Step 7)

### Server — target 12+, current 14 (`7e52bfc` .. `b57fce3`, target met!)

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
- [x] Stripe checkout API (`POST /api/payments/checkout`, commit `f16a6ae`)
- [x] Stripe webhook and transactions (`POST /api/payments/webhook`, `GET /api/payments/session/:sessionId`, commit `f16a6ae`)
- [x] Customer/admin transaction APIs (`GET /api/transactions/my`, `GET /api/admin/transactions`, commit `f16a6ae`)
- [x] Validation, rate limiting, CORS, and security hardening (ongoing review in Step 6)
- [~] README and env example (`.env.example` & backend `README.md` updated through Step 5A; final deployment links pending Step 7)

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

- [x] Admin can add a service with an image (Express `POST /api/admin/services` + Next BFF `POST /api/admin/uploads/service-image` -> live ImgBB verified in Step 4B).
- [x] Admin can update and deactivate a service (`/admin/services`, `/admin/services/update/[id]`, `PUT /api/admin/services/:id`, and `PATCH /api/admin/services/:id/status` verified in Step 4B).
- [x] Admin can delete an unreferenced service (`DELETE /api/admin/services/:id` verified in Step 4B).
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
- [x] Admin can confirm only pending appointments (`PATCH /api/admin/appointments/:id/confirm` verified + `/admin/appointments?status=confirmed` SSR + `409` on double confirm in Step 4B).
- [x] Admin can cancel pending and confirmed appointments (`PATCH /api/admin/appointments/:id/cancel` preserving `paymentStatus` history verified in Step 4B).
- [x] Admin sees customer, service, message, price, status, payment status, and request date (`/admin/appointments` SSR + `/api/backend/admin/appointments/[id]` detail BFF verified in Step 4B).
- [x] Blocked customer cannot book (verified `307 /sign-in?blocked=1` on `/services/[id]` & `/customer`, `403 USER_BLOCKED` on `POST /api/backend/appointments`, `/api/auth/profile`, and `/api/backend/uploads/profile-image`).

### Payments

- [x] Pay Now appears only for confirmed and unpaid appointments (`AppointmentCard.tsx` `canPay = status === "confirmed" && paymentStatus === "unpaid"`).
- [x] Pending and cancelled appointments cannot be paid (verified `409 APPOINTMENT_NOT_CONFIRMED` & `409 APPOINTMENT_CANCELLED`).
- [x] Checkout redirects to Stripe (verified `POST /api/backend/payments/checkout` -> real `https://checkout.stripe.com/...` URL in Stripe test mode).
- [x] Success page shows the final state only after the webhook (verified `/payment/success?session_id=...` shows `"Verifying your payment"` before webhook and `"Payment confirmed"` only after verified signed webhook).
- [x] Duplicate webhook events do not create duplicate paid transactions (verified `duplicate: true` & `uniq_transactions_paid_appointment`).
- [x] Failed or expired payment is recorded correctly (verified `checkout.session.expired` & `checkout.session.async_payment_failed` transition to `status: "failed"` while keeping appointment `unpaid`).
- [x] Admin cannot manually mark a payment successful (verified `POST`/`PATCH`/`PUT`/`DELETE /api/admin/transactions*` return `404`).
- [x] Customer payment history is correct (verified `/customer/appointments?tab=payments` & `/api/backend/transactions/my` return only the customer's own records).
- [x] Admin transactions are read-only (verified `/admin/transactions` & `/api/backend/admin/transactions`).

### UI and deployment

- [?] Desktop, tablet, and mobile layouts are usable *(automated layout/overflow CSS audit & responsive rules verified; live Chrome interactive viewport click-through pending manual QA due to Chrome DevTools MCP `DevToolsActivePort` `ENOENT`)*.
- [x] No browser `alert()` is used (verified `0` calls to `alert()`/`confirm()`/`prompt()`/`localStorage`/`sessionStorage` across `src/`).
- [~] Toasts appear for success and failure (Toast hooks wired across auth, booking, dashboard, and payment components; interactive Chrome visual confirmation pending manual check).
- [x] Loading states appear during fetch, booking, and payment (blush `loading.tsx` skeletons including `admin/profile/loading.tsx` and in-flight disabled buttons across `/services*`, `/customer*`, `/admin*`, and `/payment*`).
- [x] Error, not-found, and empty states are visible (root `src/app/not-found.tsx`, `src/app/global-error.tsx`, section `error.tsx` boundaries, and `EmptyState` views verified).
- [x] Private routes work after refresh (verified via HttpOnly cookies + SSR checks on `/customer`, `/admin`, `/services/[id]`, and `/payment/*`).
- [x] Production routes do not 404 or 504 (`https://rup-chorcha.vercel.app` & `https://rup-chorcha-backend.vercel.app` verified `200 OK`; unmatched paths render branded `404`).
- [~] Stripe webhook works on the live site (`https://rup-chorcha-backend.vercel.app/api/payments/webhook` verified `STRIPE_WEBHOOK_SECRET` configured & raw signature check active (`400 MISSING_STRIPE_SIGNATURE`); live browser test-card checkout pending user check).
- [?] Admin credentials work on the live site *(manual verification with production admin credentials)*.
- [x] No `.env` file or secret is committed.
- [x] Both READMEs are complete (live deployment URLs, repository links, and env variable names updated in both `README.md` files).
- [x] Client commit count is at least 20 *(22 commits in `rup-chorcha` after Step 6 commits)*.
- [x] Server commit count is at least 12 *(14 commits in `rup-chorcha-backend`)*.

---

## 14. Security checklist

- [x] All secrets are in environment variables.
- [x] `.env` files are gitignored in both repositories.
- [x] `role` and `isBlocked` are server-controlled and cannot be changed by clients.
- [x] Every protected API verifies JWT, role, blocked status, and ownership (verified across all `/api/jwt/*`, `/api/admin/*`, `/api/services/:id/availability`, `/api/appointments*`, `/api/dashboard/*`, `/api/profile`, `/api/uploads/*`, `/api/payments/*`, `/api/transactions/*`, and `/api/backend/*` routes).
- [x] Admin endpoints reject customers (verified on `/admin*`, `/api/jwt/admin-check`, `/api/dashboard/admin`, `/api/admin/services*`, `/api/admin/uploads/service-image`, `/api/admin/appointments*`, `/api/admin/users*`, and `/api/admin/transactions`).
- [x] Customer endpoints reject admins where required (verified `403 FORBIDDEN` on `/api/jwt/customer-check`, `/api/services/:id/availability`, `/api/appointments*`, `/api/dashboard/customer`, `/api/payments/checkout`, `/api/transactions/my`, and `/api/backend/*`).
- [x] Service price and appointment price are server-derived, never trusted from the client (`POST /api/appointments` and `POST /api/payments/checkout` reject client `amount`/`price`/`servicePrice` via `.strict()` and derive USD cents server-side).
- [x] Payment status is set only by the verified Stripe webhook (`POST /api/payments/webhook`).
- [x] Stripe webhook uses a raw body and signature verification (`express.raw({ type: "application/json", limit: "1mb" })` mounted before `express.json()` + `constructVerifiedStripeEvent`).
- [x] Webhook handling is idempotent (`uniq_transactions_paid_appointment`, `uniq_transactions_pending_appointment`, `uniq_transactions_stripe_session`, and atomic conditional transitions).
- [x] File uploads validate MIME type and size (verified on Express `lib/imgbb.js` + `middleware/upload.js` magic bytes & `5 MB` cap for both service and profile image uploads).
- [x] Search input is escaped and length-limited (`escapeRegex()`, max `100` chars across services, admin appointments, admin users, and admin transactions).
- [x] Request bodies are validated and do not pass raw objects into MongoDB queries (`.strict()` Zod schemas + explicit allowlisted field projections).
- [x] Auth, checkout, and upload routes are rate-limited (`globalRateLimiter`, `authRateLimiter`, `uploadRateLimiter`, and `checkoutRateLimiter` on Express).
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

> Last updated: 2026-11-21 (**Step 6 — Error Boundaries, Polish, Security & Manual QA** complete with automated E2E + security checks; manual Chrome DevTools visual click-through & `STRIPE_WEBHOOK_SECRET` CLI setup documented; **Step 7: Production Deployment** is next).
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

### Step 4A — Express Dashboard, Admin & Profile APIs (`rup-chorcha-backend`, commit `7405266`, docs `6559bd0`)

- [x] Express `GET /api/dashboard/customer`, `GET /api/dashboard/admin`, `/api/admin/appointments*` (list/filter/search/paginate, detail, confirm, cancel, status), `/api/admin/users*` (customers directory, detail, session-revoking block/unblock), `GET`/`PATCH /api/profile`, and `POST /api/uploads/profile-image` (`20/20` backend tests + live ImgBB upload smoke test passed).

### Step 4B — Frontend Dashboard, Admin & Profile Migration (`rup-chorcha`, commits `227f0ac`, `16f2644`)

- [x] Migrated Customer/Admin dashboards (`/customer*`, `/admin*`), Server Actions, `ProfileForm` (with `uploadMyProfileImage`), `/api/auth/profile` (`GET`/`PATCH`), `/api/backend/uploads/profile-image`, `/api/admin/uploads/service-image`, `/api/backend/appointments/[id]/cancel`, and `/api/backend/admin/{appointments,users}/[id]` onto Express APIs; removed `src/lib/{services,appointments,admin}.ts` and `IMGBB_API_KEY` (`12/12` E2E checks passed).

### Step 5A — Express Stripe Checkout, Verified Webhook & Payment APIs (`rup-chorcha-backend`, commits `f16a6ae`, `b57fce3`)

- [x] Implemented `POST /api/payments/checkout` (`checkoutRateLimiter`, `.strict()` schema, server USD integer cents, open-session reuse), raw-body `POST /api/payments/webhook` (mounted before `globalRateLimiter` & `express.json()`), `GET /api/payments/session/:sessionId`, `GET /api/transactions/my`, and strictly read-only `GET /api/admin/transactions`, plus `uniq_transactions_pending_appointment` & `idx_transactions_created_at` (`24/24` backend tests passed across `5` suites including live Stripe test-mode Checkout Sessions).

### Step 5B — Frontend Payment Integration & Legacy Database Cleanup (`rup-chorcha`)

- [x] **Payment BFF & Server Helpers (`src/lib/dashboard-types.ts`, `src/lib/backend-api.ts`, `src/lib/payments-client.ts`, `src/app/api/backend/*`):**
  - Added BFF routes `POST /api/backend/payments/checkout` (CSRF + `.strict()` `{ appointmentId }` + customer role guard), `GET /api/backend/payments/session/[sessionId]`, `GET /api/backend/transactions/my`, and `GET /api/backend/admin/transactions` (strictly read-only `GET`).
  - Added server helpers `fetchMyAppointmentById`, `fetchPaymentSession`, `fetchMyTransactions`, and `fetchAdminTransactions`.
  - Added client BFF helpers `startAppointmentCheckout` (validating HTTPS `checkout.stripe.com` URLs) and `fetchPaymentSessionFromBff`.
- [x] **Pay Now, `/payment/success` & `/payment/cancel` (`src/components/dashboard/AppointmentCard.tsx`, `src/app/payment/**`, `src/components/payments/*`, `src/proxy.ts`):**
  - Wired `AppointmentCard.tsx` Pay Now button to `startAppointmentCheckout` with `payInFlightRef` double-click protection, `401`/`403 USER_BLOCKED` redirect handling, and `409` conflict refresh.
  - Added `/payment/:path*` to `src/proxy.ts` matcher and created `src/app/payment/{layout,loading,error}.tsx` enforcing `requireSession()`.
  - Built `/payment/success` (`PaymentSuccessClient.tsx`): reads `session_id`, verifies ownership and payment status through `GET /api/backend/payments/session/[sessionId]`, polls every `2.5s` while `status === "pending"` (`!isFinal`), never assumes payment succeeded from the redirect URL alone, and handles `paid`, `pending`, `failed` (`session_expired` / `async_payment_failed` with Retry payment), `forbidden`, `not_found`, and invalid/missing `session_id` states.
  - Built `/payment/cancel` (`PaymentCancelActions.tsx`): clearly explains checkout was cancelled without marking the appointment paid or cancelled, loads owned appointment summary via `fetchMyAppointmentById`, and offers double-click-protected **Retry payment** when the appointment remains `confirmed` and `unpaid`.
- [x] **Customer Payments Tab & Admin Transactions Ledger:**
  - Migrated `/customer/appointments` Payments tab (`CustomerAppointmentsView.tsx`, `DashboardPagination.tsx` `pageParam="txPage"`) to Express `GET /api/transactions/my` with `All`/`Paid`/`Pending`/`Failed` status filters, `10`/page pagination, error retry state, and direct `?tab=payments` linking.
  - Migrated `/admin/transactions` (`AdminTransactions.tsx`) to Express `GET /api/admin/transactions` with server-driven status filters, debounced search (`350ms`), `10`/page pagination, and verified paid revenue summary.
- [x] **Complete Legacy Database Cleanup:**
  - Deleted `src/lib/db.ts` and `src/lib/transactions-legacy.ts`.
  - Removed `startPaymentAction` / `verifyPayableAppointment` from `src/app/(dashboard)/customer/appointments/actions.ts`.
  - Removed `MONGODB_URI` and `MONGODB_DB_NAME` from `rup-chorcha/.env.example`.
  - Uninstalled `mongodb` (`npm uninstall mongodb`) from `rup-chorcha/package.json` while preserving `better-auth` and `@better-auth/mongo-adapter`.
  - Verified zero direct MongoDB imports or secret references across `src/` and `.next/static/` (`SCAN_CLEAN=OK`).

## B. Current Project Status

### Implemented Functionality

- **Backend (`rup-chorcha-backend`, `14` commits, latest `b57fce3`):** All REST APIs for auth/JWT, services, ImgBB uploads, appointments & availability, customer/admin dashboards, admin appointment/user management, profile management, Stripe Checkout, verified raw-body webhook, and customer/admin transactions are complete and tested (`24/24` across `5` suites).
- **Frontend (`rup-chorcha`, `17` commits prior to Step 5B commits; `19` after Step 5B feature + docs commits):** All public, auth, booking, customer dashboard, admin dashboard, profile, upload, Stripe Checkout redirect, `/payment/success`, `/payment/cancel`, Customer Payments tab, and Admin Transactions views are integrated with Express via Server Components and same-origin BFF routes.

### Remaining Direct MongoDB References in Frontend (`rup-chorcha`)

- **None (`0` references in `src/`):** `src/lib/db.ts`, `src/lib/transactions-legacy.ts`, `src/lib/services.ts`, `src/lib/appointments.ts`, and `src/lib/admin.ts` have all been removed, and `mongodb` has been uninstalled from `rup-chorcha/package.json`. (`@better-auth/mongo-adapter` and `better-auth` remain in `package.json` per the rule to preserve Better Auth infrastructure, though all Better Auth DB operations run on `rup-chorcha-backend`.)
- **Untracked local `.env` note:** Developer's local gitignored `rup-chorcha/.env` may still contain legacy `MONGODB_URI` or `IMGBB_API_KEY` entries locally; neither is read by any frontend code and can be deleted from local `.env` at convenience.

### Known Issues & Remaining Manual Checks

- **Local Stripe CLI Webhook Forwarding (`STRIPE_WEBHOOK_SECRET`):** `stripe` CLI is not installed on this Windows machine and `STRIPE_WEBHOOK_SECRET` is blank in `rup-chorcha-backend/.env`. Install Stripe CLI (`winget install Stripe.StripeCli`), run `stripe listen --forward-to http://localhost:5000/api/payments/webhook`, and copy the printed `whsec_...` into `rup-chorcha-backend/.env` as `STRIPE_WEBHOOK_SECRET` for live browser checkout-to-webhook forwarding.
- **Chrome DevTools MCP Unavailable for Live Visual QA:** `chrome_devtools` MCP failed earlier (`ENOENT` on `DevToolsActivePort`); interactive browser click-through across mobile/tablet/desktop viewports, Stripe hosted checkout form submission, dialogs, file pickers, and visual toast notifications remains a manual check.
- **Paid Appointment Cancellation:** Admin cancellation of a paid confirmed appointment preserves `paymentStatus: "paid"` without automatic Stripe refunds.

## C. Architecture (Step 5B Payment & Transaction BFF Flow)

- **Checkout Initiation:** Browser `AppointmentCard` / `PaymentCancelActions` -> `POST /api/backend/payments/checkout` (CSRF + `.strict()` `{ appointmentId }` + customer role check + Bearer JWT) -> Express `POST /api/payments/checkout` -> Stripe Checkout Session (`https://checkout.stripe.com/...`).
- **Webhook Processing (Only Place Payment Status Mutates):** Stripe -> Express `POST /api/payments/webhook` (`express.raw` Buffer + `STRIPE_WEBHOOK_SECRET` signature verification) -> idempotent `transactions` (`paid` / `failed`) and `appointments` (`paymentStatus: "paid"`) update.
- **Success Page Verification:** Browser `/payment/success?session_id=cs_...` -> SSR `fetchPaymentSession` + client polling `GET /api/backend/payments/session/[sessionId]` -> Express `GET /api/payments/session/:sessionId` (read-only owner check).
- **Transaction Views:** Customer `/customer/appointments?tab=payments` -> Express `GET /api/transactions/my`; Admin `/admin/transactions` -> Express `GET /api/admin/transactions` (strictly read-only).

## D. Environment Variables (`rup-chorcha`)

- **Required in `rup-chorcha/.env.example`:**
  - `NEXT_PUBLIC_APP_URL=http://localhost:3000`
  - `API_URL=http://localhost:5000`
- **Removed from `rup-chorcha/.env.example` & frontend code:** `MONGODB_URI`, `MONGODB_DB_NAME`, `IMGBB_API_KEY`.

## E. Executed Tests & Verification Results (Step 5B Final Verification)

- **Route types & TypeScript (`npx.cmd next typegen && npx.cmd tsc --noEmit`):** Exit `0`, `0` errors.
- **ESLint (`npm.cmd run lint`):** Exit `0`, `0` errors, `0` warnings.
- **Production Next.js build (`npm.cmd run build`):** Exit `0`; all `24/24` static/dynamic routes compiled cleanly including `/payment/success`, `/payment/cancel`, `/api/backend/payments/checkout`, `/api/backend/payments/session/[sessionId]`, `/api/backend/transactions/my`, and `/api/backend/admin/transactions`.
- **Source & Bundle Secret/DB Scan (`src/` & `.next/static/`):** Exit `0` (`SCAN_CLEAN=OK`); `0` matches for `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `sk_test_`, `sk_live_`, `whsec_`, `IMGBB_API_KEY`, `MONGODB_URI`, `@/lib/db`, or `transactions-legacy`.
- **Full-Stack Step 5B Live E2E (`verify-step5b-e2e.mjs` against ephemeral Express + MongoDB Atlas + live Stripe Test Mode + `next start` with `MONGODB_URI=""`, `STRIPE_SECRET_KEY=""`, `STRIPE_WEBHOOK_SECRET=""`, `IMGBB_API_KEY=""`):** **7/7 checks passed (`exit 0`)**:
  1. Servers booted with empty `MONGODB_URI`/`STRIPE_*` on Next.js; `src/lib/db.ts` and `src/lib/transactions-legacy.ts` confirmed deleted.
  2. Unauthenticated SSR (`/payment/success`, `/payment/cancel`, `/customer/appointments`, `/admin/transactions` -> `307 /sign-in`) and BFF (`POST /api/backend/payments/checkout`, `GET /api/backend/payments/session/*`, `GET /api/backend/transactions/my`, `GET /api/backend/admin/transactions` -> `401`) guards verified.
  3. Pay Now BFF (`POST /api/backend/payments/checkout`) created real Stripe test Checkout Session (`201`, `cs_test_a0jNO6At1YgPOEg8C9jmH7358Po3WBRNsN8EWbjJsHKI0xaeiBhD6idoFC`, `https://checkout.stripe.com/...`), reused active session on repeat click (`200`), rejected cross-site CSRF (`403`), rejected spoofed `amount: 100` (`400`), and blocked Customer B from paying Customer A's appointment (`403`).
  4. `/payment/success` handled missing and invalid `session_id` safely, blocked cross-customer access (`403` on BFF, no data leak on SSR), showed `"Verifying your payment"` (`status: "pending"`, `isFinal: false`) before webhook, and transitioned to `"Payment confirmed"` (`status: "paid"`, `isFinal: true`, `paymentStatus: "paid"`) after verified signed `checkout.session.completed` webhook delivery.
  5. `/payment/cancel?appointmentId=...` rendered `"Payment was cancelled"` + `"Retry payment"` without altering appointment `confirmed`/`unpaid` status and hid other customers' appointment details.
  6. Customer Payments tab (`/customer/appointments?tab=payments` & `/api/backend/transactions/my`) isolated Customer A's transactions from Customer B; Customer A was blocked from `/admin/transactions` (`307 -> /customer`) and `/api/backend/admin/transactions` (`403`); Admin `/admin/transactions?status=paid&search=...` & BFF returned verified transaction rows and revenue totals with zero secret leaks.
  7. Pre-existing Atlas service `"Jhanker makeup"` (`6b008bfdeda8c9a56f80bc57`) remained untouched; all temporary live Stripe sessions were expired and all temp MongoDB records were deleted in cleanup.

## F. Development Roadmap

1. [x] **Step 1 — Express Foundation, DB Indexes, Better Auth/JWT & Same-Origin Next.js Auth BFF (`Part A` `0b2c6eb`, `Part B` `5a961b2`, `Part C Stage 1` `8e713d8`)**
2. [x] **Step 2 — Services APIs & Public Pages (`Step 2A` `449a45c` / `ede3cc1` / `1bf7ec6`, `Step 2B` `4eefb87` / `8e209c8`)**
3. [x] **Step 3 — Protected Service Details (`/services/[id]`) & Appointment Booking System (`rup-chorcha-backend` `fc3b1d8` / `ef10f2b`; `rup-chorcha` `4f327dd` / `c5c69f0`)**
4. [x] **Step 4 — Express Dashboard, Admin & Profile APIs (`Step 4A` `7405266` / `6559bd0`) & Frontend Migration (`Step 4B` `227f0ac` / `16f2644`)**
5. [x] **Step 5 — Stripe Checkout, Verified Webhook & Payment Pages (`Step 5A` `f16a6ae` / `b57fce3`, `Step 5B` complete)**
6. [x] **Step 6 — Error Boundaries, Polish, Security & Manual QA**: Added root `src/app/not-found.tsx`, `src/app/global-error.tsx`, `src/app/(root)/error.tsx`, `src/app/(auth)/error.tsx`, `src/app/services/(list)/error.tsx`, and `admin/profile/loading.tsx`; hardened HTTP response headers in `next.config.ts`; improved `--muted-foreground` & Footer WCAG AA contrast, Skip-to-main-content links, password-toggle hit areas, and mobile card word wrapping; verified `next typegen`, `tsc --noEmit`, ESLint, `next build`, `24/24` backend tests, and `8/8` Step 6 live full-stack E2E/security checks (`22` client commits / `14` server commits). *(Manual live Chrome DevTools click-through remains pending user check due to `DevToolsActivePort` `ENOENT`.)*
7. [x] **Step 7 — Documentation, Commit Targets & Production Deployment**: Deployed frontend (`https://rup-chorcha.vercel.app`) and Express backend (`https://rup-chorcha-backend.vercel.app` via `api/index.js` + `vercel.json`), wired production env vars, Google OAuth callback (`https://rup-chorcha.vercel.app/api/auth/callback/google`), and Stripe test-mode webhook (`https://rup-chorcha-backend.vercel.app/api/payments/webhook`); verified live production health, services, auth/booking/cancel/profile/RBAC/CSRF/404 (`EXIT_PROD_QA=0`), and updated both `README.md` and `AGENTS.md` files. *(Interactive browser Google consent, Stripe test-card checkout UI, and admin login remain manual visual checks.)*

## G. Development Rules & Lessons Learned

- **Build-Time `NEXT_PUBLIC_*` Inlining & CSRF Origin:** `next build` inlines `NEXT_PUBLIC_APP_URL` into `getAppOrigin()` inside compiled bundles, so production `POST`/`PATCH`/`DELETE` BFF requests validate `Origin`/`Referer` against the configured canonical `NEXT_PUBLIC_APP_URL` regardless of runtime bind host/port.
- **Clearing Sandbox-Corrupted Turbopack Cache:** If a sandboxed `next build` fails mid-flight inside `evaluate_webpack_loader`, Turbopack can cache the failed worker state in `.next/`; delete `.next` before re-running `npm run build` outside the sandbox.
- **Read-Only Redirect Verification:** `/payment/success` never mutates payment state; it polls `GET /api/backend/payments/session/[sessionId]` while `"pending"` and displays `"Payment confirmed"` only after the verified Express Stripe webhook updates MongoDB.
- **Windows / Sandbox verification rules:** Run `typegen`/`tsc`/`lint` locally; run `next build`, MongoDB Atlas/ImgBB/Stripe integration tests, cross-repo Git commands, and Git commits with network/workspace access (`BypassSandbox: true`).


