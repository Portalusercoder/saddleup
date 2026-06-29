/** Ghost UI mockups for the landing benefits grid (EquineM-inspired). */

const ghostStroke = "stroke-current text-[var(--landing-ink)] opacity-[0.22]";
const ghostFill = "fill-current text-[var(--landing-ink)] opacity-[0.08]";
const ghostMuted = "stroke-current text-[var(--landing-ink)] opacity-[0.14]";

/** Wireframe silhouette of the horse passport screen (line-art mockup). */
export function IllustrationHorseProfile() {
  const lineSoft = { stroke: "currentColor", strokeWidth: 0.75, strokeOpacity: 0.28, vectorEffect: "non-scaling-stroke" as const };
  const lineMid = { ...lineSoft, strokeOpacity: 0.42 };
  const lineStrong = { ...lineSoft, strokeOpacity: 0.55 };

  return (
    <div className="landing-passport-mockup mx-auto w-full max-w-[300px]" aria-hidden>
      <svg
        viewBox="0 0 300 210"
        className="w-full h-auto text-[var(--landing-ink)]"
        fill="none"
        role="img"
        aria-label=""
      >
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
        {/* Horse head silhouette */}
        <path
          d="M36 118c2-14 10-24 22-26 8-1 14 2 18 8 5-3 12-2 16 3 5 6 3 14-3 18 3 7-1 14-8 16-4 10-13 17-24 17-14 0-25-11-25-25 0-4 1-8 4-11z"
          fill="currentColor"
          fillOpacity="0.07"
          stroke="currentColor"
          strokeOpacity="0.35"
          strokeWidth="0.85"
        />
        <path
          d="M58 86c3 4 4 9 2 13M44 92c-2 3-2 7 0 10"
          stroke="currentColor"
          strokeOpacity="0.28"
          strokeWidth="0.75"
          strokeLinecap="round"
        />
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
      </svg>
    </div>
  );
}

export function IllustrationSessionLog() {
  return (
    <div className="w-full max-w-[280px] mx-auto" aria-hidden>
      <div className="grid grid-cols-3 gap-2 mb-2">
        {["Mon", "Tue", "Wed"].map((d) => (
          <div key={d} className="text-[0.55rem] uppercase tracking-wider landing-ink-dim text-center">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2].map((col) => (
          <div key={col} className="space-y-1.5">
            <div className={`h-7 rounded-md ${ghostFill}`} />
            <div className={`h-5 rounded-md ${ghostFill} opacity-60`} />
            {col === 1 && <div className={`h-6 rounded-md border ${ghostStroke}`} style={{ borderColor: "color-mix(in srgb, var(--landing-ink) 20%, transparent)" }} />}
          </div>
        ))}
      </div>
    </div>
  );
}

export function IllustrationWorkloadAlert() {
  return (
    <div className="w-full max-w-[240px] mx-auto space-y-3" aria-hidden>
      <div className="flex items-end gap-2 h-16">
        {[40, 65, 88, 55].map((h, i) => (
          <div
            key={i}
            className={`flex-1 rounded-t-sm ${i === 2 ? "bg-accent/25 border border-accent/30" : ghostFill}`}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${ghostStroke}`} style={{ borderColor: "color-mix(in srgb, var(--landing-ink) 16%, transparent)" }}>
        <svg className={`w-3.5 h-3.5 ${ghostStroke}`} viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
          <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
          <path d="M10.29 3.86 1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        <div className={`h-1.5 flex-1 rounded ${ghostFill}`} />
      </div>
    </div>
  );
}

export function IllustrationRiders() {
  return (
    <div className="w-full max-w-[220px] mx-auto space-y-2.5" aria-hidden>
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <div className={`h-8 w-8 shrink-0 rounded-full ${ghostFill}`} />
          <div className="flex-1 space-y-1.5">
            <div className={`h-1.5 rounded ${ghostFill}`} style={{ width: `${55 + i * 10}%` }} />
            <div className={`h-1 rounded ${ghostFill} opacity-70`} style={{ width: "40%" }} />
          </div>
          <div className={`h-4 w-8 rounded-full ${ghostFill}`} />
        </div>
      ))}
    </div>
  );
}

export function IllustrationHealth() {
  return (
    <div className="flex items-end justify-center gap-6 w-full max-w-[260px] mx-auto" aria-hidden>
      <div className="flex gap-3 pb-1">
        {[
          "M12 8v8M8 12h8",
          "M6 18V8l6-4 6 4v10",
          "M9 14h6",
        ].map((d, i) => (
          <svg key={i} className={`w-7 h-7 ${ghostMuted}`} viewBox="0 0 24 24" fill="none" strokeWidth="1.25">
            {i === 0 && <path d={d} strokeLinecap="round" />}
            {i === 1 && (
              <>
                <path d="M8 4h8v16H8z" />
                <path d="M10 8h4M10 12h4" strokeLinecap="round" />
              </>
            )}
            {i === 2 && <rect x="5" y="8" width="14" height="10" rx="2" />}
          </svg>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-1">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className={`h-2.5 w-2.5 rounded-sm ${[2, 5, 9].includes(i) ? "bg-accent/30" : ghostFill}`}
          />
        ))}
      </div>
    </div>
  );
}

export function IllustrationSchedule() {
  return (
    <div className="w-full max-w-[260px] mx-auto" aria-hidden>
      <div className="flex justify-center gap-4 mb-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`h-6 w-6 rounded ${ghostFill}`} />
        ))}
      </div>
      <div className="grid grid-cols-4 gap-1.5 mb-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className={`aspect-square rounded-sm ${i === 3 || i === 6 ? "bg-accent/25 border border-accent/25" : ghostFill}`}
          />
        ))}
      </div>
      <div className="flex justify-end">
        <div className={`h-6 w-16 rounded-full border ${ghostStroke}`} style={{ borderColor: "color-mix(in srgb, var(--landing-ink) 22%, transparent)" }} />
      </div>
    </div>
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
