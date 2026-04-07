"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { readTreatsConsent, TREATS_STORAGE_KEY } from "@/lib/treatsConsent";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const CONSENT_EVENT = "saddleup:treats-consent-changed";
const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function GoogleAnalyticsProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const refreshConsent = () => {
      setEnabled(readTreatsConsent() === "all");
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
    if (!enabled || !gaId || !window.gtag) return;
    const url = searchParams?.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname;
    window.gtag("config", gaId, { page_path: url });
  }, [enabled, pathname, searchParams]);

  if (!gaId || !enabled) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${gaId}', { send_page_view: true });
        `}
      </Script>
    </>
  );
}
