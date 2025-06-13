import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "NOVAKINETIX ACADEMY - Empowering Future Innovators",
  description:
    "Join NOVAKINETIX ACADEMY for cutting-edge STEM education, innovative learning experiences, and pathways to technological excellence.",
  keywords: "STEM education, technology, innovation, academy, learning, engineering, science",
  authors: [{ name: "NOVAKINETIX ACADEMY" }],
  creator: "NOVAKINETIX ACADEMY",
  publisher: "NOVAKINETIX ACADEMY",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://novakinetix.academy",
    title: "NOVAKINETIX ACADEMY - Empowering Future Innovators",
    description:
      "Join NOVAKINETIX ACADEMY for cutting-edge STEM education, innovative learning experiences, and pathways to technological excellence.",
    siteName: "NOVAKINETIX ACADEMY",
  },
  twitter: {
    card: "summary_large_image",
    title: "NOVAKINETIX ACADEMY - Empowering Future Innovators",
    description:
      "Join NOVAKINETIX ACADEMY for cutting-edge STEM education, innovative learning experiences, and pathways to technological excellence.",
    creator: "@novakinetix",
  },
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#2563EB",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  )
}
