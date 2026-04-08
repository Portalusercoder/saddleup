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

const appOrigin = normalizeOrigin(process.env.NEXT_PUBLIC_APP_URL);
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.clarity.ms",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https:",
  "connect-src 'self' https://api-js.mixpanel.com https://*.mixpanel.com https://www.google-analytics.com https://region1.google-analytics.com https://www.clarity.ms https://*.ingest.sentry.io https://*.sentry.io",
  "frame-src 'self'",
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
    return [
      {
        source: "/favicon.ico",
        destination: "/icon.svg",
        permanent: true,
      },
    ];
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
        headers: appOrigin
          ? [...securityHeaders, { key: "Access-Control-Allow-Origin", value: appOrigin }]
          : securityHeaders,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  disableLogger: true,
});
