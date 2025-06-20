"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Mail, LinkIcon, CheckCircle, AlertTriangle, Copy, ExternalLink, Globe, Shield } from "lucide-react"
import { motion } from "framer-motion"

export function EmailConfigPageContent() {
  const [siteUrl, setSiteUrl] = useState("")
  const [supabaseUrl, setSupabaseUrl] = useState("")
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Load current configuration
    setSiteUrl(process.env.NEXT_PUBLIC_SITE_URL || window.location.origin)
    setSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL || "")
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setMessage({ type: "success", text: "Copied to clipboard!" })
    setTimeout(() => setMessage(null), 2000)
  }

  const testEmailConfiguration = async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      // Test email configuration
      const response = await fetch("/api/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testEmail: "admin@stemspark.academy" }),
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ type: "success", text: "Email configuration test successful!" })
      } else {
        setMessage({ type: "error", text: result.error || "Email test failed" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to test email configuration" })
    }

    setIsLoading(false)
  }

  const emailTemplates = [
    {
      name: "Email Verification",
      description: "Sent when users sign up or change their email",
      redirectUrl: `${siteUrl}/auth/callback`,
      status: "active",
    },
    {
      name: "Password Reset",
      description: "Sent when users request password reset",
      redirectUrl: `${siteUrl}/auth/reset-password`,
      status: "active",
    },
    {
      name: "Email Change Confirmation",
      description: "Sent when users change their email address",
      redirectUrl: `${siteUrl}/auth/callback`,
      status: "active",
    },
  ]

  return (
    <motion.div 
      className="space-y-8 p-2 sm:p-4 lg:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-[var(--novakinetix-dark)]">Email Configuration</h1>
            <p className="text-gray-600">Configure and test email settings for the platform.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100">
              Refresh
            </Button>
          </div>
        </div>
      </motion.header>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="border-0 shadow-md rounded-lg bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold mb-0">Site Configuration</CardTitle>
            <CardDescription className="text-xs text-gray-500">Configure your site URLs for email redirects and callbacks</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <Label htmlFor="site-url">Site URL</Label>
                <Input id="site-url" value={siteUrl} onChange={(e) => setSiteUrl(e.target.value)} placeholder="https://your-domain.com" className="text-xs px-2 py-1" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="supabase-url">Supabase URL</Label>
                <Input id="supabase-url" value={supabaseUrl} onChange={(e) => setSupabaseUrl(e.target.value)} placeholder="https://your-project.supabase.co" className="text-xs px-2 py-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

function EmailConfigPageWrapper() {
  return <EmailConfigPageContent />;
}

export default EmailConfigPageWrapper;
