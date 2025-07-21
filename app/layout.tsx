import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { Analytics } from '@/components/analytics'

const inter = Inter({ subsets: ['latin'] })

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
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
} 