---
name: analytics-docs
description: >-
  Designs and generates analytics-grade product documents and PDFs—monthly
  reports, stable ops summaries, passport exports, and owner digests—with KPI
  summary pages, clear hierarchy, and honest empty states. Use when building or
  improving monthly reports, PDF generators (jsPDF), report APIs, dashboards that
  export documents, analytics summaries, or when the user mentions monthly
  report, PDF report, ops digest, or analytics documentation.
---

# Analytics Docs

Produce documents operators trust: scannable, metric-first, brand-aligned, never raw dump tables.

## When to apply

- Creating or redesigning report PDFs (`jsPDF`, export routes)
- Monthly / weekly / quarterly stable summaries
- Any owner-facing doc with counts, trends, or period comparisons
- Reviewing `lib/generateMonthlyReportPdf.ts`, `lib/generatePassportPdf.ts`, or `/api/reports/*`

## Non-negotiables

1. **KPIs before rows** — First content page is a summary: 4–8 metrics with labels + period context. Detail tables come after.
2. **One job per section** — One heading, one short lead if needed, then data.
3. **Derived insight** — Prefer rates/averages where raw counts alone mislead (e.g. lessons completed %, avg session minutes, incidents per 100 sessions).
4. **Empty is calm** — “No incidents this month.” never looks like an error.
5. **Period honesty** — Always show stable name, period label, timezone/date of generation.
6. **Confidential footer** — Every page or last page: product · report type · stable · period · Confidential.
7. **Brand tokens** — Saddle Up two-color system (ink + mist only):
   - Black `#000000` — headers, rules, primary type on light paper
   - White `#ffffff` — reversed type on black bands, paper background
   - Muted secondary: ink at ~45–65% opacity or mid mix `[110, 118, 112]`
   - Legacy names (`forest`, `brass`, `paddock`, `racing`) resolve to ink — do not reintroduce green/brass accents

## Document spine (every analytics PDF)

```
Cover / header band
→ Executive KPI strip (required)
→ Narrative section blocks (tables/lists)
→ Optional notes / methodology line
→ Confidential footer
```

### KPI strip (required)

Compute before render. Typical monthly stable set:

| Metric | Formula / source |
|--------|------------------|
| Lessons & bookings | count of bookings in period |
| Completed rate | completed ÷ (completed + cancelled + no-show) if statuses exist |
| Training minutes | sum of session durations (exclude rest) |
| Sessions logged | punch count |
| New members | profiles created in period |
| New riders | riders created in period |
| New horses | horses created in period |
| Incidents | incident count (call out serious separately) |
| Competitions | event count |

Show **MoM delta** when prior-period data is cheap to fetch (↑/↓ absolute or %). Skip delta rather than inventing it.

### Section order (monthly default)

1. KPI summary  
2. Classes & lessons  
3. Training workload  
4. People (new members / riders)  
5. Horses  
6. Incidents  
7. Competitions  

Reorder only if the audience is different (e.g. trainer digest → training first).

## Visual craft (jsPDF)

- **Page:** A4 portrait, margin ≥14mm, max content width consistent.
- **Header band:** Ink fill, mist title; stable + period on band; generation date muted.
- **KPI cards:** 2×2 or 4-across light panels on mist paper; ink hairline under headers—not heavy cages.
- **Tables:** Bold column headers once; ink rule under header; 6–7mm row pitch; truncate long cells with ellipsis; wrap description fields.
- **Pagination:** Never orphan a section title alone at page bottom; reserve ~20mm footer.
- **Type:** Helvetica/default OK in jsPDF (no web fonts unless embedded). Title 16–18pt, section 11–12pt bold, body 9pt, muted 8pt.
- **No emoji** as section icons.

Shared helpers belong in `lib/` (colors, `addPageIfNeeded`, table header, KPI tile)—do not copy-paste hex across files.

## Analytics quality bar

Before shipping a generator change, verify:

- [ ] KPIs match filtered dataset (same date bounds as tables)
- [ ] Time filters use stable-local dates if product stores local dates; document UTC vs local in a one-line footnote when ambiguous
- [ ] Statuses/roles mapped via labels (not raw enums)
- [ ] Owner-only (or correct role) on the API
- [ ] Empty sections still render with calm copy
- [ ] Filename: `monthly-report-{stable}-{YYYY}-{MM}.pdf` (slugify stable safely)

## API + UI checklist

- Route: authorize → validate `year`/`month` → fetch period → **also prior period for deltas if adding KPIs** → map DTO → `generate*Pdf` → `application/pdf` + Content-Disposition  
- UI: month/year controls, loading “Generating…”, blob download, calm error string  
- i18n: title/lead/buttons in `en.ts` / `ar.ts` (PDF body may stay EN until bilingual PDF is explicitly requested)

## Anti-patterns

- Dumping every row with no summary page  
- Purple/glow “dashboard PDF” aesthetics  
- Incomplete months labeled as complete without saying so  
- Mixing timezone edges so “new members” disagree with UI lists  
- Decorative charts that aren’t readable in print (sparks OK; 3D pie never)

## Saddle Up anchors

- Generator: [`lib/generateMonthlyReportPdf.ts`](../../../lib/generateMonthlyReportPdf.ts)
- API: [`app/api/reports/monthly/route.ts`](../../../app/api/reports/monthly/route.ts)
- UI: [`components/dashboard/MonthlyReportDownload.tsx`](../../../components/dashboard/MonthlyReportDownload.tsx)
- Passport PDF sibling: [`lib/generatePassportPdf.ts`](../../../lib/generatePassportPdf.ts)

For layout recipes and KPI tile pseudocode, see [templates.md](templates.md).
