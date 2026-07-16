---
name: brand-identity
description: >-
  Designs logos, wordmarks, symbol systems, and complete brand guidelines—color,
  type, voice, spacing, asset specs, and codebase token integration. Use when
  creating or refining a logo, wordmark, favicon, brand book, style guide, visual
  identity, brand refresh, OG/social assets, or when the user mentions branding,
  brand guidelines, logo design, mark, lockup, or brand system.
---

# Brand Identity & Logo (Saddle Up)

Read the full workflow in the personal skill first, then apply this project's snapshot.

**Canonical workflow:** [`~/.agents/skills/brand-identity/SKILL.md`](../../../../.agents/skills/brand-identity/SKILL.md)  
**Templates:** [templates.md](templates.md) (project copy) + personal `templates.md`

Pair with **elite-ui-design** for UI implementation.

## Saddle Up — current identity snapshot

| Token | Value | Notes |
|-------|-------|-------|
| Ink | `#000000` | `--brand-ink`, dark app bg, light mode type |
| Mist | `#ffffff` | `--brand-mist`, light marketing bg, dark mode type |
| Display / wordmark | Fraunces | Uppercase, `tracking-[0.22em]` — see `TextLogo` |
| UI sans | Outfit | Body, labels, UI |
| Arabic | Tajawal | `html[lang="ar"]` stacks |
| System | Two-color | Legacy names (`forest`, `brass`, `paddock`) alias to ink/mist |

### Positioning (working)

**Saddle Up** — horse & stable management for GCC operators: calm authority, photo-led editorial marketing, dark in-app shell, light landing via `.landing-page`.

### Logo today

- **Wordmark-only** in [`components/brand/TextLogo.tsx`](../../../components/brand/TextLogo.tsx)
- No standalone symbol yet — if adding one, favicon legibility is the gate

### Code anchors

| Concern | Path |
|---------|------|
| CSS tokens | [`app/globals.css`](../../../app/globals.css) |
| Tailwind colors | [`tailwind.config.js`](../../../tailwind.config.js) |
| Wordmark | [`components/brand/TextLogo.tsx`](../../../components/brand/TextLogo.tsx) |
| Marketing hero / CTAs | `app/globals.css` `.landing-*` |
| Auth chrome | [`components/landing/AuthShell.tsx`](../../../components/landing/AuthShell.tsx) |
| PDF brand colors | [`lib/generateMonthlyReportPdf.ts`](../../../lib/generateMonthlyReportPdf.ts) |
| Fonts | [`app/layout.tsx`](../../../app/layout.tsx) Fraunces + Outfit + Tajawal |

### Identity rules for this repo

1. **Never introduce a third brand hue** without explicit user approval — extend ink/mist with opacity/`color-mix` only.
2. **Marketing stays light** under `html.dark` via `.landing-page` overrides.
3. **App stays dark** — reversed lockups = mist type on ink panels; primary CTA = mist fill / ink text.
4. **Bilingual** — logo lockups must document EN + AR nav/footer behavior (Tajawal for Arabic headings).
5. **Photo-led** — hero scrim uses ink rgba, not colored gradients.

## When user asks for “perfect logo” here

1. Run the 9-step checklist from the personal skill.
2. Default creative territory for Saddle Up:
   - **A — Refined wordmark** (tighten Fraunces tracking, optional rule underline)
   - **B — Stirrup monogram** (single-path favicon-friendly symbol + wordmark)
   - **C — Editorial split** (“Saddle” / “Up” two-line stacked for square avatars)
3. Implement winners in `components/brand/`, update `public/` favicons, sync tokens in `globals.css` + `tailwind.config.js`.
4. Add or update `docs/BRAND.md` using [templates.md](templates.md).
5. Grep repo for stale hex (`#1f4d3a`, `#b8a07a`, `#c9a87c`, etc.) after token changes.

## Quality gate (Saddle Up)

- [ ] `TextLogo` / new `Logo` works in Navbar (light + dark) and AuthShell
- [ ] Favicon readable beside Chrome tab titles
- [ ] `landing-hero` reversed CTA contrast passes
- [ ] Monthly report PDF uses same ink/mist constants as CSS
- [ ] analytics-docs skill palette section matches (if present)

## Additional resources

- [templates.md](templates.md) — brief + guidelines skeleton
- [elite-ui-design](~/.agents/skills/elite-ui-design/SKILL.md) — UI execution
