"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProfile } from "@/components/providers/ProfileProvider";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  getDashboardNavSections,
  type NavItemDef,
  type NavSectionDef,
} from "@/lib/dashboard/nav-config";

const STORAGE_KEY = "saddleup_sidebar_collapsed";
const SIDEBAR_W_EXPANDED = "15rem";
const SIDEBAR_W_COLLAPSED = "4.5rem";

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 shrink-0 opacity-50 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function itemActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(href + "/");
}

function sectionActive(pathname: string, section: NavSectionDef) {
  return section.items.some((item) => itemActive(pathname, item.href));
}

export default function CollapsibleSidebar() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const { profile } = useProfile();
  const [stable, setStable] = useState<{ name: string; logoUrl: string | null } | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [flyoutKey, setFlyoutKey] = useState<string | null>(null);

  const sections = useMemo(
    () => getDashboardNavSections(profile?.role),
    [profile?.role]
  );

  useEffect(() => {
    setMounted(true);
    try {
      setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const width = collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W_EXPANDED;
    document.documentElement.style.setProperty("--su-sidebar-w", width);
    document.documentElement.dataset.sidebarCollapsed = collapsed ? "1" : "0";
    try {
      localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
    } catch {
      /* ignore */
    }
    return () => {
      document.documentElement.style.setProperty("--su-sidebar-w", SIDEBAR_W_EXPANDED);
      delete document.documentElement.dataset.sidebarCollapsed;
    };
  }, [collapsed, mounted]);

  useEffect(() => {
    fetch("/api/stable")
      .then((r) => r.json())
      .then((d) => (d.name ? setStable({ name: d.name, logoUrl: d.logoUrl ?? null }) : setStable(null)))
      .catch(() => setStable(null));
  }, []);

  // Auto-open the section that contains the active route
  useEffect(() => {
    setOpenSections((prev) => {
      const next = { ...prev };
      for (const section of sections) {
        if (section.items.length > 1 && sectionActive(pathname, section)) {
          next[section.sectionKey] = true;
        }
      }
      return next;
    });
  }, [pathname, sections]);

  const toggleCollapsed = () => {
    setCollapsed((v) => !v);
    setFlyoutKey(null);
  };

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderLink = (item: NavItemDef, opts?: { nested?: boolean; showLabel?: boolean }) => {
    const active = itemActive(pathname, item.href);
    const showLabel = opts?.showLabel ?? !collapsed;
    return (
      <Link
        href={item.href}
        title={collapsed && !opts?.nested ? t(item.labelPath) : undefined}
        onClick={() => setFlyoutKey(null)}
        className={`group flex items-center gap-3 rounded-xl min-h-[42px] text-sm font-medium transition-colors su-focus-ring ${
          opts?.nested ? "ps-3 pe-3 py-2" : collapsed ? "justify-center px-2 py-2.5" : "ps-3 pe-3 py-2.5"
        } ${
          active
            ? "su-nav-active"
            : "text-white/55 hover:bg-white/[0.05] hover:text-white"
        }`}
      >
        {!opts?.nested && (
          <span className="shrink-0 flex items-center justify-center opacity-90" aria-hidden>
            {item.icon}
          </span>
        )}
        {showLabel && <span className="truncate">{t(item.labelPath)}</span>}
        {opts?.nested && active && (
          <svg className="w-3.5 h-3.5 ms-auto opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </Link>
    );
  };

  return (
    <aside
      className={`h-full bg-base border-e border-white/10 flex flex-col overflow-visible transition-[width] duration-300 ease-out ${
        collapsed ? "w-[4.5rem]" : "w-60"
      }`}
    >
      {/* Header: logo + collapse */}
      <div
        className={`relative shrink-0 h-16 sm:h-20 px-3 border-b border-white/10 flex items-center ${
          collapsed ? "justify-center" : "justify-between gap-2"
        }`}
      >
        <div className={`flex items-center gap-2.5 min-w-0 ${collapsed ? "" : "flex-1"}`}>
          {stable?.logoUrl ? (
            <img
              src={stable.logoUrl}
              alt=""
              className="w-9 h-9 rounded-xl object-cover border border-white/15 shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center shrink-0 border border-white/10">
              <span className="font-serif text-sm font-semibold leading-none">
                {(stable?.name ?? "S").charAt(0)}
              </span>
            </div>
          )}
          {!collapsed && (
            <span className="text-sm font-medium text-white truncate">
              {stable?.name ?? "Saddle Up"}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={toggleCollapsed}
          className={`shrink-0 w-8 h-8 rounded-full border border-white/15 text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors flex items-center justify-center su-focus-ring rtl:rotate-180 ${
            collapsed ? "absolute -end-3 top-1/2 -translate-y-1/2 z-[70] bg-base shadow-md" : ""
          }`}
          aria-label={collapsed ? t("navSection.expandSidebar") : t("navSection.collapseSidebar")}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            {collapsed ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5l7 7-7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 19l-7-7 7-7" />
            )}
          </svg>
        </button>
      </div>

      <nav
        className="relative flex-1 px-2.5 py-4 overflow-y-auto overflow-x-hidden"
        aria-label={t("navSection.sidebarAria")}
        onMouseLeave={() => setFlyoutKey(null)}
      >
        <ul className="space-y-1">
          {sections.map((section) => {
            const isGroup = section.items.length > 1;
            const open = !!openSections[section.sectionKey];
            const active = sectionActive(pathname, section);
            const sectionLabel = t(`navSection.${section.sectionKey}`);
            const lead = section.items[0];

            if (!isGroup) {
              return (
                <li key={section.sectionKey} className="relative">
                  {renderLink(lead)}
                </li>
              );
            }

            if (collapsed) {
              return (
                <li
                  key={section.sectionKey}
                  className="relative"
                  onMouseEnter={() => setFlyoutKey(section.sectionKey)}
                >
                  <button
                    type="button"
                    className={`w-full flex items-center justify-center rounded-xl min-h-[42px] px-2 py-2.5 transition-colors su-focus-ring ${
                      active || flyoutKey === section.sectionKey
                        ? "su-nav-active"
                        : "text-white/55 hover:bg-white/[0.05] hover:text-white"
                    }`}
                    aria-label={sectionLabel}
                    aria-expanded={flyoutKey === section.sectionKey}
                  >
                    <span aria-hidden>{lead.icon}</span>
                  </button>

                  {flyoutKey === section.sectionKey && (
                    <div className="absolute top-0 start-full ms-2 z-[80] min-w-[11rem]">
                      <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-xl p-2">
                        <p className="px-3 py-1.5 text-[0.7rem] uppercase tracking-[0.16em] text-white/35 font-medium">
                          {sectionLabel}
                        </p>
                        <ul className="space-y-0.5">
                          {section.items.map((item) => (
                            <li key={item.href}>{renderLink(item, { nested: true, showLabel: true })}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </li>
              );
            }

            return (
              <li key={section.sectionKey}>
                <button
                  type="button"
                  onClick={() => toggleSection(section.sectionKey)}
                  className={`w-full flex items-center gap-3 rounded-xl min-h-[42px] ps-3 pe-3 py-2.5 text-sm font-medium transition-colors su-focus-ring ${
                    active
                      ? "su-nav-active"
                      : "text-white/55 hover:bg-white/[0.05] hover:text-white"
                  }`}
                  aria-expanded={open}
                >
                  <span className="shrink-0 opacity-90" aria-hidden>
                    {lead.icon}
                  </span>
                  <span className="truncate flex-1 text-start">{sectionLabel}</span>
                  <Chevron open={open} />
                </button>

                {open && (
                  <div className="relative ms-5 mt-1 mb-1">
                    <span
                      className="absolute start-0 top-1 bottom-1 w-px bg-white/15"
                      aria-hidden
                    />
                    <ul className="ps-4 space-y-0.5">
                      {section.items.map((item) => (
                        <li key={item.href}>{renderLink(item, { nested: true, showLabel: true })}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
