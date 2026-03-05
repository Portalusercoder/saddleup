"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/components/providers/ProfileProvider";
import AddMemberById from "@/components/dashboard/AddMemberById";
import StableLogoUpload from "@/components/dashboard/StableLogoUpload";
import MonthlyReportDownload from "@/components/dashboard/MonthlyReportDownload";

export default function SettingsPage() {
  const router = useRouter();
  const { profile, loading } = useProfile();

  useEffect(() => {
    if (!profile) return;
    if (profile.role !== "owner") {
      router.replace("/dashboard");
    }
  }, [profile, router]);

  if (loading || !profile || profile.role !== "owner") {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-white/50">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-serif text-3xl md:text-4xl font-normal text-white">Settings</h1>
        <p className="text-white/60 mt-2 text-sm">
          Add members by ID, monthly report, and stable logo.
        </p>
      </div>

      <MonthlyReportDownload />
      <StableLogoUpload />
      <AddMemberById />
    </div>
  );
}
  