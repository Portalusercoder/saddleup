"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useProfile } from "@/components/providers/ProfileProvider";
import AddMemberById from "@/components/dashboard/AddMemberById";
import { useLanguage } from "@/components/providers/LanguageProvider";

const subNavItems = [
  { href: "/dashboard/team/riders", labelPath: "dashboard.ridersTitle" },
  { href: "/dashboard/team/trainers", labelPath: "dashboard.trainersTitle" },
  { href: "/dashboard/team/workers", labelPath: "dashboard.workersTitle" },
] as const;

export default function TeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useProfile();

  useEffect(() => {
    if (!profile) return;
    if (profile.role === "student") {
      router.replace("/dashboard");
    }
  }, [profile, router]);

  const visibleSubNav =
    profile?.role === "owner"
      ? subNavItems
      : subNavItems.filter((item) => item.href !== "/dashboard/team/workers");

  const refetchTeam = () => {
    window.dispatchEvent(new CustomEvent("team-refresh"));
  };

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl md:text-3xl font-normal text-black">
        {t("navRole.teamManagement")}
      </h1>

      <AddMemberById onSuccess={refetchTeam} />

      <nav className="flex gap-2 border-b border-black/10 pb-2">
        {visibleSubNav.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2 text-sm font-medium uppercase tracking-wider transition ${
                isActive
                  ? "text-black border-b-2 border-black -mb-[10px] pb-2"
                  : "text-black/50 hover:text-black"
              }`}
            >
              {t(item.labelPath)}
            </Link>
          );
        })}
      </nav>

      {children}
    </div>
  );
}
