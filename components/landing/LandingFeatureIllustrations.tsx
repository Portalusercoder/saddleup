/** Ghost UI mockups for the landing benefits grid (EquineM-inspired). */

const ghostStroke = "stroke-current text-[var(--landing-ink)] opacity-[0.22]";
const ghostFill = "fill-current text-[var(--landing-ink)] opacity-[0.08]";
const ghostMuted = "stroke-current text-[var(--landing-ink)] opacity-[0.14]";

export function IllustrationHorseProfile() {
  return (
    <div className="mx-auto w-full max-w-[168px]" aria-hidden>
      <div
        className="rounded-[1.25rem] border p-2"
        style={{ borderColor: "color-mix(in srgb, var(--landing-ink) 18%, transparent)" }}
      >
        <div className="rounded-xl border p-3" style={{ borderColor: "color-mix(in srgb, var(--landing-ink) 12%, transparent)" }}>
          <div className={`h-8 w-8 rounded-full ${ghostFill} mb-3`} />
          <div className={`h-1.5 w-16 rounded ${ghostFill} mb-4`} />
          {["General", "Health", "Files"].map((_, i) => (
            <div key={i} className="flex items-center gap-2 mb-2">
              <div className={`h-3 w-3 rounded ${ghostFill}`} />
              <div className={`h-1.5 rounded ${ghostFill}`} style={{ width: `${52 + i * 8}%` }} />
            </div>
          ))}
        </div>
      </div>
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
