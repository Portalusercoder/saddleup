type TextLogoProps = {
  className?: string;
  subtitle?: string;
  subtitleClassName?: string;
};

export default function TextLogo({
  className = "",
  subtitle,
  subtitleClassName = "text-black/60",
}: TextLogoProps) {
  return (
    <div className={className}>
      <p className="font-serif uppercase tracking-[0.28em] leading-none text-current">
        Saddle Up
      </p>
      {subtitle ? (
        <p className={`mt-2 text-[0.62rem] uppercase tracking-[0.22em] ${subtitleClassName}`}>
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
