import Link from "next/link";

export type QuickAction = {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
  badge?: string | number;
  description?: string;
};

type SmartQuickActionsProps = {
  title: string;
  actions: QuickAction[];
};

export default function SmartQuickActions({ title, actions }: SmartQuickActionsProps) {
  return (
    <div className="border border-black/10 p-6 dark:border-white/10" data-tour="quick-actions">
      <h2 className="font-serif text-lg text-black dark:text-white mb-4">{title}</h2>
      <div className="space-y-3">
        {actions.map((action) => (
          <Link
            key={action.href + action.label}
            href={action.href}
            className={`flex items-center justify-between gap-3 w-full px-4 py-3 text-sm font-medium uppercase tracking-wider transition ${
              action.variant === "primary"
                ? "bg-accent text-white hover:opacity-95"
                : "border border-black/10 text-black hover:border-black/30 dark:border-white/15 dark:text-white dark:hover:border-white/30"
            }`}
          >
            <span className="text-left normal-case tracking-normal font-normal">
              <span className="block text-sm font-medium uppercase tracking-wider">
                {action.label}
              </span>
              {action.description ? (
                <span className="block text-xs text-black/55 mt-0.5 normal-case tracking-normal dark:text-white/55">
                  {action.description}
                </span>
              ) : null}
            </span>
            {action.badge != null && Number(action.badge) > 0 ? (
              <span className="shrink-0 min-w-[1.5rem] h-6 px-1.5 flex items-center justify-center rounded-full bg-black/10 text-xs font-semibold dark:bg-white/15">
                {action.badge}
              </span>
            ) : null}
          </Link>
        ))}
      </div>
    </div>
  );
}
