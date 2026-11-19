# RupChorcha Brand Guidelines

> Permanent source of truth for the RupChorcha brand. Read this file together with `DESIGN_SYSTEM.md` before creating or changing any public page, dashboard page, component, email, or document.

## 1. Brand at a glance

- **Name:** RupChorcha
- **Type:** Salon appointment booking platform
- **Tagline:** Beauty, Elegance & Confidence.
- **Personality:** Elegant, feminine, premium, welcoming, sophisticated, modern.
- **Promise:** A calm, considered beauty experience from the first click to the final appointment.
- **Writing rule:** Always write the name as **RupChorcha**. Never use SalonBook or the reference image's original business name.

## 2. Brand idea

RupChorcha is designed around the idea of **quiet luxury**: warm, personal, and editorial rather than loud or transactional. The experience should feel like walking into a calm, beautifully considered salon, not like browsing a generic service directory.

The visual language combines:

- Warm ivory space and deep plum ink.
- A vivid pink signature accent used with restraint.
- Editorial serif headlines and clean, modern interface type.
- Soft blush surfaces, thin rose rules, and generous whitespace.
- Human, natural-light photography.
- Small, meaningful details instead of decorative clutter.

## 3. Logo direction

The logo reference shows a vivid pink R monogram, a feminine profile with flowing hair, an ornamental swash, spaced salon typography, and a cursive tagline. Those qualities are inspiration only. The production identity must use original geometry and the RupChorcha name.

### The R profile mark

- An original R monogram whose left side is a continuous feminine profile line.
- The profile forms the stem of the R: forehead, nose, lips, chin, and neck.
- A separate bowl and diagonal leg complete the R without closing the profile into a loop.
- A small rose dot sits at the upper right like a beauty mark.
- The mark is outline-led and stays recognisable at 24px; the favicon reduces it to a solid R with a round counter and dot.

### Wordmark

- **RupChorcha** in Cormorant Garamond, title case.
- The R and C remain capitalised.
- Keep the wordmark readable; do not stretch, rotate, outline, or apply effects.
- The tagline “Beauty, Elegance & Confidence.” is set in Allura and used only at lockup sizes where it remains legible.

### Required versions

| Version | Use |
|---|---|
| Primary | Pink profile mark, plum wordmark on ivory or white |
| Reverse | Ivory profile mark and wordmark with a pink dot on deep plum |
| Monochrome | Plum or charcoal for print, stamps, and low-colour use |
| Mark icon | Outline profile mark for avatars, loading states, and small spaces |
| Favicon | Solid ivory R with dot on a pink rounded tile |

### Clear space and minimum size

- Clear space: at least the height of the R on every side.
- Minimum horizontal lockup width: 120px.
- Minimum icon size: 24px.
- Minimum favicon: 16px with the simplified mark only.

### Logo do and do not

**Do**

- Use the supplied RupChorcha SVG assets or the reusable `Logo` component.
- Use the reverse version on deep plum.
- Give the logo quiet space.
- Use the icon-only version when the wordmark would be too small.

**Do not**

- Use the reference PNG as the production logo.
- Copy the reference business name or tagline.
- Stretch, rotate, recolour, or add shadows, gradients, or outlines.
- Place the logo on a busy photograph without a solid or sufficiently opaque surface.
- Use the script tagline as body text or at small sizes.

### Asset locations

- `public/brand/rupchorcha-logo.svg`
- `public/brand/rupchorcha-logo-reverse.svg`
- `public/brand/rupchorcha-mark.svg`
- `public/brand/rupchorcha-favicon.svg`
- `src/app/icon.svg`
- `src/components/brand/Logo.tsx`
- `src/components/brand/LogoMark.tsx`

The SVG lockups use a serif fallback for the wordmark when the brand webfont is unavailable. In the application, always use the `Logo` component so Cormorant Garamond and Allura are loaded through `next/font`.

## 4. Colour palette

### Core palette

| Name | Token | Hex | Primary use |
|---|---|---|---|
| Primary Pink | `primary` | `#E50057` | Primary buttons, active navigation, key accents |
| Deep Plum | `plum` | `#3A1830` | Headings, premium surfaces, admin sidebar |
| Warm Ivory | `ivory` / `background` | `#FFF9F7` | Main page background |
| Soft Blush | `blush` / `secondary` | `#F7E4EA` | Secondary sections, subtle panels |
| Muted Rose | `rose` | `#D99AAE` | Decorative accents, dividers, icons |
| Charcoal | `charcoal` / `foreground` | `#29232A` | Body text |
| White | `card` | `#FFFFFF` | Cards, forms, dashboard surfaces |

### Functional colours

| Role | Token | Value |
|---|---|---|
| Border | `border` | Derived from plum at low opacity |
| Muted text | `muted-foreground` | Derived from charcoal and ivory |
| Destructive | `destructive` | `#B42318` |
| Success | `success` | `#2F7D5A` |
| Warning | `warning` | `#A86B16` |
| Status surfaces | `success/10`, `warning/10`, `destructive/10` | Token opacity |
| Neutral/unpaid | `muted` | Derived from blush and ivory |

### Usage rules

- Pink is the signature accent, not the default background.
- Use pink for primary actions, active states, small highlights, and key numbers.
- Use deep plum for headings and premium brand moments.
- Use ivory as the main canvas and white for cards, forms, and tables.
- Use blush for secondary sections, not every section.
- Use muted rose for decorative lines, icons, and soft borders.
- Never use pink for small body text on ivory; contrast is insufficient for comfortable reading.
- Do not introduce random accent colours outside this palette. Functional status colours are the only exception.
- Never rely on colour alone to communicate appointment or payment status. Pair every status colour with text and an icon.

## 5. Typography

| Role | Font | Weights | Use |
|---|---|---|---|
| Editorial headings | Cormorant Garamond | 400, 500, 600, 700 | Hero, page titles, section titles, quotes |
| Body and interface | DM Sans | 400, 500, 600, 700 | Body, navigation, forms, buttons, tables, dashboards |
| Decorative script | Allura | 400 | Tagline and short signatures only |
| Bengali | Noto Sans Bengali | 400, 500, 600 | Bengali content and Bengali-language labels |

### Type scale

- Display XL: 72px / 1.05 desktop; 44–56px mobile.
- Display: 56px / 1.1.
- H1: 40px / 1.15.
- H2: 32px / 1.2.
- H3: 24px / 1.3.
- H4: 20px / 1.4.
- Body large: 18px / 1.65.
- Body: 16px / 1.6.
- Small: 14px / 1.5.
- Caption/label: 12px / 1.4, uppercase, 0.12em tracking.

### Typography rules

- Use Cormorant Garamond for editorial impact, not for dense interface text.
- Use DM Sans for anything that must be scanned quickly.
- Use Allura only for the tagline or a short signature. Never use it for navigation, labels, or paragraphs.
- Keep headings title case unless a design calls for a short uppercase eyebrow.
- Avoid negative tracking on Cormorant Garamond; use generous line height instead.
- Use `text-balance` on headings and `text-pretty` on longer body copy where supported.
- Bengali text must use Noto Sans Bengali and `lang="bn"` where appropriate.

## 6. Voice and tone

- Warm, assured, and personal.
- Editorial but never flowery or vague.
- Clear about actions and status.
- No exaggerated claims, invented statistics, fake testimonials, or false urgency.
- Use sentence case for interface copy.
- Buttons describe the action: “Explore services”, “Request appointment”, “Pay now”, “Cancel appointment”.
- Error messages explain what happened and what to do next.

## 7. Imagery

- Use warm, natural-light salon and beauty photography.
- Prefer close, human, tactile images: hair, skin, hands, calm salon details.
- Keep colour grading warm and soft; avoid harsh blue tones.
- Use an arched or softly rounded frame for editorial hero images.
- Always provide meaningful alt text.
- Do not use imagery that implies a service, result, or testimonial that is not real.
- Demo photography is acceptable during the design foundation phase and must be replaced with the salon's own photography before launch.

## 8. Accessibility commitments

- Maintain readable contrast for all text.
- Never use colour alone for status.
- Provide visible focus states and keyboard access.
- Use semantic HTML and real buttons and links.
- Label every form control.
- Respect reduced-motion preferences.
- Keep touch targets at least 44px on mobile.
- Use alt text for informative images and empty alt text for decorative images.

## 9. Placeholder content policy

The following values are placeholders until the salon supplies real details:

- Contact email: `hello@rupchorcha.com`
- Location: Dhaka, Bangladesh
- Opening hours: Saturday–Thursday, 9:00 AM–6:00 PM
- Service names, descriptions, prices, and images on the homepage are temporary demo data used to validate the design foundation.

Do not invent customer counts, ratings, years of experience, testimonials, or business claims. Replace demo service data with live Express/MongoDB data when the service catalogue is available.

## 10. Future agent rule

Every new page or component must:

1. Read this file and `DESIGN_SYSTEM.md`.
2. Use the RupChorcha name and the approved tokens.
3. Use the reusable `Logo` component rather than recreating the mark.
4. Avoid dead links, fake controls, and fabricated business data.
5. Follow the existing Tailwind v4, shadcn/Base UI, and Next.js 16 conventions.
