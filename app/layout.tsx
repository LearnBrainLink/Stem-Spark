import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "NovaKinetix Academy",
  description:
    "Join NovaKinetix Academy for cutting-edge STEM education, innovative learning experiences, and pathways to technological excellence.",
  keywords: "STEM education, technology, innovation, academy, learning, engineering, science",
  authors: [{ name: "NovaKinetix Academy" }],
  creator: "NovaKinetix Academy",
  publisher: "NovaKinetix Academy",
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
    title: "NovaKinetix Academy",
    description:
      "Join NovaKinetix Academy for cutting-edge STEM education, innovative learning experiences, and pathways to technological excellence.",
    siteName: "NovaKinetix Academy",
  },
  twitter: {
    card: "summary_large_image",
    title: "NovaKinetix Academy",
    description:
      "Join NovaKinetix Academy for cutting-edge STEM education, innovative learning experiences, and pathways to technological excellence.",
    creator: "@novakinetix",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>NovaKinetix Academy</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/images/novakinetix-logo.png" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
} 