"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProfile } from "@/components/providers/ProfileProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { getMobileTabBarItems } from "@/lib/dashboard/nav-config";

export default function MobileTabBar() {
  const pathname = usePathname();
  const { profile } = useProfile();
  const { t } = useLanguage();
  const items = getMobileTabBarItems(profile?.role);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-[70] border-t border-black/10 bg-base/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)] dark:border-white/10"
      aria-label={t("navSection.sidebarAria")}
    >
      <ul className="flex items-stretch justify-around">
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <li key={item.href} className="flex-1 min-w-0">
              <Link
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 py-2.5 px-1 text-[0.65rem] uppercase tracking-wider transition ${
                  active
                    ? "text-accent"
                    : "text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white"
                }`}
              >
                <span className={`${active ? "scale-110" : ""} transition-transform`}>
                  {item.icon}
                </span>
                <span className="truncate max-w-full">{t(item.labelPath)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
