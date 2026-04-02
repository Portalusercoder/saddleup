import type { Metadata } from "next";
import Link from "next/link";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.saddleup-sa.com";

export const metadata: Metadata = {
  title: "Guides for stables and riding schools",
  description:
    "Practical guides for stable operations, scheduling, and management in Saudi Arabia and the GCC.",
  alternates: { canonical: `${appUrl}/blog` },
};

const posts = [
  {
    href: "/blog/stable-management-ksa-gcc",
    title: "Stable management software for KSA and GCC",
    blurb: "Who it is for, common pain points, and how software fits riding schools.",
  },
  {
    href: "/blog/stable-operations-playbook",
    title: "Stable operations playbook",
    blurb: "Daily, weekly, and monthly rhythms for professional barns.",
  },
  {
    href: "/blog/lesson-scheduling-horse-workload",
    title: "Lesson scheduling and horse workload",
    blurb: "Protect horse welfare and reputation with clearer scheduling.",
  },
];

export default function BlogIndexPage() {
  return (
    <main className="min-h-screen bg-base text-black dark:text-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20">
        <Link
          href="/"
          className="text-xs uppercase tracking-[0.2em] text-black/50 hover:text-black dark:text-white/55 dark:hover:text-white transition"
        >
          ← Home
        </Link>
        <h1 className="mt-8 font-serif text-3xl sm:text-4xl font-normal text-black dark:text-white">
          Guides for stables
        </h1>
        <p className="mt-4 leading-relaxed text-black/65 dark:text-white/70">
          Articles for riding schools and equestrian facilities in Saudi Arabia and the Gulf. Written for owners and managers evaluating operations and software.
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
                {post.title}
              </Link>
              <p className="mt-2 text-sm text-black/60 dark:text-white/65">{post.blurb}</p>
              <Link
                href={post.href}
                className="mt-3 inline-block text-xs uppercase tracking-wider text-accent hover:opacity-90"
              >
                Read guide →
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
