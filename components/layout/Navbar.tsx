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

const navItemsByRole: Record<string, { href: string; label: string }[]> = {
  guardian: [
    { href: "/dashboard/guardian", label: "Parent Portal" },
    { href: "/dashboard/profile", label: "Profile" },
  ],
  student: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/my-horses", label: "My Horses" },
    { href: "/dashboard/bookings", label: "My Bookings" },
    { href: "/dashboard/training-history", label: "Training History" },
    { href: "/dashboard/competitions", label: "Competitions" },
    { href: "/dashboard/profile", label: "Profile" },
  ],
  trainer: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/horses", label: "Horses" },
    { href: "/dashboard/team", label: "Team Management" },
    { href: "/dashboard/bookings", label: "Bookings" },
    { href: "/dashboard/schedule", label: "Schedule" },
    { href: "/dashboard/analytics", label: "Analytics" },
    { href: "/dashboard/matching", label: "Matching" },
    { href: "/dashboard/incidents", label: "Incidents" },
    { href: "/dashboard/profile", label: "Profile" },
  ],
  owner: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/horses", label: "Horses" },
    { href: "/dashboard/team", label: "Team Management" },
    { href: "/dashboard/bookings", label: "Bookings" },
    { href: "/dashboard/schedule", label: "Schedule" },
    { href: "/dashboard/analytics", label: "Analytics" },
    { href: "/dashboard/matching", label: "Matching" },
    { href: "/dashboard/incidents", label: "Incidents" },
    { href: "/dashboard/settings", label: "Billing & Plan" },
    { href: "/dashboard/profile", label: "Profile" },
  ],
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const { profile, loading: profileLoading, userId } = useProfile();
  const { lang } = useLanguage();

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
            ? "bg-white/10 text-white"
            : "text-white/60 hover:text-white hover:bg-white/5"
        }`}
      >
        {item.label}
      </Link>
    );
  };

  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isHome = pathname === "/";

  return (
    <div className="relative">
      <nav
        className={`h-20 w-full flex items-center justify-between px-4 sm:px-6 md:px-12 lg:px-16 xl:px-20 text-white fixed top-0 left-0 right-0 z-50 ${
          isHome ? "bg-black/95 backdrop-blur-sm" : "bg-black border-b border-white/10"
        }`}
      >
        {/* Left: spacer for balance */}
        <div className="flex-1" />

        {/* Center: Nav links (home page only) */}
        {isHome && !user && (
          <div className="hidden lg:flex items-center gap-6 xl:gap-8 uppercase text-[0.65rem] md:text-[0.7rem] tracking-[0.2em] font-light text-white/90">
            <Link href="/#features" className="hover:text-white transition">
              {lang === "ar" ? "المزايا" : "Features"}
            </Link>
            <Link href="/#pricing" className="hover:text-white transition">
              {lang === "ar" ? "الأسعار" : "Pricing"}
            </Link>
            <Link href="/#about" className="hover:text-white transition">
              {lang === "ar" ? "عن المنصة" : "About"}
            </Link>
            <Link href="/#pricing" className="hover:text-white transition">
              {lang === "ar" ? "معلومات" : "Information"}
            </Link>
            <Link href="/login" className="hover:text-white transition">
              {lang === "ar" ? "تواصل" : "Contact"}
            </Link>
          </div>
        )}

        {/* Right: Sign in / Sign up or profile avatar */}
        <div className="flex-1 flex items-center justify-end gap-2">
          {authChecked && user ? (
            <div className="flex items-center gap-3">
              {!isAuthPage && !isHome && <NotificationBell />}
              <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setProfileMenuOpen((o) => !o)}
                className="flex items-center hover:opacity-90 transition rounded-full focus:outline-none focus:ring-2 focus:ring-white/30"
                aria-expanded={profileMenuOpen}
                aria-haspopup="true"
                title="Profile menu"
              >
                <ProfileAvatar
                  avatarUrl={profile?.avatarUrl}
                  name={profile?.fullName ?? user.email}
                  size="sm"
                />
              </button>
              {profileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 py-2 min-w-[160px] border border-white/10 bg-black z-50">
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setProfileMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm text-white hover:bg-white/10 uppercase tracking-wider"
                  >
                    Go to profile
                  </Link>
                  {profile?.role === "owner" && (
                    <>
                      <Link
                        href="/dashboard/plans"
                        onClick={() => setProfileMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm text-white hover:bg-white/10 uppercase tracking-wider"
                      >
                        Plans
                      </Link>
                      <Link
                        href="/dashboard/settings"
                        onClick={() => setProfileMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm text-white hover:bg-white/10 uppercase tracking-wider"
                      >
                        Settings
                      </Link>
                    </>
                  )}
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="block w-full text-left px-4 py-2.5 text-sm text-white/60 hover:bg-white/10 hover:text-white uppercase tracking-wider"
                  >
                    Sign out
                  </button>
                </div>
              )}
              </div>
            </div>
          ) : (
            !isAuthPage && (
              <div className="flex items-center gap-3">
                <LanguageToggle />
                <Link
                  href="/login"
                  className="px-4 py-2.5 border border-white text-white hover:bg-white/10 transition uppercase tracking-[0.2em] text-[0.7rem] font-light"
                >
                  {lang === "ar" ? "تسجيل الدخول" : "Sign in"}
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2.5 bg-white text-black font-medium hover:bg-white/95 transition uppercase tracking-[0.2em] text-[0.7rem]"
                >
                  {lang === "ar" ? "إنشاء حساب" : "Sign up"}
                </Link>
              </div>
            )
          )}
        </div>

        {/* Mobile menu button (dashboard only) */}
        {user && !isAuthPage && (
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10"
            aria-label="Menu"
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

      {mobileOpen && user && !isAuthPage && !isHome && (
        <div className="md:hidden absolute top-20 left-0 right-0 bg-black border-b border-white/10 py-2 px-4 z-40 max-h-[calc(100vh-5rem)] overflow-y-auto">
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
