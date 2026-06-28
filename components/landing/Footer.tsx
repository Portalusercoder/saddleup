"use client";

import Link from "next/link";
import { SiGithub, SiInstagram, SiX } from "react-icons/si";
import TextLogo from "@/components/brand/TextLogo";
import { useLanguage } from "@/components/providers/LanguageProvider";

const navLinkKeys = [
  { href: "/#features", key: "nav.product" as const },
  { href: "/#pricing", key: "nav.pricing" as const },
  { href: "/for-schools", key: "nav.forSchools" as const },
  { href: "/for-trainers", key: "nav.forTrainers" as const },
  { href: "/blog", key: "footer.guides" as const },
  { href: "/contact", key: "nav.contact" as const },
];

const socialLinks = [
  { href: "#", icon: SiGithub, label: "GitHub" },
  { href: "#", icon: SiInstagram, label: "Instagram" },
  { href: "#", icon: SiX, label: "X" },
];

export default function Footer({
  onGetStarted,
}: {
  onGetStarted?: () => void;
}) {
  const { t } = useLanguage();
  return (
    <footer className="relative bg-base text-black overflow-hidden border-t border-black/[0.06]">
      {/* Very subtle white grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative max-w-4xl mx-auto py-16 sm:py-20 px-6 text-center">
        {/* Logo + Brand */}
        <div className="flex flex-col items-center mb-10">
          <TextLogo className="text-[0.95rem] text-black/90" subtitle={t("footer.subtitle")} />
        </div>

        {/* Heading + CTA */}
        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-normal mb-6 max-w-xl mx-auto leading-snug">
          {t("footer.ctaTitle")}
        </h2>
        <button
          onClick={onGetStarted}
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white font-medium rounded-full hover:opacity-95 transition uppercase tracking-wider text-sm"
        >
          {t("footer.getStarted")}
        </button>

        {/* Nav links with subtle separators */}
        <nav
          className="mt-12 flex flex-wrap items-center justify-center gap-x-4 gap-y-2"
          aria-label="Footer navigation"
        >
          {navLinkKeys.map((link, i) => (
            <span key={link.href} className="flex items-center gap-4">
              {i > 0 && (
                <span
                  className="w-px h-4 bg-white/15 flex-shrink-0"
                  aria-hidden
                />
              )}
              <Link
                href={link.href}
                className="text-sm text-black/70 hover:text-black transition uppercase tracking-wider"
              >
                {t(link.key)}
              </Link>
            </span>
          ))}
        </nav>

        <nav
          className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs uppercase tracking-wider text-black/50"
          aria-label="Legal"
        >
          <Link href="/privacy" className="hover:text-black/80 transition">
            {t("footer.privacy")}
          </Link>
          <span className="text-black/20" aria-hidden>
            |
          </span>
          <Link href="/terms" className="hover:text-black/80 transition">
            {t("footer.terms")}
          </Link>
          <span className="text-black/20" aria-hidden>
            |
          </span>
          <Link
            href="/legal/data-compliance"
            className="hover:text-black/80 transition"
          >
            {t("footer.dataCompliance")}
          </Link>
        </nav>

        {/* Social icons */}
        <div className="mt-10 flex items-center justify-center gap-6">
          {socialLinks.map(({ href, icon: Icon, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={label}
              className="text-black/50 hover:text-black/80 transition"
            >
              <Icon className="w-5 h-5" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
