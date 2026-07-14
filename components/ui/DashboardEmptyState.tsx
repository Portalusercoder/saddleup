import Link from "next/link";

type DashboardEmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
};

export default function DashboardEmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: DashboardEmptyStateProps) {
  const actionClass =
    "empty-state-cta-once motion-interactive inline-flex items-center justify-center px-4 py-2.5 bg-accent text-white text-sm font-medium uppercase tracking-wider hover:opacity-95 rounded-control";

  return (
    <div className="border border-dashed border-black/15 rounded-control px-6 py-10 text-center dark:border-white/15 bg-[var(--bg-card)]">
      <div
        className="empty-state-icon mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#1f4d3a]/15 text-[#8fae98] text-2xl"
        aria-hidden
      >
        ◇
      </div>
      <h3 className="font-serif text-lg text-black dark:text-white">{title}</h3>
      <p className="mt-2 text-sm text-black/60 max-w-md mx-auto dark:text-white/60">
        {description}
      </p>
      {actionLabel && actionHref ? (
        <Link href={actionHref} className={`mt-5 ${actionClass}`}>
          {actionLabel}
        </Link>
      ) : null}
      {actionLabel && onAction && !actionHref ? (
        <button type="button" onClick={onAction} className={`mt-5 ${actionClass}`}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
