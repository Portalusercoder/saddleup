import Logo from "@/components/brand/Logo";

type TextLogoProps = {
  className?: string;
  subtitle?: string;
  subtitleClassName?: string;
  /** Prefer `full` (mark + word) in chrome; `wordmark` for type-only. */
  variant?: "full" | "wordmark" | "symbol" | "stacked";
};

/**
 * @deprecated Prefer `Logo` — kept as a thin alias for existing imports.
 */
export default function TextLogo({
  className = "",
  subtitle,
  subtitleClassName = "text-black/60",
  variant = "full",
}: TextLogoProps) {
  return (
    <Logo
      variant={variant}
      className={className}
      subtitle={subtitle}
      subtitleClassName={subtitleClassName}
    />
  );
}
