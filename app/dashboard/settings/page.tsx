"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/components/providers/ProfileProvider";
import StableLogoUpload from "@/components/dashboard/StableLogoUpload";
import MonthlyReportDownload from "@/components/dashboard/MonthlyReportDownload";
import PageLoader from "@/components/ui/PageLoader";
import GuidedTourOverlay, { type GuidedTourStep } from "@/components/dashboard/GuidedTourOverlay";
import { usePageTour } from "@/components/dashboard/usePageTour";
import { useLanguage } from "@/components/providers/LanguageProvider";

function SettingsSection({
  title,
  description,
  children,
  tourId,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  tourId?: string;
}) {
  return (
    <section className="space-y-4" data-tour={tourId}>
      <div>
        <h2 className="font-serif text-xl text-black dark:text-white">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-black/60 dark:text-white/60">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export default function SettingsPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { profile, loading } = useProfile();
  const { open: showTour, complete: completeTour } = usePageTour(
    "saddleup_tour_settings_v1",
    !loading && Boolean(profile) && profile?.role === "owner"
  );
  const tourSteps: GuidedTourStep[] = [
    {
      id: "logo",
      title: t("settingsTour.logoTitle"),
      description: t("settingsTour.logoDesc"),
      selector: '[data-tour="settings-logo"]',
    },
    {
      id: "report",
      title: t("settingsTour.reportTitle"),
      description: t("settingsTour.reportDesc"),
      selector: '[data-tour="settings-report"]',
    },
    {
      id: "billing",
      title: t("settingsTour.billingTitle"),
      description: t("settingsTour.billingDesc"),
      selector: '[data-tour="settings-billing"]',
    },
  ];

  useEffect(() => {
    if (!profile) return;
    if (profile.role !== "owner") {
      router.replace("/dashboard");
    }
  }, [profile, router]);

  if (loading || !profile || profile.role !== "owner") {
    return <PageLoader minHeight="min-h-[40vh]" message={t("common.loading")} />;
  }

  return (
    <div className="space-y-12">
      <GuidedTourOverlay
        open={showTour}
        steps={tourSteps}
        onSkip={completeTour}
        onComplete={completeTour}
      />
      <div>
        <h1 className="font-serif text-3xl md:text-4xl font-normal text-black dark:text-white">
          {t("dashboard.settingsPageTitle")}
        </h1>
        <p className="text-black/60 mt-2 text-sm dark:text-white/60">
          {t("dashboard.settingsSubtitle")}
        </p>
      </div>

      <SettingsSection
        title={t("dashboard.settingsSectionProfile")}
        description={t("dashboard.settingsSectionProfileDesc")}
        tourId="settings-logo"
      >
        <StableLogoUpload />
      </SettingsSection>

      <SettingsSection
        title={t("dashboard.settingsSectionReports")}
        description={t("dashboard.settingsSectionReportsDesc")}
        tourId="settings-report"
      >
        <MonthlyReportDownload />
      </SettingsSection>

      <SettingsSection
        title={t("dashboard.settingsSectionBilling")}
        description={t("dashboard.settingsSectionBillingDesc")}
        tourId="settings-billing"
      >
        <Link
          href="/dashboard/plans"
          className="block border border-black/10 p-5 hover:border-black/20 hover:bg-black/[0.02] transition dark:border-white/15 dark:hover:border-white/25 dark:hover:bg-white/5"
        >
          <p className="font-medium text-black dark:text-white">{t("navRole.plans")}</p>
          <p className="mt-1 text-sm text-black/60 dark:text-white/60">
            {t("dashboard.settingsBillingCardDesc")}
          </p>
          <span className="mt-3 inline-block text-sm font-medium uppercase tracking-wider text-accent">
            {t("dashboard.settingsBillingCardCta")} →
          </span>
        </Link>
      </SettingsSection>
    </div>
  );
}
