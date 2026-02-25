import "./globals.css"
import Navbar from "@/components/layout/Navbar"
import { ProfileProvider } from "@/components/providers/ProfileProvider"
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
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="bg-black text-white font-sans antialiased">
        <ProfileProvider>
          <Navbar />
          {children}
        </ProfileProvider>
      </body>
    </html>
  )
}
