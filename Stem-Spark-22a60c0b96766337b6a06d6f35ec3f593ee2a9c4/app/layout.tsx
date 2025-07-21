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
  title: "STEM Spark Academy - Empowering Future Innovators",
  description:
    "Join STEM Spark Academy for cutting-edge STEM education, innovative learning experiences, and pathways to technological excellence.",
  keywords: "STEM education, technology, innovation, academy, learning, engineering, science",
  authors: [{ name: "STEM Spark Academy" }],
  creator: "STEM Spark Academy",
  publisher: "STEM Spark Academy",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://stems spark.academy",
    title: "STEM Spark Academy - Empowering Future Innovators",
    description:
      "Join STEM Spark Academy for cutting-edge STEM education, innovative learning experiences, and pathways to technological excellence.",
    siteName: "STEM Spark Academy",
  },
  twitter: {
    card: "summary_large_image",
    title: "STEM Spark Academy - Empowering Future Innovators",
    description:
      "Join STEM Spark Academy for cutting-edge STEM education, innovative learning experiences, and pathways to technological excellence.",
    creator: "@stems spark",
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
