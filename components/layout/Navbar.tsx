"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import NotificationBell from "@/components/NotificationBell";
import UserMenuDropdown from "@/components/layout/UserMenuDropdown";
import { useProfile } from "@/components/providers/ProfileProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import LanguageToggle from "@/components/layout/LanguageToggle";
import ThemeToggle from "@/components/layout/ThemeToggle";
import {
  flattenDashboardNav,
  getDashboardNavSections,
} from "@/lib/dashboard/nav-config";

const HERO_SCROLL_THRESHOLD = 0.6; // show solid nav after scrolling 60% of viewport

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { profile, loading: profileLoading, userId } = useProfile();
  const { t } = useLanguage();

  const user = userId ? { id: userId, email: profile?.email } : null;
  const authChecked = !profileLoading;

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const navItems = flattenDashboardNav(getDashboardNavSections(profile?.role));

  const NavLink = ({ item }: { item: (typeof navItems)[0] }) => {
    const isActive =
      pathname === item.href || pathname.startsWith(item.href + "/");
    return (
      <Link
        href={item.href}
        onClick={() => setMobileOpen(false)}
        className={`block px-4 py-3 text-sm font-medium transition uppercase tracking-wider ${
          isActive
            ? "bg-black/10 text-black"
            : "text-black/60 hover:text-black hover:bg-black/5"
        }`}
      >
        {t(item.labelPath)}
      </Link>
    );
  };

  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isHome = pathname === "/";
  const isMarketing =
    isHome || pathname === "/for-schools" || pathname === "/for-trainers";

  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  const [navCompact, setNavCompact] = useState(false);
  useEffect(() => {
    if (!isHome) return;
    const check = () => {
      const threshold = window.innerHeight * HERO_SCROLL_THRESHOLD;
      setScrolledPastHero(window.scrollY > threshold);
      setNavCompact(window.scrollY > 60);
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, [isHome]);

  const isOverHero = isHome && !scrolledPastHero && !navCompact;
  const isDashboard = pathname.startsWith("/dashboard");

  if (isAuthPage) return null;

  return (
    <div className="relative">
      <nav
        className={`flex items-center fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${
          isHome && navCompact ? "h-16" : "h-20"
        } ${
          isDashboard
            ? "px-4 sm:px-6 md:ps-56 md:pe-12 lg:pe-16 xl:pe-20"
            : "px-4 sm:px-6 md:px-12 lg:px-16 xl:px-20"
        } ${
          isOverHero
            ? "bg-transparent text-white"
            : isHome || isMarketing
              ? "bg-base/95 backdrop-blur-md text-black border-b border-black/10 shadow-sm"
              : "bg-base border-b border-black/10 text-black"
        }`}
      >
        {/* Spacer — keeps home nav links centered */}
        <div className="flex-1 min-w-0" />

        {/* Center: Nav links (home page only) */}
        {isMarketing && !user && (
          <div
            className={`hidden lg:flex items-center gap-5 xl:gap-7 text-[0.65rem] md:text-[0.7rem] tracking-[0.12em] font-light ${
              isOverHero ? "text-white/90" : "text-black/90"
            }`}
          >
            <Link href="/#features" className={isOverHero ? "hover:text-white transition" : "hover:text-black transition"}>
              {t("nav.product")}
            </Link>
            <Link href="/#pricing" className={isOverHero ? "hover:text-white transition" : "hover:text-black transition"}>
              {t("nav.pricing")}
            </Link>
            <Link href="/for-schools" className={isOverHero ? "hover:text-white transition" : "hover:text-black transition"}>
              {t("nav.forSchools")}
            </Link>
            <Link href="/for-trainers" className={isOverHero ? "hover:text-white transition" : "hover:text-black transition"}>
              {t("nav.forTrainers")}
            </Link>
          </div>
        )}

        {/* Top-right chrome: always physical right (sidebar stays on the left in RTL) */}
        <div className={`flex-1 flex items-center justify-end min-w-0 ${isMarketing && !user ? "" : "max-lg:flex-none"}`}>
          <div dir="ltr" className="flex items-center gap-2 sm:gap-3 shrink-0">
            <LanguageToggle variant={isOverHero ? "light" : "dark"} />
            {authChecked && user ? (
              <>
                {!isAuthPage && !isHome && <NotificationBell />}
                <UserMenuDropdown
                  fullName={profile?.fullName}
                  email={profile?.email ?? user.email}
                  avatarUrl={profile?.avatarUrl}
                  isOwner={profile?.role === "owner"}
                  onSignOut={handleSignOut}
                />
              </>
            ) : (
              !isAuthPage && (
                <>
                  <Link
                    href="/login"
                    className={`px-4 py-2.5 border transition uppercase tracking-[0.2em] text-[0.7rem] font-light ${
                      isOverHero
                        ? "border-white/40 text-white hover:bg-white/10"
                        : "border-black/30 text-black hover:bg-black/10"
                    }`}
                  >
                    {t("nav.signIn")}
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-2.5 bg-accent text-white font-medium hover:opacity-95 transition uppercase tracking-[0.2em] text-[0.7rem]"
                  >
                    {t("nav.startFree")}
                  </Link>
                </>
              )
            )}
          </div>
        </div>

        {/* Mobile menu button (dashboard only) */}
        {user && !isAuthPage && (
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`md:hidden p-2 rounded-lg ${isOverHero ? "hover:bg-white/10" : "hover:bg-black/10"}`}
            aria-label={t("nav.menu")}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        )}
      </nav>

      {user && !isAuthPage && !isHome && (
        <>
          <div
            className={`md:hidden fixed inset-0 bg-black/45 z-[60] transition-opacity duration-300 ${
              mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
            onClick={() => setMobileOpen(false)}
            aria-hidden={!mobileOpen}
          />
          <aside
            className={`md:hidden fixed top-0 right-0 h-screen w-[86vw] max-w-sm bg-base border-l border-black/10 z-[70] transition-transform duration-300 ease-out ${
              mobileOpen ? "translate-x-0" : "translate-x-full"
            }`}
            aria-hidden={!mobileOpen}
          >
            <div className="h-20 px-4 flex items-center justify-between border-b border-black/10">
              <p className="text-xs uppercase tracking-[0.22em] text-black/60">{t("nav.menu")}</p>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 hover:bg-black/10 transition"
                aria-label={t("nav.closeMenu")}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-3 py-3 max-h-[calc(100vh-5rem)] overflow-y-auto">
              {navItems.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}

              <div className="mt-4 border-t border-black/10 pt-4 px-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.2em] text-black/60">
                    {t("nav.theme")}
                  </span>
                  <ThemeToggle />
                </div>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleSignOut();
                  }}
                  className="mt-4 block w-full text-left px-4 py-3 text-sm border border-black/15 text-black/80 hover:bg-black/5 transition uppercase tracking-wider"
                >
                  {t("nav.signOut")}
                </button>
              </div>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
