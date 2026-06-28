type HorseStatusPillProps = {
  label: string;
  tone?: "neutral" | "accent" | "warn";
};

export default function HorseStatusPill({ label, tone = "neutral" }: HorseStatusPillProps) {
  const tones = {
    neutral: "border-black/15 text-black/65 dark:border-white/20 dark:text-white/65",
    accent: "border-accent/40 text-accent dark:border-accent/50",
    warn: "border-amber-500/40 text-amber-700 dark:text-amber-400",
  };

  return (
    <span
      className={`inline-block text-[0.65rem] uppercase tracking-wider px-2 py-0.5 border ${tones[tone]}`}
    >
      {label}
    </span>
  );
}
