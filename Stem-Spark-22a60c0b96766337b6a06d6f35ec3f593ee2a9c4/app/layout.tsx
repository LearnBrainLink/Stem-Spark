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
  title: "Novakinetix Academy",
  description:
    "Join Novakinetix Academy for cutting-edge STEM education, innovative learning experiences, and pathways to technological excellence.",
  keywords: "STEM education, technology, innovation, academy, learning, engineering, science",
  authors: [{ name: "Novakinetix Academy" }],
  creator: "Novakinetix Academy",
  publisher: "Novakinetix Academy",
  robots: "index, follow",
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/images/novakinetix-logo.png',
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://novakinetix.academy",
    title: "Novakinetix Academy",
    description:
      "Join Novakinetix Academy for cutting-edge STEM education, innovative learning experiences, and pathways to technological excellence.",
    siteName: "Novakinetix Academy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Novakinetix Academy",
    description:
      "Join Novakinetix Academy for cutting-edge STEM education, innovative learning experiences, and pathways to technological excellence.",
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
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <title>Novakinetix Academy</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/images/novakinetix-logo.png" />
      </head>
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  )
}
