import Link from "next/link";

const linkClass =
  "text-accent underline underline-offset-2 hover:opacity-90";

export function SeoArticle({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20">
      <nav className="mb-8">
        <Link
          href="/"
          className="text-xs uppercase tracking-[0.2em] text-black/50 hover:text-black dark:text-white/55 dark:hover:text-white transition"
        >
          ← Home
        </Link>
      </nav>
      <header className="mb-10">
        <h1 className="font-serif text-3xl sm:text-4xl md:text-[2.75rem] font-normal leading-tight text-black dark:text-white">
          {title}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-black/65 dark:text-white/70">
          {description}
        </p>
      </header>
      <div
        className="prose-article space-y-6 text-[0.95rem] leading-relaxed text-black/80 dark:text-white/75 [&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:text-black md:[&_h2]:text-2xl dark:[&_h2]:text-white [&_h3]:mb-2 [&_h3]:mt-8 [&_h3]:font-sans [&_h3]:text-sm [&_h3]:uppercase [&_h3]:tracking-widest [&_h3]:text-black/50 dark:[&_h3]:text-white/45 [&_li]:text-black/75 dark:[&_li]:text-white/70 [&_p]:text-black/75 dark:[&_p]:text-white/70 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5"
      >
        {children}
      </div>
      <footer className="mt-14 border-t border-black/10 pt-10 dark:border-white/10">
        <p className="mb-4 text-sm text-black/60 dark:text-white/65">
          Run your stable with Saddle Up — horses, riders, bookings, and operations in one place.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/signup" className={linkClass}>
            Get started
          </Link>
          <Link href="/contact" className={linkClass}>
            Contact sales
          </Link>
          <Link href="/#features" className={linkClass}>
            Features
          </Link>
        </div>
      </footer>
    </article>
  );
}
