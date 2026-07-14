import Link from "next/link";

export type GlanceItem = {
  label: string;
  value: string | number;
  href?: string;
  highlight?: boolean;
};

type WeekAtAGlanceProps = {
  title: string;
  items: GlanceItem[];
};

export default function WeekAtAGlance({ title, items }: WeekAtAGlanceProps) {
  return (
    <section className="card border border-black/10 p-6 rounded-control dark:border-white/10" data-tour="week-at-a-glance">
      <h2 className="font-serif text-lg text-black dark:text-white mb-4">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {items.map((item) => {
          const inner = (
            <>
              <p className="text-black/50 text-xs uppercase tracking-widest dark:text-white/50">
                {item.label}
              </p>
              <p
                className={`font-serif text-2xl mt-1 ${
                  item.highlight
                    ? "text-amber-700 dark:text-amber-400"
                    : "text-black dark:text-white"
                }`}
              >
                {item.value}
              </p>
            </>
          );

          if (item.href) {
            return (
              <Link
                key={item.label}
                href={item.href}
                className="border border-black/10 px-4 py-3 rounded-control hover:border-[#8fae98]/40 hover:bg-[#8fae98]/5 transition dark:border-white/10"
              >
                {inner}
              </Link>
            );
          }

          return (
            <div
              key={item.label}
              className="border border-black/10 px-4 py-3 rounded-control dark:border-white/10"
            >
              {inner}
            </div>
          );
        })}
      </div>
    </section>
  );
}
