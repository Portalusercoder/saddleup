"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { useProfile } from "@/components/providers/ProfileProvider";
import { readTreatsConsent, TREATS_STORAGE_KEY } from "@/lib/treatsConsent";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = "/ingest";
const POSTHOG_UI_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.posthog.com";
const CONSENT_EVENT = "saddleup:treats-consent-changed";

function syncConsent() {
  const allowOptional = readTreatsConsent() === "all";
  posthog.set_config({ disable_session_recording: !allowOptional });
  if (allowOptional) {
    posthog.opt_in_capturing();
  } else {
    posthog.opt_out_capturing();
  }
  return allowOptional;
}

export default function PostHogProvider() {
  const { profile, userId } = useProfile();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!POSTHOG_KEY) return;
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      ui_host: POSTHOG_UI_HOST,
      person_profiles: "identified_only",
      capture_pageview: false,
      capture_pageleave: true,
      autocapture: true,
      session_recording: {
        maskAllInputs: true,
        maskInputOptions: {
          password: true,
          email: true,
        },
      },
    });

    syncConsent();

    const handleStorage = (evt: StorageEvent) => {
      if (!evt.key || evt.key === TREATS_STORAGE_KEY) syncConsent();
    };
    const handleConsentEvent = () => {
      syncConsent();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(CONSENT_EVENT, handleConsentEvent);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(CONSENT_EVENT, handleConsentEvent);
    };
  }, []);

  useEffect(() => {
    if (!POSTHOG_KEY) return;
    const allowOptional = syncConsent();
    if (!allowOptional) return;

    const qs = searchParams?.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!POSTHOG_KEY) return;
    const allowOptional = syncConsent();
    if (!allowOptional) return;

    if (userId) {
      posthog.identify(userId, {
        role: profile?.role ?? null,
        full_name: profile?.fullName ?? null,
      });
    } else {
      posthog.reset();
    }
  }, [profile?.fullName, profile?.role, userId]);

  return null;
}
