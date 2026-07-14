"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProfile } from "@/components/providers/ProfileProvider";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { getDashboardNavSections } from "@/lib/dashboard/nav-config";
import { useSlidingIndicator } from "@/lib/motion/useSlidingIndicator";

export default function CollapsibleSidebar() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const { profile } = useProfile();
  const [stable, setStable] = useState<{ name: string; logoUrl: string | null } | null>(null);
  const { containerRef, indicator } = useSlidingIndicator<HTMLElement>(pathname, "vertical");

  useEffect(() => {
    fetch("/api/stable")
      .then((r) => r.json())
      .then((d) => (d.name ? setStable({ name: d.name, logoUrl: d.logoUrl ?? null }) : setStable(null)))
      .catch(() => setStable(null));
  }, []);

  const sections = getDashboardNavSections(profile?.role);

  return (
    <aside className="h-full w-56 bg-base border-e border-white/10 flex flex-col overflow-hidden">
      {stable && (
        <div className="shrink-0 h-20 px-4 border-b border-white/10 flex items-center gap-3">
          {stable.logoUrl ? (
            <img
              src={stable.logoUrl}
              alt=""
              className="sidebar-logo w-10 h-10 rounded-control object-cover border border-white/15 shrink-0"
            />
          ) : (
            <div className="sidebar-logo w-10 h-10 rounded-control bg-accent/25 border border-white/15 flex items-center justify-center shrink-0">
              <span className="text-paddock text-sm font-serif">
                {stable.name.charAt(0)}
              </span>
            </div>
          )}
          <span className="text-sm font-medium text-mist truncate">
            {stable.name}
          </span>
        </div>
      )}
      <nav
        ref={containerRef}
        className="relative flex-1 ps-3 pe-4 py-4 overflow-y-auto"
        aria-label={t("navSection.sidebarAria")}
      >
        {indicator.height > 0 && (
          <span
            className="nav-slide-indicator"
            style={{
              top: indicator.top,
              height: indicator.height,
            }}
            aria-hidden
          />
        )}
        {sections.map((section, sectionIndex) => (
          <div
            key={section.sectionKey}
            className={sectionIndex > 0 ? "mt-5 pt-4 border-t border-white/[0.06]" : ""}
          >
            <p
              className="nav-section-label ps-1 pe-2 mb-2 text-[0.65rem] font-medium uppercase tracking-[0.22em] text-white/35"
              style={{ animationDelay: `${sectionIndex * 60}ms` }}
            >
              {t(`navSection.${section.sectionKey}`)}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      data-nav-active={isActive ? "true" : undefined}
                      className={`nav-link group flex items-center gap-3 rounded-control ps-3 pe-3 py-2.5 text-sm font-medium transition-colors min-h-[44px] su-focus-ring ${
                        isActive
                          ? "nav-link-active-glow bg-paddock/15 text-mist"
                          : "text-white/55 hover:bg-white/[0.04] hover:text-mist"
                      }`}
                    >
                      <span
                        className="nav-link-icon shrink-0 flex items-center justify-center"
                        aria-hidden
                      >
                        {item.icon}
                      </span>
                      <span className="truncate">{t(item.labelPath)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
