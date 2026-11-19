# RupChorcha Design System

> Permanent source of truth for the RupChorcha interface. Read `BRAND_GUIDELINES.md` first. Every new page, component, table, form, and dashboard must follow this document.

## 1. Foundation

- **Framework:** Next.js 16 App Router, React 19, TypeScript.
- **Styling:** Tailwind CSS v4 with CSS variables in `src/app/globals.css`.
- **Components:** existing shadcn/Base UI components in `src/components/ui`.
- **Class helper:** `cn` from the `cn` package, re-exported by `src/lib/utils.ts`.
- **Icons:** `lucide-react`.
- **Fonts:** Cormorant Garamond, DM Sans, Allura, and Noto Sans Bengali loaded with `next/font/google`.
- **Toasts:** existing Base UI toast in `src/components/ui/toast.tsx`, mounted through `src/components/providers.tsx`.
- **Do not introduce a second design system or a competing token set.**

## 2. Design tokens

Tokens live in `src/app/globals.css` and are exposed as Tailwind theme values.

### Colour tokens

| Tailwind token | CSS variable | Value |
|---|---|---|
| `primary` | `--primary` | `#E50057` |
| `plum` | `--plum` | `#3A1830` |
| `ivory` / `background` | `--ivory` / `--background` | `#FFF9F7` |
| `blush` / `secondary` | `--blush` / `--secondary` | `#F7E4EA` |
| `rose` | `--rose` | `#D99AAE` |
| `charcoal` / `foreground` | `--charcoal` / `--foreground` | `#29232A` |
| `card` | `--card` | `#FFFFFF` |
| `success` | `--success` | `#2F7D5A` |
| `warning` | `--warning` | `#A86B16` |

Semantic shadcn tokens (`background`, `foreground`, `card`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`, `sidebar-*`, `chart-*`) are mapped to the brand palette. Use semantic tokens for UI surfaces and brand tokens for identity accents. Status surfaces use the success, warning, and destructive tokens with opacity.

### Typography tokens

| Tailwind token | CSS variable | Font |
|---|---|---|
| `font-heading` | `--font-heading` | Cormorant Garamond |
| `font-sans` | `--font-sans` | DM Sans |
| `font-script` | `--font-script` | Allura |
| `font-bengali` | `--font-bengali` | Noto Sans Bengali |
| `font-mono` | `--font-mono` | System monospace stack |

### Spacing

Use a 4px base scale:

`4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 120`

- Section padding: `py-16 sm:py-24`.
- Dashboard padding: `p-4 sm:p-6 lg:p-8`.
- Card padding: 20–24px.
- Form field gap: 16–20px.
- Grid gap: 16–32px.

### Radii

- Small controls: 6–10px.
- Buttons and inputs: 10–12px.
- Cards and panels: 16–20px.
- Badges: pill (`rounded-full`).
- Dialogs and sheets: 20–24px.

### Shadows

- Prefer a thin rose-tinted border over a heavy shadow.
- Card: `shadow-[0_1px_2px_rgba(58,24,48,0.05)]`.
- Raised card/hover: `shadow-[0_8px_24px_rgba(58,24,48,0.08)]`.
- Overlay/dialog: `shadow-[0_24px_64px_rgba(58,24,48,0.18)]`.
- Avoid neon glows, heavy blur, and layered shadows.

### Breakpoints

| Name | Width |
|---|---|
| `sm` | 640px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1280px |
| `2xl` | 1440px |

### Containers

- Content container: `max-w-7xl` (1280px).
- Gutters: 16px mobile, 24px tablet, 32px desktop.
- Prose width: maximum 68ch.
- Dashboard content: fluid with a maximum readable width for tables.

## 3. Layout principles

- Use generous whitespace and clear section rhythm.
- Public pages are editorial: large headings, image-led sections, thin rules.
- Dashboard pages are efficient: compact spacing, clear labels, scannable tables.
- Do not centre every section; alternate alignment and rhythm.
- Do not use pink as a full-page background.
- Do not use gradients, glassmorphism, or decorative animation.
- Use motion only for state feedback: hover, focus, dialogs, toasts, loading.
- Keep transitions between 150ms and 250ms and respect reduced motion.

## 4. Component specifications

### Navbar

- Sticky top, solid ivory or white with a thin bottom border.
- Logo on the left. Primary navigation in the centre or right. Primary action on the far right.
- No glass blur; use a solid surface.
- Mobile: menu button opens a sheet with full navigation and a primary action.
- Auth-aware states arrive in Phase 1; do not add dead Sign In links before the routes exist.
- Active navigation uses pink text and a small underline or dot.

### Footer

- Deep plum surface with ivory text.
- Logo, short brand description, navigation, contact details, opening hours, and copyright.
- Social links only when real profile URLs exist.
- Links use rose or blush hover states, not pink body text.

### Buttons

Use existing `Button` and `buttonVariants`.

- Primary: pink background, white text.
- Secondary: blush background, plum text.
- Outline: transparent/white surface, rose-tinted border, plum text.
- Ghost: transparent, plum text, blush hover.
- Destructive: deep red text on a light red surface.
- Existing Button sizes are compact for dashboards. Public CTAs use `h-11` (44px) for mobile touch targets.
- Minimum touch target: 44px on mobile.
- Always show a visible focus ring.
- Never use a button for navigation; use a link styled with `buttonVariants`.

### Inputs and form fields

- Use `Input`, `Textarea`, `Select`, `Label`, and `Field` components.
- White surface, 1px rose-tinted border, 10–12px radius.
- Height: 40px default, 44px on mobile where practical.
- Focus: pink border and a soft pink ring.
- Error: destructive border, error text, and an icon. Do not rely on red alone.
- Labels are always visible. Placeholders are examples, not labels.
- Required fields are marked in text.
- Help text sits below the control and is linked with `aria-describedby` where applicable.

### Cards

- White surface, 1px rose-tinted border, 16–20px radius.
- Use subtle hover lift only for interactive cards.
- Editorial images use a consistent 4:5 ratio; service grid cards use 4:3.
- Do not put heavy shadows on every card.

### Service card

- Image (4:3), category badge, serif service name, short description.
- Price formatted as USD with two decimals.
- Duration with a clock icon.
- Interaction: the whole card may be a link when the details route exists.
- Do not add a “View details” action until the `/services/[id]` route exists.
- Demo data must be replaceable by the live API without changing the card layout.

### Category card

- Blush or white surface with a line icon, category name, and optional short description.
- Only interactive when a real filter link exists.
- If no link exists, render a non-interactive card; do not add hover affordances that imply a click.

### Status badges

Use `StatusBadge` for appointment, payment, and service states.

- Pending: warning surface and text, clock icon.
- Confirmed: success surface and text, check icon.
- Cancelled: destructive surface and text, X icon.
- Unpaid: neutral surface and text, card icon.
- Paid: success surface and text, check icon.
- Failed: destructive surface and text, X icon.
- Active: success surface and text, power icon.
- Inactive: neutral surface and text, power-off icon.
- Include text and an icon. Colour is secondary.
- Use `aria-label` or visible text that includes the status name.

### Dialogs and confirmation dialogs

- Use existing `Dialog` and `AlertDialog` Base UI components.
- White surface, 20px radius, plum overlay.
- Title in Cormorant Garamond; body in DM Sans.
- Destructive confirmation copy must name the action and consequence.
- Provide a clear cancel action and a clearly labelled confirm action.
- Focus is trapped by the Base UI primitive.

### Tables

- White surface, blush/ivory header, thin row dividers.
- Header labels: 12px uppercase with tracking.
- Row hover: blush tint.
- Actions use a menu or clearly labelled buttons.
- On mobile, convert to stacked cards or allow safe horizontal scrolling with a visible hint.
- Numeric values align right; text values align left.
- Status columns use badges, not raw colours.

### Dashboard sidebar

- White sidebar for customer dashboards; deep plum sidebar for admin dashboards.
- Width 260px expanded, 72px collapsed where supported by the existing sidebar component.
- Logo at the top.
- Navigation items use icon + label; active state uses pink text and a blush background (or rose-on-plum for the admin sidebar).
- User/profile area at the bottom.
- Mobile: sidebar becomes a sheet.

### Stat cards

- Label, value, optional helper text, and a blush icon chip.
- Value in Cormorant Garamond or DM Sans semibold depending on density.
- Do not invent deltas or trends unless real comparison data exists.
- Loading state uses a skeleton with the same dimensions.

### Loading states

- Use blush-toned skeletons, not generic grey blocks.
- Match the final layout dimensions to prevent jumps.
- Service grid: 3/6 card skeletons.
- Tables: 5–8 row skeletons.
- Buttons: spinner + “Processing…” or a specific action label.
- Preserve the page header during loading.

### Empty states

- Line icon in a blush circle.
- Serif heading.
- One sentence of helpful copy.
- One clear action when an action exists.
- Never imply that missing data is an error.

### Error states

- Clear heading, human-readable message, and a next step.
- Use a retry action only when retrying actually works.
- Keep technical details out of the UI; log them for developers.
- Toasts are supplementary, not the only error feedback.

### Toasts

- Use the existing Base UI toast system.
- Success: confirmation of the completed action.
- Error: what failed and what to do next.
- Keep titles short; put detail in the description.
- Never use `alert()`.

## 5. Page patterns

### Public pages

- Ivory background.
- Alternating white and blush sections.
- One primary pink CTA per viewport region.
- Editorial images with arched or 16–20px rounded frames.
- Thin rose rules between major sections.

### Authentication pages

- Split layout: editorial image/brand panel and a white form card.
- Mobile: compact brand header and a focused form.
- Clear validation and toasts; no fake social proof.

### Customer dashboard

- Ivory canvas, white surfaces, plum text.
- Sidebar with Overview, My Appointments, My Profile.
- Stats at the top, recent appointments below.
- Appointment and payment badges always include text.
- Actions match state: cancel only pending; pay only confirmed and unpaid.

### Admin dashboard

- Deep plum sidebar, ivory canvas, white data surfaces.
- Prioritise information density and clarity.
- Sticky filters and table headers where useful.
- Pink is reserved for primary actions and active states.
- No decorative imagery inside the admin workspace.
- Destructive actions require confirmation.

## 6. Responsive rules

- Mobile first; test at 320px, 375px, 768px, 1024px, 1280px, and 1440px.
- Public grids: 1 column mobile, 2 tablet, 3 desktop.
- Hero: stacked on mobile, two columns from `lg`.
- Service details: stacked on mobile, image + booking card from `lg`.
- Dashboard: sidebar sheet on mobile, persistent sidebar from `lg`.
- Tables: cards or safe horizontal scroll on mobile; no clipped actions.
- Forms: single column on mobile; two columns only when labels and errors stay readable.
- Sticky elements must not cover content or block the keyboard focus ring.
- No horizontal overflow at any breakpoint.

## 7. Accessibility rules

- Use semantic landmarks: header, nav, main, section, footer.
- One `h1` per page; maintain heading order.
- Every input has a visible label.
- Every icon-only button has an accessible name.
- Every image has appropriate alt text.
- Status uses icon + text, not colour alone.
- Focus rings are visible on ivory, white, and plum surfaces.
- Keyboard navigation works for menus, dialogs, sheets, and forms.
- Dialogs and sheets trap focus and return focus to the trigger.
- Respect `prefers-reduced-motion`.
- Do not place text over busy images without a solid or sufficiently opaque surface.
- Maintain at least 4.5:1 contrast for normal text and 3:1 for large text.

## 8. Implementation rules for future agents

1. Read `BRAND_GUIDELINES.md` and this file before UI work.
2. Reuse existing shadcn/Base UI components; do not create parallel primitives.
3. Use Base UI's `render` prop, not Radix `asChild`.
4. Use the `cn` helper; do not add `clsx` or `tailwind-merge`.
5. Use semantic tokens (`bg-background`, `text-foreground`, `bg-card`, `border-border`) for surfaces.
6. Use brand tokens (`bg-primary`, `text-plum`, `bg-blush`, `text-rose`) for identity moments.
7. Do not hardcode hex values inside components when a token exists.
8. Do not add dead links, placeholder buttons, or fake controls. Defer an action until its route or handler exists.
9. Do not invent statistics, ratings, years of experience, testimonials, or business claims.
10. Keep the homepage ready for live API data: service cards receive data through props; no permanent coupling to demo data.
11. Do not modify the backend, database schema, authentication architecture, or Stripe integration as part of UI work.
12. Run `npm run build`, `npm run lint`, and `npx tsc --noEmit` after UI changes.
13. Check mobile, tablet, and desktop layouts.
14. Update the affected documentation when a token or component rule changes.

## 9. Current implementation notes

- The homepage service grid uses temporary demo data in `src/lib/demo-services.ts`. It will be replaced by active services from the Express API.
- The navbar currently uses in-page anchors because the Browse, Sign In, and Sign Up routes are implemented in later phases. Do not add links to routes that do not exist.
- Contact details and opening hours are placeholders documented in `BRAND_GUIDELINES.md`.
- Social links are omitted until real profile URLs are available.
- The logo is original SVG geometry, not the supplied reference image.
