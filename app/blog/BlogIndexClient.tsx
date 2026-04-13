"use client";

import Link from "next/link";
import { useLanguage } from "@/components/providers/LanguageProvider";

const posts = [
  {
    href: "/blog/stable-management-ksa-gcc",
    titleKey: "blog.postKsaTitle",
    blurbKey: "blog.postKsaBlurb",
  },
  {
    href: "/blog/stable-operations-playbook",
    titleKey: "blog.postPlaybookTitle",
    blurbKey: "blog.postPlaybookBlurb",
  },
  {
    href: "/blog/lesson-scheduling-horse-workload",
    titleKey: "blog.postLessonTitle",
    blurbKey: "blog.postLessonBlurb",
  },
] as const;

export default function BlogIndexClient() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-base text-black dark:text-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20">
        <Link
          href="/"
          className="text-xs uppercase tracking-[0.2em] text-black/50 hover:text-black dark:text-white/55 dark:hover:text-white transition"
        >
          {t("nav.backToHome")}
        </Link>
        <h1 className="mt-8 font-serif text-3xl sm:text-4xl font-normal text-black dark:text-white">
          {t("blog.indexTitle")}
        </h1>
        <p className="mt-4 leading-relaxed text-black/65 dark:text-white/70">
          {t("blog.indexLead")}
        </p>
        <ul className="mt-12 space-y-8">
          {posts.map((post) => (
            <li
              key={post.href}
              className="border-b border-black/10 pb-8 last:border-0 dark:border-white/10"
            >
              <Link
                href={post.href}
                className="font-serif text-xl text-black transition hover:text-accent dark:text-white dark:hover:text-accent"
              >
                {t(post.titleKey)}
              </Link>
              <p className="mt-2 text-sm text-black/60 dark:text-white/65">{t(post.blurbKey)}</p>
              <Link
                href={post.href}
                className="mt-3 inline-block text-xs uppercase tracking-wider text-accent hover:opacity-90"
              >
                {t("blog.readGuide")}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
