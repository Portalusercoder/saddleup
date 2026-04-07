"use client";

import mixpanel from "mixpanel-browser";
import { readTreatsConsent } from "@/lib/treatsConsent";

type Props = Record<string, string | number | boolean | null | undefined>;

let initialized = false;

export function initMixpanel() {
  if (initialized) return;
  const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
  if (!token) return;

  mixpanel.init(token, {
    api_host: process.env.NEXT_PUBLIC_MIXPANEL_API_HOST || "https://api-js.mixpanel.com",
    persistence: "localStorage",
    ignore_dnt: false,
    autocapture: true,
    track_pageview: false,
  });
  initialized = true;
  syncAnalyticsConsent();
}

export function syncAnalyticsConsent() {
  if (!initialized) return;
  if (readTreatsConsent() === "all") {
    mixpanel.opt_in_tracking();
  } else {
    mixpanel.opt_out_tracking();
  }
}

export function identifyUser(userId: string, props?: Props) {
  if (!initialized || !userId || readTreatsConsent() !== "all") return;
  mixpanel.identify(userId);
  if (props) mixpanel.people.set(props);
}

export function resetAnalyticsUser() {
  if (!initialized) return;
  mixpanel.reset();
}

export function trackEvent(event: string, props?: Props) {
  if (!initialized || readTreatsConsent() !== "all") return;
  mixpanel.track(event, props);
}
