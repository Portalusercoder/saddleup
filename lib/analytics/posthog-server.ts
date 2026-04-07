import { PostHog } from "posthog-node";

type Properties = Record<string, string | number | boolean | null | undefined>;

let client: PostHog | null | undefined;

function getClient(): PostHog | null {
  if (client !== undefined) return client;

  const apiKey = process.env.POSTHOG_API_KEY || process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!apiKey) {
    client = null;
    return client;
  }

  client = new PostHog(apiKey, {
    host: process.env.POSTHOG_HOST || process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    flushAt: 1,
    flushInterval: 0,
  });
  return client;
}

export function captureServerEvent(
  event: string,
  distinctId: string,
  properties?: Properties
) {
  const ph = getClient();
  if (!ph || !distinctId) return;

  try {
    void ph.capture({
      event,
      distinctId,
      properties: {
        ...properties,
        source: "server",
      },
    });
  } catch (err) {
    console.error("PostHog capture failed:", err);
  }
}
