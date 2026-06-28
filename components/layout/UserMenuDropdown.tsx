"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";

type UserMenuDropdownProps = {
  fullName?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  isOwner: boolean;
  onSignOut: () => void | Promise<void>;
};

function getInitials(name: string | null | undefined): string {
  if (!name?.trim()) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function MenuAvatar({
  name,
  avatarUrl,
  size,
}: {
  name?: string | null;
  avatarUrl?: string | null;
  size: "trigger" | "header";
}) {
  const dim = size === "trigger" ? "w-9 h-9 text-xs" : "w-9 h-9 text-xs";

  return (
    <div
      className={`${dim} shrink-0 rounded-full overflow-hidden flex items-center justify-center font-medium bg-[#2a2a2a] text-[#c9a87c]`}
      aria-hidden
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
}

function IconUser() {
  return (
    <svg className="user-menu-item-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconBilling() {
  return (
    <svg className="user-menu-item-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path strokeLinecap="round" d="M2 10h20" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg className="user-menu-item-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path strokeLinecap="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function IconSignOut() {
  return (
    <svg className="user-menu-item-icon user-menu-item-icon-danger" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}

type MenuItem = {
  id: string;
  href?: string;
  label: string;
  icon: ReactNode;
  destructive?: boolean;
  onSelect?: () => void;
};

export default function UserMenuDropdown({
  fullName,
  email,
  avatarUrl,
  isOwner,
  onSignOut,
}: UserMenuDropdownProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuClosing, setMenuClosing] = useState(false);
  const [pressedId, setPressedId] = useState<string | null>(null);

  const showMenu = menuOpen || menuClosing;

  const closeMenu = useCallback(() => {
    if (!menuOpen) return;
    setMenuOpen(false);
    setMenuClosing(true);
    window.setTimeout(() => setMenuClosing(false), 180);
  }, [menuOpen]);

  const openMenu = useCallback(() => {
    setMenuClosing(false);
    setMenuOpen(true);
  }, []);

  const toggleMenu = useCallback(() => {
    if (menuOpen) closeMenu();
    else openMenu();
  }, [menuOpen, closeMenu, openMenu]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen, closeMenu]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    };
    if (menuOpen) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [menuOpen, closeMenu]);

  const selectItem = (item: MenuItem) => {
    setPressedId(item.id);
    window.setTimeout(() => {
      closeMenu();
      setPressedId(null);
      if (item.onSelect) {
        void item.onSelect();
      } else if (item.href) {
        router.push(item.href);
      }
    }, 120);
  };

  const navItems: MenuItem[] = [
    {
      id: "profile",
      href: "/dashboard/profile",
      label: t("nav.profile"),
      icon: <IconUser />,
    },
  ];

  if (isOwner) {
    navItems.push(
      {
        id: "plans",
        href: "/dashboard/plans",
        label: t("nav.plansBilling"),
        icon: <IconBilling />,
      },
      {
        id: "settings",
        href: "/dashboard/settings",
        label: t("nav.settings"),
        icon: <IconSettings />,
      }
    );
  }

  const displayName = fullName?.trim() || email?.split("@")[0] || t("nav.profile");

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={toggleMenu}
        className={`user-menu-trigger ${menuOpen ? "user-menu-trigger-open" : ""}`}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        title={t("nav.profileMenu")}
      >
        <MenuAvatar name={fullName ?? email} avatarUrl={avatarUrl} size="trigger" />
      </button>

      {showMenu && (
        <div
          role="menu"
          className={`user-menu-dropdown ${menuClosing ? "user-menu-dropdown-exit" : "user-menu-dropdown-enter"}`}
        >
          <div className="user-menu-header">
            <MenuAvatar name={fullName ?? email} avatarUrl={avatarUrl} size="header" />
            <div className="min-w-0">
              <p className="truncate text-[15px] font-medium text-white">{displayName}</p>
              {email ? (
                <p className="truncate text-xs text-white/45 mt-0.5">{email}</p>
              ) : null}
            </div>
          </div>

          <div className="user-menu-divider" />

          <div className="py-1 px-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                onClick={() => selectItem(item)}
                className={`user-menu-item w-full text-start ${pressedId === item.id ? "user-menu-item-pressed" : ""}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="user-menu-divider" />

          <div className="py-1 px-2">
            <button
              type="button"
              role="menuitem"
              onClick={() =>
                selectItem({
                  id: "signout",
                  label: t("nav.signOut"),
                  icon: <IconSignOut />,
                  destructive: true,
                  onSelect: onSignOut,
                })
              }
              className={`user-menu-item user-menu-item-danger w-full text-start ${pressedId === "signout" ? "user-menu-item-pressed" : ""}`}
            >
              <IconSignOut />
              <span>{t("nav.signOut")}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
