"use client";

import posthog from "posthog-js";
import { readTreatsConsent } from "@/lib/treatsConsent";

type Properties = Record<string, string | number | boolean | null | undefined>;

export function captureClientEvent(event: string, properties?: Properties) {
  try {
    if (readTreatsConsent() !== "all") return;
    posthog.capture(event, {
      ...properties,
      source: "client",
    });
  } catch {
    // Never break UX for analytics failures.
  }
}
