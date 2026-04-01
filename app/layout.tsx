import "./globals.css"
import Navbar from "@/components/layout/Navbar"
import PagePadding from "@/components/layout/PagePadding"
import TreatsConsent from "@/components/layout/TreatsConsent"
import { ProfileProvider } from "@/components/providers/ProfileProvider"
import { LanguageProvider } from "@/components/providers/LanguageProvider"
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import { Playfair_Display, Inter } from "next/font/google"
import Script from "next/script"

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

export const metadata = {
  title: "Saddle Up",
  description: "Saddle Up platform",
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
    <html lang="en" className={`${playfair.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        {supabaseOrigin ? (
          <link rel="preconnect" href={supabaseOrigin} crossOrigin="anonymous" />
        ) : null}
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){var t=localStorage.getItem('saddleup_theme');if(t==='dark')document.documentElement.classList.add('dark');else if(t==='light')document.documentElement.classList.remove('dark');})();`}
        </Script>
      </head>
      <body className="bg-base text-black font-sans antialiased">
        <ThemeProvider>
          <LanguageProvider>
            <ProfileProvider>
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
