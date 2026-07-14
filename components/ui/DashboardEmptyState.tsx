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
    "su-btn-primary empty-state-cta-once motion-interactive mt-5";

  return (
    <div className="su-hairline-b px-1 py-10 text-center">
      <div
        className="empty-state-icon mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-control border border-[var(--border-subtle)] text-paddock text-lg font-serif"
        aria-hidden
      >
        ◇
      </div>
      <h3 className="font-serif text-lg text-black dark:text-white">{title}</h3>
      <p className="mt-2 text-sm text-black/60 max-w-md mx-auto dark:text-white/60">
        {description}
      </p>
      {actionLabel && actionHref ? (
        <Link href={actionHref} className={`inline-flex ${actionClass}`}>
          {actionLabel}
        </Link>
      ) : null}
      {actionLabel && onAction && !actionHref ? (
        <button type="button" onClick={onAction} className={`inline-flex ${actionClass}`}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
