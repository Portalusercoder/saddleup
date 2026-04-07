"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useProfile } from "@/components/providers/ProfileProvider";
import {
  identifyUser,
  initMixpanel,
  resetAnalyticsUser,
  syncAnalyticsConsent,
  trackEvent,
} from "@/lib/analytics/mixpanel-client";
import { readTreatsConsent, TREATS_STORAGE_KEY } from "@/lib/treatsConsent";

const CONSENT_EVENT = "saddleup:treats-consent-changed";
const clarityProjectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

export default function AnalyticsProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { profile, userId } = useProfile();
  const [canLoadOptional, setCanLoadOptional] = useState(false);

  useEffect(() => {
    initMixpanel();
    const refreshConsent = () => {
      syncAnalyticsConsent();
      setCanLoadOptional(readTreatsConsent() === "all");
    };
    refreshConsent();

    const onStorage = (event: StorageEvent) => {
      if (!event.key || event.key === TREATS_STORAGE_KEY) refreshConsent();
    };
    const onConsentEvent = () => refreshConsent();
    window.addEventListener("storage", onStorage);
    window.addEventListener(CONSENT_EVENT, onConsentEvent);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(CONSENT_EVENT, onConsentEvent);
    };
  }, []);

  useEffect(() => {
    const url = searchParams?.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname;
    trackEvent("page_viewed", { path: pathname, url });
  }, [pathname, searchParams]);

  useEffect(() => {
    if (userId) {
      identifyUser(userId, {
        role: profile?.role ?? null,
      });
    } else {
      resetAnalyticsUser();
    }
  }, [profile?.role, userId]);

  return clarityProjectId && canLoadOptional ? (
    <Script id="ms-clarity" strategy="afterInteractive">
      {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "${clarityProjectId}");`}
    </Script>
  ) : null;
}
