import type { ReactNode } from "react";
import Link from "next/link";

const defaultContact =
  process.env.NEXT_PUBLIC_LEGAL_EMAIL ?? "contact@saddleup-sa.com";

export function legalContactEmail(): string {
  return defaultContact;
}

export default function LegalPageShell({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-base text-black dark:text-white">
      <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
        <Link
          href="/"
          className="mb-8 inline-block text-xs uppercase tracking-[0.22em] text-black/55 hover:text-black dark:text-white/60 dark:hover:text-white"
        >
          ← Home
        </Link>
        <p className="mb-2 text-xs uppercase tracking-[0.28em] text-black/45 dark:text-white/50">
          Legal
        </p>
        <h1 className="mb-2 font-serif text-3xl font-normal sm:text-4xl">
          {title}
        </h1>
        <p className="mb-8 text-sm text-black/50 dark:text-white/55">
          Last updated: {lastUpdated}
        </p>

        <div className="mb-10 border border-amber-300/80 bg-amber-50/90 p-4 text-sm leading-relaxed text-black/85 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-white/85">
          <strong className="font-medium">Important:</strong> This is a template
          for Saudi PDPL-style expectations, not legal advice. Have a Saudi
          lawyer review it, match it to your real data flows, and publish Arabic
          where required. Privacy/legal email:{" "}
          <code className="rounded bg-black/5 px-1 py-0.5 text-xs dark:bg-white/10">
            NEXT_PUBLIC_LEGAL_EMAIL
          </code>{" "}
          (fallback: {defaultContact}).
        </div>

        <div className="space-y-6 text-[15px] leading-relaxed text-black/85 dark:text-white/85 [&_h2]:mt-12 [&_h2]:scroll-mt-24 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-normal [&_h2]:text-black [&_h2]:first:mt-0 dark:[&_h2]:text-white [&_h3]:mt-8 [&_h3]:font-medium [&_h3]:text-black dark:[&_h3]:text-white [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ol]:mt-3 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 [&_strong]:font-medium [&_strong]:text-black dark:[&_strong]:text-white [&_a]:text-accent [&_a]:underline-offset-2 hover:[&_a]:underline">
          {children}
        </div>

        <nav
          className="mt-14 flex flex-wrap gap-x-6 gap-y-2 border-t border-black/10 pt-8 text-xs uppercase tracking-[0.18em] text-black/55 dark:border-white/10 dark:text-white/55"
          aria-label="Related legal pages"
        >
          <Link href="/privacy" className="hover:text-black dark:hover:text-white">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-black dark:hover:text-white">
            Terms
          </Link>
          <Link
            href="/legal/data-compliance"
            className="hover:text-black dark:hover:text-white"
          >
            Data and compliance
          </Link>
        </nav>
      </div>
    </main>
  );
}
