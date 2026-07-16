import { STIRRUP_SYMBOL_PATH, STIRRUP_VIEWBOX } from "@/components/brand/symbolPath";

export type LogoVariant = "full" | "wordmark" | "symbol" | "stacked";

type LogoProps = {
  className?: string;
  subtitle?: string;
  subtitleClassName?: string;
  /** `full` = stirrup + wordmark (default nav). `wordmark` = type only. */
  variant?: LogoVariant;
};

function StirrupSymbol({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox={STIRRUP_VIEWBOX}
      className={`inline-block shrink-0 ${className}`}
      aria-hidden
      fill="currentColor"
    >
      <path fillRule="evenodd" clipRule="evenodd" d={STIRRUP_SYMBOL_PATH} />
    </svg>
  );
}

function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`font-serif uppercase tracking-[0.22em] leading-none whitespace-nowrap ${className}`}
    >
      Saddle Up
    </span>
  );
}

function StackedWordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`font-serif uppercase tracking-[0.22em] leading-[1.05] text-center ${className}`}
    >
      <span className="block">Saddle</span>
      <span className="block">Up</span>
    </span>
  );
}

export default function Logo({
  className = "",
  subtitle,
  subtitleClassName = "text-black/60",
  variant = "full",
}: LogoProps) {
  const mark = (() => {
    switch (variant) {
      case "symbol":
        return <StirrupSymbol className="h-[1.15em] w-[1.15em]" />;
      case "wordmark":
        return <Wordmark />;
      case "stacked":
        return (
          <span className="inline-flex flex-col items-center gap-[0.4em]">
            <StirrupSymbol className="h-[1.35em] w-[1.35em]" />
            <StackedWordmark />
          </span>
        );
      case "full":
      default:
        return (
          <span className="inline-flex items-center gap-[0.55em]">
            <StirrupSymbol className="h-[1.1em] w-[1.1em]" />
            <Wordmark />
          </span>
        );
    }
  })();

  return (
    <div
      className={`text-current ${className}`}
      role="img"
      aria-label="Saddle Up"
    >
      {mark}
      {subtitle ? (
        <p
          className={`mt-2 text-[0.62rem] uppercase tracking-[0.18em] ${subtitleClassName}`}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
