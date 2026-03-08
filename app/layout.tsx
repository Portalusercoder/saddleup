import "./globals.css"
import Navbar from "@/components/layout/Navbar"
import PagePadding from "@/components/layout/PagePadding"
import { ProfileProvider } from "@/components/providers/ProfileProvider"
import { LanguageProvider } from "@/components/providers/LanguageProvider"
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import { Playfair_Display, Inter } from "next/font/google"

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('saddleup_theme');if(t==='dark')document.documentElement.classList.add('dark');else if(t==='light')document.documentElement.classList.remove('dark');})();`,
          }}
        />
      </head>
      <body className="bg-base text-black font-sans antialiased">
        <ThemeProvider>
          <LanguageProvider>
            <ProfileProvider>
              <Navbar />
              <PagePadding>{children}</PagePadding>
            </ProfileProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
