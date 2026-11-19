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

- [ ] Confirm Node.js 20 or newer.
- [ ] Verify Better Auth compatibility with the installed `mongodb` driver version.
- [ ] Install backend dependencies: `better-auth`, `stripe`, `multer`, `jose`, `zod`, `express-rate-limit`, `helmet`, `cookie-parser`.
- [ ] Add scripts: `dev` using `node --watch`, `start`, and `seed:admin`.
- [ ] Create `.env` locally and `.env.example` with names only.
- [ ] Create the backend folder structure: config, db, lib, middleware, modules, routes, scripts, utils.
- [ ] Connect to MongoDB and export the database plus the `services`, `appointments`, and `transactions` collections.
- [ ] Add index creation for all collections, including the per-customer slot index.
- [ ] Add Helmet, CORS allowlist, global rate limiter, JSON parser, cookie parser, 404 handler, and central error handler.
- [ ] Add the health endpoint.
- [ ] Add the backend README with project name, description, features, stack, installation, run instructions, env names, and repository link.
- [ ] Acceptance: `GET /api/health` returns success; unknown routes return JSON 404; the client origin is allowed; no secrets are committed.
- [ ] Commit: `chore(server): scaffold express foundation, mongo connection, health and error handling`.

#### Client

- [ ] Update metadata, logo text, and branding to RupChorcha.
- [ ] Update theme tokens and fonts for a professional salon look.
- [ ] Add a client Providers component and mount the toaster.
- [ ] Create `.env.local` locally and `.env.example` with names only.
- [ ] Add the server-only API client, BFF route skeletons, shared types, constants, and validators.
- [ ] Configure `next.config.ts` image remote patterns for ImgBB and Google avatars.
- [ ] Add the client README with the required sections.
- [ ] Acceptance: `npm run dev` works; the home page shows RupChorcha; no console errors; the toaster renders.
- [ ] Commit: `chore(client): establish RupChorcha theme, providers, and app foundation`.

### Phase 1 — Authentication

#### Backend

- [ ] Configure Better Auth with the MongoDB adapter.
- [ ] Add email/password and Google providers.
- [ ] Add `role`, `isBlocked`, and `phone` additional fields; protect `role` and `isBlocked` from client input.
- [ ] Enforce password rules on sign-up.
- [ ] Add a session hook that rejects blocked users.
- [ ] Enable the JWT plugin or implement the fallback JWT issuer.
- [ ] Mount the Better Auth handler.
- [ ] Add JWT verification, role, blocked-user, and ownership middleware.
- [ ] Add the admin seed script.
- [ ] Test sign-up, sign-in, Google, blocked user, admin role, and JWT-protected endpoints.
- [ ] Acceptance: customers and admins receive correct roles; blocked users are rejected; no client can create an admin through registration.
- [ ] Commit: `feat(server): add better auth, jwt verification, role guards, and admin seeding`.

#### Client

- [ ] Add the Better Auth client and the auth BFF proxy.
- [ ] Build the sign-up page with password rules and image URL support.
- [ ] Build the sign-in page with email/password and Google.
- [ ] Build the auth-aware navbar, profile dropdown, mobile sheet, and sign-out.
- [ ] Add auth redirects and the protected dashboard layout foundation.
- [ ] Test refresh persistence, role redirects, blocked users, and sign-out.
- [ ] Acceptance: navbar updates immediately after auth changes; private routes survive refresh; role mismatch cannot open the other dashboard.
- [ ] Commit: `feat(client): add better auth pages, session-aware navbar, and route guards`.

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

### Client — target 20+, current 2

- [ ] Theme, fonts, providers, toaster
- [ ] Public layout, navbar, footer
- [ ] Home hero and featured services
- [ ] Home categories and extra section
- [ ] Shared service card and status badges
- [ ] Browse search, filter, and sort
- [ ] Service details page
- [ ] Booking form and dialog
- [ ] Auth client and sign-up
- [ ] Sign-in and Google auth
- [ ] Route guards and role redirects
- [ ] Customer dashboard layout and overview
- [ ] Customer appointments list and detail
- [ ] Customer cancel flow
- [ ] Pay Now and checkout redirect
- [ ] Payment success and cancel pages
- [ ] Customer payment history
- [ ] Profile management
- [ ] Admin dashboard layout and overview
- [ ] Admin services table
- [ ] Add/edit service and image upload
- [ ] Admin appointment management
- [ ] Admin user management
- [ ] Admin transactions
- [ ] Responsive, loading, error, and empty-state polish
- [ ] README and env example

### Server — target 12+, current 1

- [ ] Express foundation, env, health, error handling
- [ ] MongoDB connection, collections, and indexes
- [ ] Better Auth configuration
- [ ] Admin seed script
- [ ] JWT, role, and blocked-user middleware
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

- [ ] Sign-up works with valid fields.
- [ ] Password shorter than 6, without uppercase, or without lowercase is rejected.
- [ ] Duplicate email shows a useful error.
- [ ] Google sign-in works.
- [ ] Customer and admin redirect to the correct dashboard.
- [ ] Blocked user cannot sign in.
- [ ] Blocked user cannot use protected APIs.
- [ ] Admin cannot be created from public registration.
- [ ] Session survives page refresh.
- [ ] Sign-out clears the session and updates the navbar.

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

- [ ] All secrets are in environment variables.
- [ ] `.env` files are gitignored in both repositories.
- [ ] `role` and `isBlocked` are server-controlled and cannot be changed by clients.
- [ ] Every protected API verifies JWT, role, blocked status, and ownership.
- [ ] Admin endpoints reject customers.
- [ ] Customer endpoints reject admins where required.
- [ ] Service price and appointment price are server-derived, never trusted from the client.
- [ ] Payment status is set only by the verified Stripe webhook.
- [ ] Stripe webhook uses a raw body and signature verification.
- [ ] Webhook handling is idempotent.
- [ ] File uploads validate MIME type and size.
- [ ] Search input is escaped and length-limited.
- [ ] Request bodies are validated and do not pass raw objects into MongoDB queries.
- [ ] Auth, checkout, and upload routes are rate-limited.
- [ ] CORS uses an explicit origin allowlist with credentials.
- [ ] Cookies are httpOnly and secure in production.
- [ ] No stack traces or secrets are exposed in production errors.
- [ ] No sensitive data is logged.
- [ ] Admin seeding is a server-side script, not a public endpoint.

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
