"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/components/providers/ProfileProvider";
import AddMemberById from "@/components/dashboard/AddMemberById";
import StableLogoUpload from "@/components/dashboard/StableLogoUpload";
import MonthlyReportDownload from "@/components/dashboard/MonthlyReportDownload";
import PageLoader from "@/components/ui/PageLoader";
import GuidedTourOverlay, { type GuidedTourStep } from "@/components/dashboard/GuidedTourOverlay";
import { usePageTour } from "@/components/dashboard/usePageTour";

export default function SettingsPage() {
  const router = useRouter();
  const { profile, loading } = useProfile();
  const { open: showTour, complete: completeTour } = usePageTour(
    "saddleup_tour_settings_v1",
    !loading && Boolean(profile) && profile?.role === "owner"
  );
  const tourSteps: GuidedTourStep[] = [
    { id: "report", title: "Monthly Report", description: "Download your stable summary report.", selector: '[data-tour="settings-report"]' },
    { id: "logo", title: "Stable Logo", description: "Upload and update your stable branding.", selector: '[data-tour="settings-logo"]' },
    { id: "members", title: "Add Members", description: "Invite team members by ID quickly.", selector: '[data-tour="settings-members"]' },
  ];

  useEffect(() => {
    if (!profile) return;
    if (profile.role !== "owner") {
      router.replace("/dashboard");
    }
  }, [profile, router]);

  if (loading || !profile || profile.role !== "owner") {
    return <PageLoader minHeight="min-h-[40vh]" message="Loading…" />;
  }

  return (
    <div className="space-y-10">
      <GuidedTourOverlay
        open={showTour}
        steps={tourSteps}
        onSkip={completeTour}
        onComplete={completeTour}
      />
      <div>
        <h1 className="font-serif text-3xl md:text-4xl font-normal text-black">Settings</h1>
        <p className="text-black/60 mt-2 text-sm">
          Add members by ID, monthly report, and stable logo.
        </p>
      </div>

      <div data-tour="settings-report">
        <MonthlyReportDownload />
      </div>
      <div data-tour="settings-logo">
        <StableLogoUpload />
      </div>
      <div data-tour="settings-members">
        <AddMemberById />
      </div>
    </div>
  );
}
  