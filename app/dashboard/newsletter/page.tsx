"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/components/providers/ProfileProvider";
import TableSkeleton from "@/components/ui/TableSkeleton";

export default function NewsletterRedirectPage() {
  const router = useRouter();
  const { profile, loading } = useProfile();

  useEffect(() => {
    if (!profile) return;
    if (profile.role === "owner") {
      router.replace("/dashboard/notices");
    } else {
      router.replace("/dashboard");
    }
  }, [profile, router]);

  if (loading || !profile) {
    return (
      <div className="space-y-6">
        <h1 className="font-serif text-3xl md:text-4xl font-normal text-white">
          Notices
        </h1>
        <TableSkeleton rows={6} cols={4} />
      </div>
    );
  }

  return null;
}
