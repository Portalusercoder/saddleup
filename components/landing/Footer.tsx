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

const legalKeys = [
  { href: "/privacy", key: "footer.privacy" as const },
  { href: "/terms", key: "footer.terms" as const },
  { href: "/legal/data-compliance", key: "footer.dataCompliance" as const },
];

const socialLinks = [
  { href: "#", icon: SiGithub, label: "GitHub" },
  { href: "#", icon: SiInstagram, label: "Instagram" },
  { href: "#", icon: SiX, label: "X" },
];

export default function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#111111] text-white/70 border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-6 py-16 sm:py-20">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-12">
          <div>
            <TextLogo className="text-[0.85rem] text-white/90" subtitle={t("footer.subtitle")} subtitleClassName="text-white/40" />
            <p className="mt-4 text-sm text-white/40 max-w-xs leading-relaxed">{t("footer.tagline")}</p>
          </div>

          <nav className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm" aria-label="Footer navigation">
            {navLinkKeys.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white/55 hover:text-white transition-colors duration-300"
              >
                {t(link.key)}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-14 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/40" aria-label="Legal">
            {legalKeys.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-white/70 transition-colors">
                {t(link.key)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-5">
            {socialLinks.map(({ href, icon: Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={label}
                className="text-white/35 hover:text-white/70 transition-colors"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        <p className="mt-8 text-xs text-white/30">
          © {year} Saddle Up. {t("footer.rights")}
        </p>
      </div>
    </footer>
  );
}
