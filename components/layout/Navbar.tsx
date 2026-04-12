"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import NotificationBell from "@/components/NotificationBell";
import { useProfile } from "@/components/providers/ProfileProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import LanguageToggle from "@/components/layout/LanguageToggle";
import ThemeToggle from "@/components/layout/ThemeToggle";

const HERO_SCROLL_THRESHOLD = 0.6; // show solid nav after scrolling 60% of viewport

const navItemsByRole: Record<string, { href: string; labelKey: string }[]> = {
    guardian: [
      { href: "/dashboard/guardian", labelKey: "parentPortal" },
      { href: "/dashboard/profile", labelKey: "profile" },
    ],
    student: [
      { href: "/dashboard", labelKey: "dashboard" },
      { href: "/dashboard/my-horses", labelKey: "myHorses" },
      { href: "/dashboard/bookings", labelKey: "myBookings" },
      { href: "/dashboard/training-history", labelKey: "trainingHistory" },
      { href: "/dashboard/competitions", labelKey: "competitions" },
      { href: "/dashboard/profile", labelKey: "profile" },
    ],
    trainer: [
      { href: "/dashboard", labelKey: "dashboard" },
      { href: "/dashboard/horses", labelKey: "horses" },
      { href: "/dashboard/team", labelKey: "teamManagement" },
      { href: "/dashboard/bookings", labelKey: "bookings" },
      { href: "/dashboard/schedule", labelKey: "schedule" },
      { href: "/dashboard/analytics", labelKey: "analytics" },
      { href: "/dashboard/matching", labelKey: "matching" },
      { href: "/dashboard/incidents", labelKey: "incidents" },
      { href: "/dashboard/profile", labelKey: "profile" },
    ],
    owner: [
      { href: "/dashboard", labelKey: "dashboard" },
      { href: "/dashboard/horses", labelKey: "horses" },
      { href: "/dashboard/team", labelKey: "teamManagement" },
      { href: "/dashboard/bookings", labelKey: "bookings" },
      { href: "/dashboard/schedule", labelKey: "schedule" },
      { href: "/dashboard/analytics", labelKey: "analytics" },
      { href: "/dashboard/matching", labelKey: "matching" },
      { href: "/dashboard/incidents", labelKey: "incidents" },
      { href: "/dashboard/settings", labelKey: "billingPlan" },
      { href: "/dashboard/profile", labelKey: "profile" },
    ],
  };

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const { profile, loading: profileLoading, userId } = useProfile();
  const { lang, t } = useLanguage();

  const user = userId ? { id: userId, email: profile?.email } : null;
  const authChecked = !profileLoading;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    if (profileMenuOpen) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [profileMenuOpen]);

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

  const navItems =
    profile?.role && navItemsByRole[profile.role]
      ? navItemsByRole[profile.role]
      : navItemsByRole.owner;

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
        {t(`navRole.${item.labelKey}`)}
      </Link>
    );
  };

  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isHome = pathname === "/";

  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  useEffect(() => {
    if (!isHome) return;
    const check = () => {
      const threshold = window.innerHeight * HERO_SCROLL_THRESHOLD;
      setScrolledPastHero(window.scrollY > threshold);
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, [isHome]);

  const isOverHero = isHome && !scrolledPastHero;
  const isDashboard = pathname.startsWith("/dashboard");

  if (isAuthPage) return null;

  return (
    <div className="relative">
      <nav
        className={`h-20 flex items-center justify-between fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${
          isDashboard
            ? "px-4 sm:px-6 md:pl-[4.25rem] md:pr-12 lg:pr-16 xl:pr-20"
            : "px-4 sm:px-6 md:px-12 lg:px-16 xl:px-20"
        } ${
          isOverHero
            ? "bg-transparent text-white"
            : isHome
              ? "bg-base/95 backdrop-blur-sm text-black border-b border-black/10"
              : "bg-base border-b border-black/10 text-black"
        }`}
      >
        {/* Left: Language toggle (starts after sidebar on dashboard) */}
        <div className="flex-1 flex items-center gap-2 min-w-0 pl-2 md:pl-3">
          <LanguageToggle variant={isOverHero ? "light" : "dark"} />
        </div>

        {/* Center: Nav links (home page only) */}
        {isHome && !user && (
          <div
            className={`hidden lg:flex items-center gap-6 xl:gap-8 uppercase text-[0.65rem] md:text-[0.7rem] tracking-[0.2em] font-light ${
              isOverHero ? "text-white/90" : "text-black/90"
            }`}
          >
            <Link href="/#features" className={isOverHero ? "hover:text-white transition" : "hover:text-black transition"}>
              {t("nav.features")}
            </Link>
            <Link href="/#pricing" className={isOverHero ? "hover:text-white transition" : "hover:text-black transition"}>
              {t("nav.pricing")}
            </Link>
            <Link href="/#about" className={isOverHero ? "hover:text-white transition" : "hover:text-black transition"}>
              {t("nav.about")}
            </Link>
            <Link href="/contact" className={isOverHero ? "hover:text-white transition" : "hover:text-black transition"}>
              {t("nav.contact")}
            </Link>
          </div>
        )}

        {/* Right: Sign in / Sign up or profile avatar (in RTL this block is on the left; add space from the line) */}
        <div className={`flex-1 flex items-center justify-end gap-2 ${lang === "ar" ? "me-3 md:me-4" : ""}`}>
          {authChecked && user ? (
            <div className="flex items-center gap-3">
              {!isAuthPage && !isHome && <NotificationBell />}
              <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setProfileMenuOpen((o) => !o)}
                className={`flex items-center hover:opacity-90 transition rounded-full focus:outline-none focus:ring-2 ${isOverHero ? "focus:ring-white/40" : "focus:ring-black/30"}`}
                aria-expanded={profileMenuOpen}
                aria-haspopup="true"
                title={t("nav.profileMenu")}
              >
                <ProfileAvatar
                  avatarUrl={profile?.avatarUrl}
                  name={profile?.fullName ?? user.email}
                  size="sm"
                />
              </button>
              {profileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 py-2 min-w-[160px] border border-black/10 bg-base z-50">
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setProfileMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm text-black hover:bg-black/10 uppercase tracking-wider"
                  >
                    {t("nav.goToProfile")}
                  </Link>
                  {profile?.role === "owner" && (
                    <>
                      <Link
                        href="/dashboard/plans"
                        onClick={() => setProfileMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm text-black hover:bg-black/10 uppercase tracking-wider"
                      >
                        {t("nav.plans")}
                      </Link>
                      <Link
                        href="/dashboard/settings"
                        onClick={() => setProfileMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm text-black hover:bg-black/10 uppercase tracking-wider"
                      >
                        {t("nav.settings")}
                      </Link>
                    </>
                  )}
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="block w-full text-left px-4 py-2.5 text-sm text-black/60 hover:bg-black/10 hover:text-black uppercase tracking-wider"
                  >
                    {t("nav.signOut")}
                  </button>
                </div>
              )}
              </div>
            </div>
          ) : (
            !isAuthPage && (
              <div className="flex items-center gap-3">
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
                  {t("nav.signUp")}
                </Link>
              </div>
            )
          )}
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
