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
          className="text-xs uppercase tracking-[0.2em] text-black/50 hover:text-black transition"
        >
          ← Home
        </Link>
      </nav>
      <header className="mb-10">
        <h1 className="font-serif text-3xl sm:text-4xl md:text-[2.75rem] font-normal leading-tight text-black">
          {title}
        </h1>
        <p className="mt-4 text-black/65 text-base leading-relaxed">{description}</p>
      </header>
      <div className="prose-article space-y-6 text-black/80 text-[0.95rem] leading-relaxed [&_h2]:font-serif [&_h2]:text-xl [&_h2]:md:text-2xl [&_h2]:text-black [&_h2]:mt-10 [&_h2]:mb-3 [&_h3]:font-sans [&_h3]:text-sm [&_h3]:uppercase [&_h3]:tracking-widest [&_h3]:text-black/50 [&_h3]:mt-8 [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_p]:text-black/75">
        {children}
      </div>
      <footer className="mt-14 pt-10 border-t border-black/10">
        <p className="text-sm text-black/60 mb-4">
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
