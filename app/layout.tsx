import "./globals.css"
import Navbar from "@/components/layout/Navbar"
import PagePadding from "@/components/layout/PagePadding"
import TreatsConsent from "@/components/layout/TreatsConsent"
import { ProfileProvider } from "@/components/providers/ProfileProvider"
import { LanguageProvider } from "@/components/providers/LanguageProvider"
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import AnalyticsProvider from "@/components/providers/AnalyticsProvider"
import GoogleAnalyticsProvider from "@/components/providers/GoogleAnalyticsProvider"
import { Playfair_Display, Inter, Tajawal, Pinyon_Script } from "next/font/google"
import Script from "next/script"
import type { Metadata } from "next"
import { Suspense } from "react"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const tajawal = Tajawal({
  subsets: ["arabic"],
  variable: "--font-tajawal",
  weight: ["400", "500", "700"],
  display: "swap",
})

const pinyonScript = Pinyon_Script({
  subsets: ["latin"],
  variable: "--font-hero-script",
  weight: "400",
  display: "swap",
})

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.saddleup-sa.com";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Saddle Up | Horse & Stable Management Software",
    template: "%s | Saddle Up",
  },
  description:
    "Saddle Up helps riding schools, trainers, and horse owners manage horses, riders, bookings, sessions, and stable operations in one place.",
  applicationName: "Saddle Up",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    type: "website",
    siteName: "Saddle Up",
    title: "Saddle Up | Horse & Stable Management Software",
    description:
      "Manage horses, riders, lessons, sessions, and stable operations in one place.",
    url: "/",
    images: [{ url: "/hero-bg.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Saddle Up | Horse & Stable Management Software",
    description:
      "Manage horses, riders, lessons, sessions, and stable operations in one place.",
    images: ["/hero-bg.png"],
  },
}

function supabasePreconnectOrigin(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabaseOrigin = supabasePreconnectOrigin()

  return (
    <html
      lang="en"
      className={`dark ${playfair.variable} ${inter.variable} ${tajawal.variable} ${pinyonScript.variable}`}
      suppressHydrationWarning
    >
      <head>
        {supabaseOrigin ? (
          <link rel="preconnect" href={supabaseOrigin} crossOrigin="anonymous" />
        ) : null}
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){document.documentElement.classList.add('dark');try{localStorage.setItem('saddleup_theme','dark');}catch(e){}})();`}
        </Script>
      </head>
      <body className="bg-base text-black font-sans antialiased">
        <ThemeProvider>
          <LanguageProvider>
            <ProfileProvider>
              <Suspense fallback={null}>
                <AnalyticsProvider />
                <GoogleAnalyticsProvider />
              </Suspense>
              <Navbar />
              <PagePadding>{children}</PagePadding>
              <TreatsConsent />
            </ProfileProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
