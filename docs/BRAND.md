# Saddle Up — Brand Guidelines

Version 1.0 · July 2026

Operational reference for product, marketing, and exports. Tokens in code are the source of truth.

---

## 1. Brand foundation

### Positioning

**Saddle Up** helps stable owners and managers in the GCC run bookings, horses, and daily operations in one calm system — without spreadsheets, scattered WhatsApp threads, or generic SaaS clutter.

| Field | Value |
|-------|-------|
| **Display name** | Saddle Up |
| **Category** | Horse & stable management software |
| **Audience** | Stable owners, managers, trainers (riders secondary) |
| **Territory** | GCC — Saudi Arabia primary |
| **URL** | [saddleup-sa.com](https://www.saddleup-sa.com) |

### Personality

| We are | We are not |
|--------|------------|
| Calm | Flashy or loud |
| Capable | Childish or playful |
| Grounded | Generic startup SaaS |
| Editorial | Stock-photo cliché |
| Bilingual-ready | English-only afterthought |

### Tagline (working)

Run your yard in one place.

---

## 2. Logo

### Creative direction

**Stirrup mark + Fraunces wordmark** — Direction B from the identity brief. The symbol abstracts a stirrup (bail arch + tread opening): one idea, favicon-safe, no horse clip art.

### Variants

| Variant | File / component | Use |
|---------|------------------|-----|
| **Primary lockup** | `public/brand/logo-primary.svg` · `<Logo variant="full" />` | Nav, headers, auth chrome |
| **Wordmark only** | `public/brand/logo-wordmark.svg` · `variant="wordmark"` | Narrow text-only contexts |
| **Symbol only** | `public/brand/logo-symbol.svg` · `variant="symbol"` | Favicon source, avatars, watermarks |
| **Stacked** | `public/brand/logo-stacked.svg` · `variant="stacked"` | Square social avatars, app splash |
| **Reversed** | `public/brand/logo-reversed.svg` | Photography, dark bands (mist on ink) |
| **App icon** | `public/brand/logo-app-icon.svg` · `app/icon.svg` | Browser tab, PWA, Apple touch |

### Clear space

Minimum clear space on all sides = **cap height of “S”** in the wordmark (or full symbol width when symbol-only).

```
        ┌─── clear ───┐
        │   ┌─────┐   │
 clear  │   │  ◇  │   │  clear
        │   └─────┘   │
        │  SADDLE UP  │
        └─── clear ───┘
```

### Minimum size

| Asset | Minimum |
|-------|---------|
| Full lockup (digital) | 120px wide |
| Wordmark only | 80px wide |
| Symbol only | 16×16px (favicon) |

### Color usage on surfaces

| Surface | Lockup |
|---------|--------|
| Light marketing (`.landing-page`) | Ink symbol + ink wordmark |
| Dark app shell | Mist symbol + mist wordmark (`text-white/95`, `text-mist`) |
| Photo hero | Reversed lockup over ink scrim |

### Misuse — do not

- Stretch, skew, or rotate the lockup
- Change ink/mist to other hues (no green, brass, or terracotta accents on the mark)
- Add drop shadows, glows, gradients, or outlines to the logo
- Place the full lockup on busy photography without the standard ink scrim
- Use the stirrup symbol with a different typeface for “Saddle Up”
- Crop the symbol or separate the tread from the bail
- Use horse silhouettes, horseshoes, or clip-art alongside the primary mark

---

## 3. Color

### Core pair (only brand hues)

| Token | Hex | Role |
|-------|-----|------|
| **Ink** | `#000000` | Primary type, dark surfaces, primary buttons (marketing) |
| **Mist** | `#FFFFFF` | Light surfaces, reversed type, primary CTA fill on dark |

Semantic UI states (success, warning, error) may use standard system colors. **Do not introduce a third brand accent** without explicit approval — extend ink/mist with opacity and `color-mix` only.

### CSS variables

```css
:root {
  --brand-ink: #000000;
  --brand-mist: #ffffff;
  --text-primary: var(--brand-ink);
  --bg-main: var(--brand-mist);
}
```

Legacy names (`forest`, `brass`, `paddock`, `racing`) alias to **ink** in `app/globals.css` and `tailwind.config.js`.

### Dark application (in-app)

| Token | Value |
|-------|-------|
| App background | `bg-base` → `#0E1512` |
| Card / elevated | `#161B18` / `#1A201C` (ink mixes) |
| Primary text | Mist or `text-white/95` |
| Primary CTA | Mist fill, ink text |

### Light application (marketing)

Marketing pages use `.landing-page` overrides so heroes and bands stay **light** even when `html.dark` is set globally.

### Accessibility

| Pair | Ratio | Use |
|------|-------|-----|
| Ink on Mist | ~15.8:1 | Body text, labels |
| Mist on Ink | ~15.8:1 | Reversed nav, CTAs on dark |
| Ink at 65% on Mist | ~7:1 | Muted secondary text |

---

## 4. Typography

| Role | Latin | Arabic | Weight | Tracking |
|------|-------|--------|--------|----------|
| Wordmark | Fraunces | Tajawal (AR nav) | 500 | `0.22em`, uppercase |
| Display / H1 | Fraunces | Tajawal | 400–600 | tight |
| UI body | Outfit | Tajawal | 400–500 | normal |
| Labels / caps | Outfit | Tajawal | 500 | `0.18–0.22em` |

### Web scale (marketing)

| Level | Size | Font |
|-------|------|------|
| Hero H1 | `text-4xl` → `text-5xl` | Fraunces |
| Section H2 | `text-2xl` → `text-3xl` | Fraunces |
| Body | `text-sm` → `text-base` | Outfit |
| Eyebrow | `text-[0.65rem]` uppercase | Outfit |

### Bilingual

- `html[lang="ar"]` stacks Tajawal ahead of Outfit/Fraunces (`app/globals.css`).
- Logo wordmark stays **Latin “Saddle Up”** in chrome; Arabic product name appears in body copy and meta, not inside the mark.
- RTL layouts mirror nav; logo remains LTR.

---

## 5. Layout & spacing

| Token | Value |
|-------|-------|
| Max content width | `max-w-6xl` (marketing), `max-w-[22rem]` (auth forms) |
| Section padding | `py-16 sm:py-20` |
| Control radius | `8px` (`--radius`, `rounded-control`) |
| Hairline borders | `rgba(14, 21, 18, 0.12)` light · `white/10` dark |

---

## 6. Voice & messaging

### Tone

1. **Direct** — say what the product does; no filler.
2. **Calm** — confident, never urgent or salesy.
3. **Operational** — speak to yard managers, not hobbyists.

### Examples

| Context | Do | Don't |
|---------|-----|-------|
| CTA | “Start free” | “Unlock your potential!” |
| Error | “Couldn’t save. Try again.” | “Oops! Something went wrong!!!” |
| Empty state | “No incidents this month.” | “You're all caught up! 🎉” |
| Hero | “Run bookings, horses, and ops in one place.” | “The #1 AI-powered horse platform” |

---

## 7. Imagery

- **Subjects:** Real yards, horses in work, trainers with riders, stable detail (tack, gates, arenas).
- **Crop bias:** Center-weighted; leave headline safe zone (left third on auth hero).
- **Overlay scrim:** `linear-gradient(105deg, rgba(14,21,18,0.72) 0%, rgba(14,21,18,0.35) 55%, rgba(14,21,18,0.15) 100%)`
- **Avoid:** Generic galloping silhouettes, western ranch clichés, oversaturated filters, purple gradients.

---

## 8. Motion

| Allowed | Spec |
|---------|------|
| Fade-up on scroll | `--ease-out-expo`, `--dur-normal` |
| Hover opacity | `transition-opacity`, 150ms |
| Menu slide | `translate-x`, 300ms ease-out |

Respect `prefers-reduced-motion: reduce` — disable transforms; keep opacity instant.

**Forbidden:** Bounce loops, parallax on data tables, decorative horse animations.

---

## 9. Product UI

| Element | Spec |
|---------|------|
| Primary button (dark) | `bg-paddock text-mist` → ink fill, mist label |
| Primary button (light CTA) | `bg-accent text-mist` |
| Secondary | Border `black/20` or `white/15`, transparent fill |
| Focus ring | `.su-focus-ring` |
| Cards | `PixelCard` / `bg-card` with hairline border |

---

## 10. Asset index

| File | Path |
|------|------|
| Logo component | `components/brand/Logo.tsx` |
| Symbol path (shared) | `components/brand/symbolPath.ts` |
| TextLogo alias | `components/brand/TextLogo.tsx` |
| CSS tokens | `app/globals.css` |
| Tailwind colors | `tailwind.config.js` |
| Favicon | `app/icon.svg` |
| Brand SVGs | `public/brand/` |
| PDF colors | `lib/generateMonthlyReportPdf.ts` → `REPORT` |
| Fonts | `app/layout.tsx` |

### `public/brand/` inventory

| File | Description |
|------|-------------|
| `logo-primary.svg` | Horizontal lockup, ink on transparent |
| `logo-reversed.svg` | Horizontal lockup, mist on ink band |
| `logo-wordmark.svg` | Fraunces wordmark only |
| `logo-symbol.svg` | Stirrup mark, ink |
| `logo-symbol-reversed.svg` | Stirrup mark, mist |
| `logo-symbol-app.svg` | App icon tile (ink bg + mist mark) |
| `logo-app-icon.svg` | Same as symbol-app (alias) |
| `logo-stacked.svg` | Symbol above two-line wordmark |

---

## Changelog

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | Jul 2026 | Stirrup mark system, two-color ink/mist, full asset package |
