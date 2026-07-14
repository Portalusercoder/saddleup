"use client";

import Link from "next/link";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { trackEvent } from "@/lib/analytics/mixpanel-client";

type OnboardingChecklistProps = {
  role: string | undefined;
  horseCount: number;
  joinCode?: string | null;
  saving?: boolean;
  onDismiss: () => void;
  onComplete: () => void;
};

export default function OnboardingChecklist({
  role,
  horseCount,
  joinCode,
  saving = false,
  onDismiss,
  onComplete,
}: OnboardingChecklistProps) {
  const { t } = useLanguage();
  const hasHorse = horseCount > 0;

  const copyJoinCode = async () => {
    if (!joinCode) return;
    try {
      await navigator.clipboard.writeText(joinCode);
      trackEvent("onboarding_invite_copied");
    } catch {
      /* ignore */
    }
  };

  const primaryDone =
    role === "owner" || role === "trainer"
      ? hasHorse
      : role === "student"
        ? true
        : true;

  return (
    <section
      className="su-hairline rounded-control p-6 sm:p-8"
      aria-labelledby="onboarding-checklist-title"
    >
      <h2
        id="onboarding-checklist-title"
        className="font-serif text-2xl text-black dark:text-white"
      >
        {t("dashboard.onboardingChecklistTitle")}
      </h2>
      <p className="mt-2 text-sm text-black/60 dark:text-white/60">
        {t("dashboard.onboardingChecklistSub")}
      </p>

      <ul className="mt-6 space-y-4">
        {(role === "owner" || role === "trainer") && (
          <li className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium text-black dark:text-white flex items-center gap-2">
                <span
                  className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                    hasHorse
                      ? "bg-accent text-white"
                      : "border border-black/25 dark:border-white/25 text-black/50"
                  }`}
                  aria-hidden
                >
                  {hasHorse ? "✓" : "1"}
                </span>
                {t("dashboard.onboardingAddHorseTitle")}
              </p>
              <p className="mt-1 text-sm text-black/55 dark:text-white/55 ms-7">
                {t("dashboard.onboardingAddHorseDesc")}
              </p>
            </div>
            {!hasHorse && (
              <Link
                href="/dashboard/horses?add=1"
                className="su-btn-primary shrink-0"
              >
                {t("dashboard.onboardingAddHorseCta")}
              </Link>
            )}
          </li>
        )}

        {role === "owner" && (
          <li className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium text-black dark:text-white flex items-center gap-2">
                <span
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full text-xs border border-black/25 dark:border-white/25 text-black/50"
                  aria-hidden
                >
                  2
                </span>
                {t("dashboard.onboardingInviteTitle")}
              </p>
              <p className="mt-1 text-sm text-black/55 dark:text-white/55 ms-7">
                {t("dashboard.onboardingInviteDesc")}
                {joinCode ? (
                  <span className="block mt-1 font-mono tracking-widest text-black/80 dark:text-white/80">
                    {joinCode}
                  </span>
                ) : null}
              </p>
            </div>
            {joinCode ? (
              <button
                type="button"
                onClick={copyJoinCode}
                className="inline-flex min-h-[44px] items-center justify-center px-4 py-2.5 border border-black/20 text-black text-sm font-medium uppercase tracking-wider rounded-control hover:bg-black/[0.04] dark:border-white/20 dark:text-white shrink-0"
              >
                {t("dashboard.onboardingInviteCta")}
              </button>
            ) : null}
          </li>
        )}

        {role === "trainer" && !hasHorse && (
          <li className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium text-black dark:text-white">
                {t("dashboard.onboardingTrainerTitle")}
              </p>
              <p className="mt-1 text-sm text-black/55 dark:text-white/55">
                {t("dashboard.onboardingTrainerDesc")}
              </p>
            </div>
            <Link
              href="/dashboard/horses"
              className="su-btn-primary shrink-0"
            >
              {t("dashboard.onboardingTrainerCta")}
            </Link>
          </li>
        )}

        {role === "student" && (
          <li className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium text-black dark:text-white">
                {t("dashboard.onboardingStudentTitle")}
              </p>
              <p className="mt-1 text-sm text-black/55 dark:text-white/55">
                {t("dashboard.onboardingStudentDesc")}
              </p>
            </div>
            <Link
              href="/dashboard/bookings"
              className="su-btn-primary shrink-0"
            >
              {t("dashboard.onboardingStudentCta")}
            </Link>
          </li>
        )}
      </ul>

      <div className="mt-6 flex flex-wrap gap-3">
        {primaryDone && (
          <button
            type="button"
            disabled={saving}
            onClick={() => {
              trackEvent("onboarding_checklist_completed", { role: role ?? "unknown" });
              onComplete();
            }}
            className="su-btn-primary disabled:opacity-50"
          >
            {saving ? t("common.loading") : t("dashboard.onboardingDone")}
          </button>
        )}
        <button
          type="button"
          disabled={saving}
          onClick={() => {
            trackEvent("onboarding_checklist_dismissed", { role: role ?? "unknown" });
            onDismiss();
          }}
          className="inline-flex min-h-[44px] items-center justify-center px-4 py-2.5 text-sm text-black/55 hover:text-black dark:text-white/55 dark:hover:text-white disabled:opacity-50"
        >
          {t("dashboard.onboardingDismiss")}
        </button>
      </div>
    </section>
  );
}
