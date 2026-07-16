/** Ghost UI mockups for the landing benefits grid (EquineM-inspired). */

import type { ReactNode } from "react";

const lineSoft = {
  stroke: "currentColor",
  strokeWidth: 0.75,
  strokeOpacity: 0.28,
  vectorEffect: "non-scaling-stroke" as const,
};
const lineMid = { ...lineSoft, strokeOpacity: 0.42 };
const accentFill = { fill: "#000000", fillOpacity: 0.22 };
const accentStroke = { stroke: "#000000", strokeOpacity: 0.38, strokeWidth: 0.75 };

function WireframeShell({
  children,
  maxW = "280px",
  className = "",
}: {
  children: ReactNode;
  maxW?: string;
  className?: string;
}) {
  return (
    <div
      className={`landing-wireframe-mockup mx-auto w-full ${className}`}
      style={{ maxWidth: maxW }}
      aria-hidden
    >
      <svg
        viewBox="0 0 260 228"
        className="w-full h-auto text-[var(--landing-ink)]"
        fill="none"
        role="img"
        aria-label=""
      >
        <rect
          x="0.5"
          y="0.5"
          width="259"
          height="227"
          rx="4"
          style={{ fill: "color-mix(in srgb, var(--landing-ink) 3%, var(--landing-bg))" }}
          stroke="currentColor"
          strokeOpacity="0.22"
          strokeWidth="1"
        />
        {children}
      </svg>
    </div>
  );
}
/** Wireframe silhouette of the horse passport screen (line-art mockup). */
export function IllustrationHorseProfile() {
  const lineStrong = { ...lineSoft, strokeOpacity: 0.55 };
  const actionPill = {
    rx: 2,
    stroke: "currentColor",
    strokeWidth: 0.75,
    strokeOpacity: 0.34,
    fill: "currentColor",
    fillOpacity: 0.04,
  };

  return (
    <div className="landing-passport-mockup mx-auto w-full max-w-[300px]" aria-hidden>
      <svg
        viewBox="0 0 300 228"
        className="w-full h-auto text-[var(--landing-ink)]"
        fill="none"
        role="img"
        aria-label=""
      >
        {/* Toolbar above passport */}
        <rect x="0" y="6" width="54" height="2" rx="1" fill="currentColor" fillOpacity="0.18" />
        <rect x="118" y="3" width="30" height="9" {...actionPill} />
        <rect x="124" y="6.5" width="18" height="1.5" rx="0.5" fill="currentColor" fillOpacity="0.28" />
        <rect x="152" y="3" width="48" height="9" {...actionPill} />
        <rect x="158" y="6.5" width="36" height="1.5" rx="0.5" fill="currentColor" fillOpacity="0.28" />
        <rect x="204" y="3" width="28" height="9" {...actionPill} />
        <rect x="210" y="6.5" width="16" height="1.5" rx="0.5" fill="currentColor" fillOpacity="0.28" />
        <rect x="236" y="3" width="50" height="9" {...actionPill} />
        <rect x="242" y="6.5" width="38" height="1.5" rx="0.5" fill="currentColor" fillOpacity="0.22" />

        <g transform="translate(0, 18)">
          {/* Device / document frame */}
          <rect
            x="0.5"
            y="0.5"
            width="299"
            height="209"
            rx="5"
            style={{ fill: "color-mix(in srgb, var(--landing-ink) 3%, var(--landing-bg))" }}
            stroke="currentColor"
            strokeOpacity="0.22"
            strokeWidth="1"
          />

          {/* Passport header band */}
          <rect x="0.5" y="0.5" width="299" height="34" rx="5" fill="currentColor" fillOpacity="0.1" />
          <line x1="0.5" y1="34.5" x2="299.5" y2="34.5" {...lineMid} />
          <rect x="14" y="11" width="88" height="5" rx="1" fill="currentColor" fillOpacity="0.38" />
          <rect x="14" y="20" width="118" height="2.5" rx="1" fill="currentColor" fillOpacity="0.18" />
          <rect x="214" y="12" width="72" height="2.5" rx="1" fill="currentColor" fillOpacity="0.16" />
          <rect x="232" y="19" width="54" height="2.5" rx="1" fill="currentColor" fillOpacity="0.12" />

          {/* Section I title */}
          <rect x="14" y="44" width="156" height="3" rx="1" fill="currentColor" fillOpacity="0.3" />
          <line x1="14" y1="54" x2="286" y2="54" {...lineSoft} />

          {/* Photo column */}
          <rect x="14" y="62" width="62" height="82" {...lineMid} />
          <rect x="18" y="66" width="54" height="74" {...lineSoft} />
          <rect x="22" y="148" width="46" height="2" rx="1" fill="currentColor" fillOpacity="0.14" />

          {/* Identification rows */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((row) => {
            const y = 64 + row * 11.5;
            return (
              <g key={row}>
                <rect x="86" y={y} width={58 + (row % 3) * 8} height="2" rx="1" fill="currentColor" fillOpacity="0.22" />
                <rect x="198" y={y} width={72 - (row % 4) * 6} height="2" rx="1" fill="currentColor" fillOpacity="0.12" />
                <line x1="86" y1={y + 7.5} x2="286" y2={y + 7.5} {...lineSoft} />
              </g>
            );
          })}

          {/* Owner block + workload stat */}
          <line x1="14" y1="156" x2="286" y2="156" {...lineSoft} />
          <rect x="14" y="164" width="92" height="3" rx="1" fill="currentColor" fillOpacity="0.26" />
          {[0, 1, 2].map((row) => (
            <g key={`owner-${row}`}>
              <rect x="14" y={174 + row * 9} width={48 + row * 6} height="2" rx="1" fill="currentColor" fillOpacity="0.16" />
              <rect x="118" y={174 + row * 9} width={52 - row * 4} height="2" rx="1" fill="currentColor" fillOpacity="0.1" />
            </g>
          ))}

          <rect x="198" y="164" width="88" height="38" {...lineMid} />
          <rect x="206" y="172" width="52" height="2.5" rx="1" fill="currentColor" fillOpacity="0.18" />
          <rect x="206" y="182" width="34" height="6" rx="1" fill="currentColor" fillOpacity="0.1" />
          <rect x="244" y="182" width="34" height="6" rx="1" fill="currentColor" fillOpacity="0.1" />

          {/* Tabs */}
          <line x1="14" y1="206" x2="286" y2="206" {...lineStrong} />
          <rect x="14" y="198" width="78" height="2.5" rx="1" fill="currentColor" fillOpacity="0.34" />
          <line x1="14" y1="206" x2="92" y2="206" stroke="currentColor" strokeOpacity="0.55" strokeWidth="1.25" />
          <rect x="108" y="198" width="64" height="2.5" rx="1" fill="currentColor" fillOpacity="0.14" />
        </g>
      </svg>
    </div>
  );
}

export function IllustrationSessionLog() {
  const lineSoft = { stroke: "currentColor", strokeWidth: 0.75, strokeOpacity: 0.28, vectorEffect: "non-scaling-stroke" as const };
  const lineMid = { ...lineSoft, strokeOpacity: 0.42 };
  const fieldBox = {
    x: 14,
    width: 232,
    height: 11,
    rx: 1,
    stroke: "currentColor",
    strokeWidth: 0.75,
    strokeOpacity: 0.3,
    fill: "currentColor",
    fillOpacity: 0.04,
  };

  const Field = ({ y, labelW = 52, valueW = 68 }: { y: number; labelW?: number; valueW?: number }) => (
    <g>
      <rect x={14} y={y} width={labelW} height="1.5" rx="0.5" fill="currentColor" fillOpacity="0.22" />
      <rect y={y + 5} {...fieldBox} />
      <rect x={22} y={y + 9} width={valueW} height="1.5" rx="0.5" fill="currentColor" fillOpacity="0.16" />
      <path
        d={`M${14 + fieldBox.width - 10} ${y + 9.5}l3 3 3-3`}
        stroke="currentColor"
        strokeOpacity="0.22"
        strokeWidth="0.75"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );

  return (
    <div className="landing-session-mockup mx-auto w-full max-w-[280px]" aria-hidden>
      <svg
        viewBox="0 0 260 228"
        className="w-full h-auto text-[var(--landing-ink)]"
        fill="none"
        role="img"
        aria-label=""
      >
        <rect
          x="0.5"
          y="0.5"
          width="259"
          height="227"
          rx="4"
          style={{ fill: "color-mix(in srgb, var(--landing-ink) 3%, var(--landing-bg))" }}
          stroke="currentColor"
          strokeOpacity="0.22"
          strokeWidth="1"
        />

        {/* Header: avatar + title */}
        <circle cx="24" cy="18" r="7" {...lineMid} fill="currentColor" fillOpacity="0.06" />
        <rect x="36" y="12" width="96" height="3" rx="1" fill="currentColor" fillOpacity="0.34" />
        <rect x="36" y="19" width="132" height="2" rx="1" fill="currentColor" fillOpacity="0.14" />
        <line x1="14" y1="32" x2="246" y2="32" {...lineSoft} />

        <Field y={38} labelW={48} valueW={56} />
        <Field y={58} labelW={44} valueW={20} />
        <Field y={78} labelW={40} valueW={48} />
        <Field y={98} labelW={46} valueW={52} />
        <Field y={118} labelW={56} valueW={44} />

        {/* Notes */}
        <rect x={14} y={138} width={40} height="1.5" rx="0.5" fill="currentColor" fillOpacity="0.18" />
        <rect
          x={14}
          y={143}
          width={232}
          height={22}
          rx={1}
          stroke="currentColor"
          strokeWidth="0.75"
          strokeOpacity="0.3"
          fill="currentColor"
          fillOpacity="0.04"
        />
        <rect x={22} y={150} width={120} height="1.5" rx="0.5" fill="currentColor" fillOpacity="0.1" />
        <rect x={22} y={156} width={88} height="1.5" rx="0.5" fill="currentColor" fillOpacity="0.08" />

        {/* Actions */}
        <rect
          x={14}
          y={198}
          width={108}
          height={16}
          rx={1}
          stroke="currentColor"
          strokeWidth="0.75"
          strokeOpacity="0.32"
          fill="currentColor"
          fillOpacity="0.03"
        />
        <rect x={38} y={205} width={40} height="1.5" rx="0.5" fill="currentColor" fillOpacity="0.2" />

        <rect x={138} y={198} width={108} height={16} rx={1} fill="currentColor" fillOpacity="0.14" />
        <rect x={156} y={205} width={72} height="1.5" rx="0.5" fill="currentColor" fillOpacity="0.32" />
      </svg>
    </div>
  );
}

export function IllustrationWorkloadAlert() {
  const bars = [
    { x: 28, h: 52 },
    { x: 68, h: 78 },
    { x: 108, h: 108, alert: true },
    { x: 148, h: 64 },
    { x: 188, h: 44 },
  ];

  return (
    <WireframeShell>
      <rect x="14" y="12" width="88" height="3" rx="1" fill="currentColor" fillOpacity="0.32" />
      <rect x="14" y="19" width="120" height="2" rx="1" fill="currentColor" fillOpacity="0.14" />
      <line x1="14" y1="30" x2="246" y2="30" {...lineSoft} />

      {/* Chart area */}
      <line x1="24" y1="148" x2="232" y2="148" {...lineMid} />
      {[40, 80, 120].map((y) => (
        <line key={y} x1="24" y1={y} x2="232" y2={y} {...lineSoft} />
      ))}
      {bars.map((bar) => (
        <rect
          key={bar.x}
          x={bar.x}
          y={148 - bar.h}
          width={28}
          height={bar.h}
          rx={1}
          {...(bar.alert
            ? { ...accentFill, stroke: "#000000", strokeOpacity: 0.45, strokeWidth: 0.75 }
            : { fill: "currentColor", fillOpacity: 0.1, stroke: "currentColor", strokeOpacity: 0.22, strokeWidth: 0.75 })}
        />
      ))}

      {/* Day labels */}
      {bars.map((bar, i) => (
        <rect key={`lbl-${bar.x}`} x={bar.x + 6} y={154} width={16} height="1.5" rx="0.5" fill="currentColor" fillOpacity={i === 2 ? 0.28 : 0.12} />
      ))}

      {/* Warning banner */}
      <rect
        x="14"
        y="172"
        width="232"
        height="38"
        rx="2"
        fill="currentColor"
        fillOpacity="0.04"
        stroke="currentColor"
        strokeOpacity="0.28"
        strokeWidth="0.75"
      />
      <path
        d="M29 181l-7.5 13a1.2 1.2 0 001 1.8h15a1.2 1.2 0 001-1.8L30.5 181a1.2 1.2 0 00-2.1 0z"
        stroke="#000000"
        strokeOpacity="0.6"
        strokeWidth="0.75"
        fill="#000000"
        fillOpacity="0.14"
      />
      <path d="M29 186v3.5M29 192h.01" stroke="#000000" strokeOpacity="0.75" strokeWidth="0.9" strokeLinecap="round" />
      <rect x="44" y="182" width="108" height="2.5" rx="1" fill="currentColor" fillOpacity="0.28" />
      <rect x="44" y="190" width="148" height="1.5" rx="0.5" fill="currentColor" fillOpacity="0.14" />
      <rect x="44" y="196" width="96" height="1.5" rx="0.5" fill="currentColor" fillOpacity="0.1" />
    </WireframeShell>
  );
}

export function IllustrationRiders() {
  const rows = [
    { nameW: 72, subW: 48, badgeW: 28 },
    { nameW: 84, subW: 56, badgeW: 32 },
    { nameW: 64, subW: 44, badgeW: 24 },
  ];

  return (
    <WireframeShell maxW="260px">
      <rect x="14" y="12" width="72" height="3" rx="1" fill="currentColor" fillOpacity="0.32" />
      <rect x="178" y="11" width="68" height="9" rx="1" stroke="currentColor" strokeOpacity="0.28" strokeWidth="0.75" fill="currentColor" fillOpacity="0.04" />
      <rect x="188" y="14.5" width="48" height="1.5" rx="0.5" fill="currentColor" fillOpacity="0.2" />
      <line x1="14" y1="28" x2="246" y2="28" {...lineSoft} />

      {/* Table header */}
      <rect x="14" y="34" width="36" height="1.5" rx="0.5" fill="currentColor" fillOpacity="0.16" />
      <rect x="62" y="34" width="52" height="1.5" rx="0.5" fill="currentColor" fillOpacity="0.16" />
      <rect x="188" y="34" width="40" height="1.5" rx="0.5" fill="currentColor" fillOpacity="0.16" />
      <line x1="14" y1="42" x2="246" y2="42" {...lineMid} />

      {rows.map((row, i) => {
        const y = 50 + i * 54;
        return (
          <g key={i}>
            <circle cx="32" cy={y + 16} r="12" {...lineMid} fill="currentColor" fillOpacity="0.06" />
            <rect x="26" y={y + 10} width="12" height="1.5" rx="0.5" fill="currentColor" fillOpacity="0.12" />
            <rect x="54" y={y + 8} width={row.nameW} height="2.5" rx="1" fill="currentColor" fillOpacity="0.3" />
            <rect x="54" y={y + 16} width={row.subW} height="1.5" rx="0.5" fill="currentColor" fillOpacity="0.14" />
            <rect x="54" y={y + 24} width={row.subW - 8} height="1.5" rx="0.5" fill="currentColor" fillOpacity="0.1" />
            <rect
              x="188"
              y={y + 10}
              width={row.badgeW}
              height="10"
              rx="5"
              fill="currentColor"
              fillOpacity="0.08"
              stroke="currentColor"
              strokeOpacity="0.22"
              strokeWidth="0.75"
            />
            <rect x={192} y={y + 14} width={row.badgeW - 8} height="1.5" rx="0.5" fill="currentColor" fillOpacity="0.18" />
            {i < rows.length - 1 ? <line x1="14" y1={y + 44} x2="246" y2={y + 44} {...lineSoft} /> : null}
          </g>
        );
      })}
    </WireframeShell>
  );
}

export function IllustrationHealth() {
  const entries = [
    { typeW: 36, descW: 88, cost: true },
    { typeW: 44, descW: 72, cost: false },
    { typeW: 32, descW: 96, cost: true },
  ];

  return (
    <WireframeShell>
      <rect x="14" y="12" width="96" height="3" rx="1" fill="currentColor" fillOpacity="0.32" />
      <rect x="168" y="10" width="78" height="11" rx="1" fill="currentColor" fillOpacity="0.12" />
      <rect x="182" y="14.5" width="50" height="1.5" rx="0.5" fill="currentColor" fillOpacity="0.28" />
      <line x1="14" y1="30" x2="246" y2="30" {...lineSoft} />

      {entries.map((entry, i) => {
        const y = 40 + i * 58;
        return (
          <g key={i}>
            <rect
              x="14"
              y={y}
              width="232"
              height="46"
              rx="2"
              stroke="currentColor"
              strokeOpacity="0.24"
              strokeWidth="0.75"
              fill="currentColor"
              fillOpacity="0.03"
            />
            <rect x="22" y={y + 8} width={entry.typeW} height="2.5" rx="1" fill="currentColor" fillOpacity="0.32" />
            <rect x="22" y={y + 16} width={entry.descW} height="1.5" rx="0.5" fill="currentColor" fillOpacity="0.14" />
            <rect x="22" y={y + 22} width={entry.descW - 16} height="1.5" rx="0.5" fill="currentColor" fillOpacity="0.1" />
            <rect x="178" y={y + 8} width="52" height="1.5" rx="0.5" fill="currentColor" fillOpacity="0.12" />
            {entry.cost ? (
              <rect x="196" y={y + 18} width="36" height="2" rx="1" fill="currentColor" fillOpacity="0.22" />
            ) : (
              <rect x="206" y={y + 18} width="24" height="1.5" rx="0.5" fill="currentColor" fillOpacity="0.1" />
            )}
            {i === 0 ? (
              <circle cx="28" cy={y + 34} r="3" {...accentStroke} fill="#000000" fillOpacity="0.18" />
            ) : null}
          </g>
        );
      })}
    </WireframeShell>
  );
}

export function IllustrationSchedule() {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const bookings = [
    { col: 1, row: 0, h: 2 },
    { col: 3, row: 1, h: 1 },
    { col: 5, row: 0, h: 3 },
  ];

  return (
    <WireframeShell maxW="270px">
      <rect x="14" y="12" width="104" height="3" rx="1" fill="currentColor" fillOpacity="0.32" />
      <rect x="196" y="11" width="50" height="9" rx="1" stroke="currentColor" strokeOpacity="0.24" strokeWidth="0.75" fill="currentColor" fillOpacity="0.04" />
      <line x1="14" y1="28" x2="246" y2="28" {...lineSoft} />

      {/* Day headers */}
      {days.map((_, i) => (
        <g key={i}>
          <rect x={18 + i * 32} y="34" width="10" height="1.5" rx="0.5" fill="currentColor" fillOpacity="0.18" />
          <rect x={14 + i * 32} y="42" width="24" height="1" rx="0.5" fill="currentColor" fillOpacity="0.08" />
        </g>
      ))}

      {/* Calendar grid */}
      <rect x="14" y="50" width="224" height="132" rx="2" stroke="currentColor" strokeOpacity="0.22" strokeWidth="0.75" fill="currentColor" fillOpacity="0.02" />
      {Array.from({ length: 6 }).map((_, row) => (
        <line key={`row-${row}`} x1="14" y1={74 + row * 22} x2="238" y2={74 + row * 22} {...lineSoft} />
      ))}
      {Array.from({ length: 6 }).map((_, col) => (
        <line key={`col-${col}`} x1={46 + col * 32} y1="50" x2={46 + col * 32} y2="182" {...lineSoft} />
      ))}

      {bookings.map((b, i) => (
        <rect
          key={i}
          x={16 + b.col * 32}
          y={52 + b.row * 22}
          width="28"
          height={b.h * 22 - 4}
          rx="1"
          {...(i === 1 ? accentFill : { fill: "currentColor", fillOpacity: 0.1 })}
          stroke={i === 1 ? "#000000" : "currentColor"}
          strokeOpacity={i === 1 ? 0.4 : 0.2}
          strokeWidth="0.75"
        />
      ))}
      <rect x="50" y="56" width="18" height="1.5" rx="0.5" fill="currentColor" fillOpacity="0.2" />
      <rect x="114" y="80" width="22" height="1.5" rx="0.5" fill="currentColor" fillOpacity="0.2" />
      <rect x="178" y="56" width="20" height="1.5" rx="0.5" fill="currentColor" fillOpacity="0.2" />

      {/* Legend */}
      <rect x="14" y="192" width="12" height="12" rx="1" {...accentFill} stroke="#000000" strokeOpacity="0.35" strokeWidth="0.75" />
      <rect x="32" y="197" width="56" height="1.5" rx="0.5" fill="currentColor" fillOpacity="0.14" />
      <rect x="110" y="192" width="12" height="12" rx="1" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeOpacity="0.2" strokeWidth="0.75" />
      <rect x="128" y="197" width="48" height="1.5" rx="0.5" fill="currentColor" fillOpacity="0.14" />
    </WireframeShell>
  );
}

export const FEATURE_ILLUSTRATIONS = [
  IllustrationHorseProfile,
  IllustrationSessionLog,
  IllustrationWorkloadAlert,
  IllustrationRiders,
  IllustrationHealth,
  IllustrationSchedule,
] as const;
