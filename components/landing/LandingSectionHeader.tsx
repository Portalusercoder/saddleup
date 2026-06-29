type SlashTitle = {
  slash: true;
  muted: string;
  strong: string;
};

type LandingSectionHeaderProps = {
  eyebrow?: string;
  title: string | SlashTitle;
  description?: string;
  /** @deprecated Use `description` */
  subtitle?: string;
  align?: "start" | "center";
  onDark?: boolean;
  className?: string;
};

function isSlashTitle(title: string | SlashTitle): title is SlashTitle {
  return typeof title === "object" && title.slash === true;
}

export default function LandingSectionHeader({
  eyebrow,
  title,
  description,
  subtitle,
  align = "start",
  onDark = false,
  className = "",
}: LandingSectionHeaderProps) {
  const alignClass =
    align === "center" ? "landing-section-header--center" : "landing-section-header--start";
  const desc = description ?? subtitle;

  return (
    <header
      className={`landing-section-header ${alignClass} ${
        onDark ? "landing-section-header--on-dark" : ""
      } ${className}`.trim()}
    >
      {eyebrow ? <p className="landing-section-eyebrow">{eyebrow}</p> : null}

      {isSlashTitle(title) ? (
        <h2 className="landing-section-title landing-display landing-section-title-text">
          <span aria-hidden>/</span>
          <span>{title.muted}</span>
          <span>{title.strong}</span>
        </h2>
      ) : (
        <h2 className="landing-section-title landing-display">
          <span className="landing-section-title-strong">{title}</span>
        </h2>
      )}

      {desc ? <p className="landing-section-subtitle">{desc}</p> : null}
    </header>
  );
}
