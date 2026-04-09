import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

function normalizeOrigin(raw?: string): string | null {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    return `${u.protocol}//${u.host}`;
  } catch {
    return null;
  }
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const appOrigin = normalizeOrigin(process.env.NEXT_PUBLIC_APP_URL);
const appHost = (() => {
  if (!appOrigin) return null;
  try {
    return new URL(appOrigin).host;
  } catch {
    return null;
  }
})();
const supabaseOrigin = normalizeOrigin(process.env.NEXT_PUBLIC_SUPABASE_URL);
const sentryOrigin = (() => {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return null;
  try {
    return new URL(dsn).origin;
  } catch {
    return null;
  }
})();
const imgSources = [
  "'self'",
  "data:",
  "blob:",
  ...(appOrigin ? [appOrigin] : []),
  ...(supabaseOrigin ? [supabaseOrigin] : []),
];
const connectSources = [
  "'self'",
  "https://www.google-analytics.com",
  "https://region1.google-analytics.com",
  "https://www.clarity.ms",
  "https://challenges.cloudflare.com",
  ...(supabaseOrigin ? [supabaseOrigin] : []),
  ...(sentryOrigin ? [sentryOrigin] : []),
];
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.clarity.ms https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  `img-src ${imgSources.join(" ")}`,
  "font-src 'self' data:",
  `connect-src ${connectSources.join(" ")}`,
  "frame-src 'self' https://challenges.cloudflare.com",
].join("; ");

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy", value: csp },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async rewrites() {
    return [
      {
        source: "/ingest/:path*",
        destination: "https://api-js.mixpanel.com/:path*",
      },
    ];
  },
  async redirects() {
    const redirects: Array<{
      source: string;
      destination: string;
      permanent: boolean;
      has?: Array<{ type: "host"; value: string }>;
    }> = [
      {
        source: "/favicon.ico",
        destination: "/icon.svg",
        permanent: true,
      },
    ];

    if (appOrigin && appHost) {
      redirects.unshift({
        source: "/:path*",
        has: [
          {
            type: "host",
            value: `((?!^${escapeRegex(appHost)}$).+)`,
          },
        ],
        destination: `${appOrigin}/:path*`,
        permanent: true,
      });
    }

    return redirects;
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: appOrigin
          ? [...securityHeaders, { key: "Access-Control-Allow-Origin", value: appOrigin }]
          : securityHeaders,
      },
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  disableLogger: true,
});
