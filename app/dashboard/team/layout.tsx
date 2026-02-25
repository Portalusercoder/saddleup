"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useProfile } from "@/components/providers/ProfileProvider";
import AddMemberById from "@/components/dashboard/AddMemberById";

const subNavItems = [
  { href: "/dashboard/team/riders", label: "Riders" },
  { href: "/dashboard/team/trainers", label: "Trainers" },
  { href: "/dashboard/team/workers", label: "Workers" },
];

export default function TeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
      : subNavItems.filter((item) => item.label !== "Workers");

  const refetchTeam = () => {
    window.dispatchEvent(new CustomEvent("team-refresh"));
  };

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl md:text-3xl font-normal text-white">
        Team Management
      </h1>

      <AddMemberById onSuccess={refetchTeam} />

      <nav className="flex gap-2 border-b border-white/10 pb-2">
        {visibleSubNav.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2 text-sm font-medium uppercase tracking-wider transition ${
                isActive
                  ? "text-white border-b-2 border-white -mb-[10px] pb-2"
                  : "text-white/50 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {children}
    </div>
  );
}
