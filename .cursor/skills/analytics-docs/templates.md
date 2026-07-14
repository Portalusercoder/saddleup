# Analytics doc templates

## jsPDF color tokens (Saddle Up)

```ts
export const REPORT = {
  forest: [14, 21, 18] as const,
  base: [12, 16, 14] as const,
  mist: [232, 236, 231] as const,
  paper: [244, 246, 243] as const,
  racing: [31, 77, 58] as const,
  paddock: [143, 174, 152] as const,
  brass: [184, 160, 122] as const,
  muted: [110, 118, 112] as const,
};
```

## KPI tile helper (sketch)

```ts
function drawKpiTile(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  value: string,
  delta?: string // e.g. "+12% vs prior"
) {
  doc.setFillColor(...REPORT.paper);
  doc.setDrawColor(...REPORT.brass);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, w, h, 1.5, 1.5, "FD");
  doc.setTextColor(...REPORT.muted);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(label.toUpperCase(), x + 3, y + 5);
  doc.setTextColor(...REPORT.forest);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(value, x + 3, y + 14);
  if (delta) {
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...REPORT.racing);
    doc.text(delta, x + 3, y + h - 3);
  }
}
```

## Cover band

```
[Forest rect full width ~28–32mm]
  LEFT:  REPORT TITLE (mist, 16–18pt bold)
         Stable name (mist 10pt)
         Period label (mist 9pt)
  RIGHT: Generated {full date} (mist 8pt)
```

## Section block

```
{n}. {Title}          12pt bold forest
[optional one-line lead in muted 8pt]
Column headers         8–9pt bold
Brass rule
Rows                   8–9pt, 6mm pitch
Empty → muted sentence
+12mm before next section
```

## MoM delta

When prior period counts exist:

```
deltaLabel(current, prior) →
  prior === 0 && current === 0 → omit
  prior === 0 → "new"
  else → `${pct >= 0 ? "+" : ""}${pct}% vs prior`
```

Never invent prior data.

## Markdown analytics brief (non-PDF)

Use when the deliverable is chat/canvas, not binary PDF:

```markdown
# {Stable} — {Period} ops brief

## At a glance
| Metric | Value | vs prior |
|--------|-------|----------|
| … | … | … |

## What moved
- 1–3 bullets with numbers

## Watch items
- Incidents / overworked horses / pending bookings

## Detail
### Classes
…
```
