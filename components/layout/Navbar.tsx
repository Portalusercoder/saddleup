"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import NotificationBell from "@/components/NotificationBell";
import UserMenuDropdown from "@/components/layout/UserMenuDropdown";
import TextLogo from "@/components/brand/TextLogo";
import { useProfile } from "@/components/providers/ProfileProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import LanguageToggle from "@/components/layout/LanguageToggle";
import {
  flattenDashboardNav,
  getDashboardNavSections,
} from "@/lib/dashboard/nav-config";

const HERO_SCROLL_THRESHOLD = 0.6;

const MARKETING_LINKS = [
  { href: "/#features", key: "nav.product" as const },
  { href: "/#pricing", key: "nav.pricing" as const },
  { href: "/for-schools", key: "nav.forSchools" as const },
  { href: "/for-trainers", key: "nav.forTrainers" as const },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [marketingMobileOpen, setMarketingMobileOpen] = useState(false);
  const { profile, loading: profileLoading, userId } = useProfile();
  const { t } = useLanguage();

  const user = userId ? { id: userId, email: profile?.email } : null;
  const authChecked = !profileLoading;

  useEffect(() => {
    if (!mobileOpen && !marketingMobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen, marketingMobileOpen]);

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
        className={`block px-4 py-3 text-sm font-medium transition uppercase tracking-wider rounded-control ${
          isActive
            ? "bg-black/10 text-black"
            : "text-black/60 hover:text-black hover:bg-black/5"
        }`}
      >
        {t(item.labelPath)}
      </Link>
    );
  };

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname === "/confirm-email";
  const isHome = pathname === "/";
  const isMarketing =
    isHome || pathname === "/for-schools" || pathname === "/for-trainers";
  const isPhotoHeroPage = isHome || pathname === "/for-schools" || pathname === "/for-trainers";

  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  const [navCompact, setNavCompact] = useState(false);
  useEffect(() => {
    if (!isPhotoHeroPage) return;
    const check = () => {
      const threshold = window.innerHeight * (isHome ? HERO_SCROLL_THRESHOLD : 0.45);
      setScrolledPastHero(window.scrollY > threshold);
      setNavCompact(window.scrollY > 60);
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, [isPhotoHeroPage, isHome]);

  const isClubHero = isPhotoHeroPage && !scrolledPastHero && !user;
  const isDashboard = pathname.startsWith("/dashboard");
  const langToggleVariant = isClubHero ? "light" : isMarketing ? "dark" : "light";

  if (isAuthPage) return null;

  const marketingLinkClass = (onForest: boolean) =>
    `block px-4 py-3.5 text-base font-medium transition-colors su-focus-ring rounded-control ${
      onForest ? "text-white/85 hover:text-white" : "text-forest/80 hover:text-forest"
    }`;

  return (
    <div className="relative">
      <nav
        className={`landing-marketing-nav flex items-center gap-3 fixed top-0 left-0 right-0 w-full z-50 transition-all duration-500 ease-out ${
          isHome && navCompact ? "h-14 sm:h-16" : "h-16 sm:h-20"
        } ${
          isDashboard
            ? "px-4 sm:px-6 md:ps-56 md:pe-12 lg:pe-16 xl:pe-20"
            : "px-4 sm:px-6 lg:px-10 xl:px-14"
        } ${
          isDashboard
            ? "bg-base border-b border-black/10 text-black"
            : isClubHero
              ? "bg-transparent border-b border-white/10 text-mist"
              : isMarketing
                ? "bg-mist/90 backdrop-blur-xl border-b border-forest/[0.06] text-forest"
                : "bg-base border-b border-black/10 text-black"
        }`}
      >
        {isClubHero ? (
          <>
            <div className="flex items-center gap-1 flex-1 min-w-0">
              <button
                type="button"
                onClick={() => setMarketingMobileOpen(true)}
                className="landing-touch-target p-2 -ms-1 text-white/80 hover:text-white hover:bg-white/[0.08] transition-colors rounded-control"
                aria-label={t("nav.menu")}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 7h16M4 12h16" />
                </svg>
              </button>
              <div className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-medium ms-2 text-white/75">
                {MARKETING_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="transition-colors duration-300 hover:text-white"
                  >
                    {t(link.key)}
                  </Link>
                ))}
              </div>
            </div>

            <Link
              href="/"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 shrink-0"
              aria-label="Saddle Up"
            >
              <TextLogo className="text-[0.68rem] sm:text-[0.78rem] text-white/95" />
            </Link>

            <div className="flex items-center justify-end gap-1 sm:gap-2 flex-1 min-w-0">
              <div dir="ltr" className="flex items-center gap-1 sm:gap-2 shrink-0">
                <LanguageToggle variant={langToggleVariant} compact />
                <Link
                  href="/signup"
                  className="hidden sm:inline-flex items-center justify-center min-h-[44px] px-4 py-2 text-xs sm:text-sm font-medium rounded-control bg-mist text-forest hover:bg-white transition-colors su-focus-ring"
                >
                  {t("nav.startFree")}
                </Link>
              </div>
            </div>
          </>
        ) : (
          <>
            {isMarketing && !user ? (
              <Link href="/" className="shrink-0 min-w-0 su-focus-ring rounded-control">
                <TextLogo className="text-[0.62rem] sm:text-[0.72rem] transition-colors truncate text-forest/90" />
              </Link>
            ) : (
              <div className="flex-1 min-w-0 hidden md:block" />
            )}

            {isMarketing && !user && (
              <div className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-medium flex-1 justify-center text-forest/65">
                {MARKETING_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="transition-colors duration-300 hover:text-forest su-focus-ring rounded-sm"
                  >
                    {t(link.key)}
                  </Link>
                ))}
              </div>
            )}

            {isMarketing && !user && <div className="flex-1 lg:hidden min-w-0" aria-hidden />}

            <div
              className={`flex items-center justify-end gap-1.5 sm:gap-2 shrink-0 ${
                isMarketing && !user ? "" : "flex-1 max-lg:flex-none"
              }`}
            >
              {isMarketing && !user && (
                <button
                  type="button"
                  onClick={() => setMarketingMobileOpen(true)}
                  className="landing-touch-target lg:hidden p-2 rounded-control transition-colors text-forest/70 hover:bg-forest/5 su-focus-ring"
                  aria-label={t("nav.menu")}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 7h16M4 12h16M4 17h16" />
                  </svg>
                </button>
              )}

              <div dir="ltr" className="flex items-center gap-1 sm:gap-2 shrink-0">
                <LanguageToggle variant={langToggleVariant} compact={isMarketing} />
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
                        className="landing-touch-target hidden sm:inline-flex px-3 py-2 text-sm font-medium transition-colors duration-300 text-forest/70 hover:text-forest su-focus-ring rounded-control"
                      >
                        {t("nav.signIn")}
                      </Link>
                      <Link
                        href="/signup"
                        className="landing-touch-target min-h-[44px] inline-flex items-center px-3 sm:px-4 py-2 sm:py-2.5 rounded-control text-xs sm:text-sm font-medium transition-all duration-300 whitespace-nowrap bg-accent text-mist hover:opacity-95 su-focus-ring"
                      >
                        {t("nav.startFree")}
                      </Link>
                    </>
                  )
                )}
              </div>
            </div>

            {user && !isAuthPage && (
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-control hover:bg-black/10"
                aria-label={t("nav.menu")}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            )}
          </>
        )}
      </nav>

      {isMarketing && !user && (
        <>
          <div
            className={`lg:hidden fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 ${
              marketingMobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
            onClick={() => setMarketingMobileOpen(false)}
            aria-hidden={!marketingMobileOpen}
          />
          <aside
            className={`lg:hidden fixed top-0 right-0 h-[100dvh] w-[min(100vw,20rem)] bg-base z-[70] transition-transform duration-300 ease-out flex flex-col pb-[env(safe-area-inset-bottom)] ${
              marketingMobileOpen ? "translate-x-0" : "translate-x-full"
            }`}
            aria-hidden={!marketingMobileOpen}
          >
            <div className="h-16 px-5 flex items-center justify-between border-b border-white/10 shrink-0">
              <TextLogo className="text-[0.68rem] text-white/90" />
              <button
                type="button"
                onClick={() => setMarketingMobileOpen(false)}
                className="p-2 text-white/60 hover:text-white rounded-full hover:bg-white/10 transition"
                aria-label={t("nav.closeMenu")}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 overflow-y-auto">
              {MARKETING_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMarketingMobileOpen(false)}
                  className={marketingLinkClass(true)}
                >
                  {t(link.key)}
                </Link>
              ))}
            </nav>
            <div className="p-5 border-t border-white/10 space-y-3 shrink-0">
              <Link
                href="/login"
                onClick={() => setMarketingMobileOpen(false)}
                className="block w-full py-3 text-center text-sm font-medium text-white/80 border border-white/20 rounded-control hover:bg-white/10 transition"
              >
                {t("nav.signIn")}
              </Link>
              <Link
                href="/signup"
                onClick={() => setMarketingMobileOpen(false)}
                className="block w-full min-h-[44px] py-3 text-center text-sm font-medium bg-paddock text-base rounded-control hover:opacity-95 transition su-focus-ring"
              >
                {t("nav.startFree")}
              </Link>
            </div>
          </aside>
        </>
      )}

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
                className="p-2 hover:bg-black/10 transition rounded-control"
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
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleSignOut();
                  }}
                  className="mt-4 block w-full text-left px-4 py-3 text-sm border border-black/15 text-black/80 hover:bg-black/5 transition uppercase tracking-wider rounded-control"
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
