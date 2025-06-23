"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Mail, LinkIcon, CheckCircle, AlertTriangle, Copy, ExternalLink, Globe, Shield, RefreshCw, Loader2, Save } from "lucide-react"
import { motion } from "framer-motion"
import { getEnhancedConfigurationData } from '../enhanced-actions'

interface EmailConfig {
  smtpHost: string
  smtpPort: number
  smtpUser: string
  smtpPass: string
  fromEmail: string
  fromName: string
  site_url?: string
  supabase_url?: string
  email_enabled?: string
}

interface EmailTemplates {
  welcome: { subject: string; body: string }
  verification: { subject: string; body: string }
  reset: { subject: string; body: string }
}

export default function EmailConfigPage() {
  const [config, setConfig] = useState<EmailConfig>({
    smtpHost: "",
    smtpPort: 587,
    smtpUser: "",
    smtpPass: "",
    fromEmail: "",
    fromName: ""
  })
  const [templates, setTemplates] = useState<EmailTemplates>({
    welcome: { subject: "Welcome to Novakinetix Academy!", body: "" },
    verification: { subject: "Verify your email address", body: "" },
    reset: { subject: "Reset your password", body: "" }
  })
  const [activeTemplate, setActiveTemplate] = useState("welcome")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [testLoading, setTestLoading] = useState(false)
  const [testEmail, setTestEmail] = useState("")
  const [isTesting, setIsTesting] = useState(false)

  useEffect(() => {
    fetchConfiguration()
  }, [])

  const fetchConfiguration = async () => {
    try {
      setIsLoading(true)
      setMessage(null)
      
      const result = await getEnhancedConfigurationData()
      
      if (result.error) {
        setMessage({ type: "error", text: result.error })
      } else if (result.config && typeof result.config === 'object') {
        const configData = result.config as any
        setConfig({
          smtpHost: configData.smtp_host || "",
          smtpPort: configData.smtp_port || 587,
          smtpUser: configData.smtp_user || "",
          smtpPass: configData.smtp_pass || "",
          fromEmail: configData.from_email || "",
          fromName: configData.from_name || "",
          site_url: configData.site_url,
          supabase_url: configData.supabase_url,
          email_enabled: configData.email_enabled
        })
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to load configuration" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveConfig = async () => {
    setIsSaving(true)
    setMessage(null)

    try {
      // Save configuration logic would go here
      setMessage({ type: "success", text: "Configuration saved successfully!" })
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save configuration" })
    } finally {
      setIsSaving(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setMessage({ type: "success", text: "Copied to clipboard!" })
    setTimeout(() => setMessage(null), 2000)
  }

  const testEmailConfiguration = async () => {
    setTestLoading(true)
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

    setTestLoading(false)
  }

  const emailTemplates = [
    {
      name: "Email Verification",
      description: "Sent when users sign up or change their email",
      redirectUrl: `${config?.site_url || 'http://localhost:3000'}/auth/callback`,
      status: "active",
    },
    {
      name: "Password Reset",
      description: "Sent when users request password reset",
      redirectUrl: `${config?.site_url || 'http://localhost:3000'}/auth/reset-password`,
      status: "active",
    },
    {
      name: "Email Change Confirmation",
      description: "Sent when users change their email address",
      redirectUrl: `${config?.site_url || 'http://localhost:3000'}/auth/callback`,
      status: "active",
    },
  ]

  const handleTestEmail = async () => {
    setIsTesting(true)
    setMessage(null)

    try {
      // Test email configuration
      const response = await fetch("/api/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testEmail: testEmail }),
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ type: "success", text: "Test email sent successfully!" })
      } else {
        setMessage({ type: "error", text: result.error || "Failed to send test email" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to send test email" })
    }

    setIsTesting(false)
  }

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Email Configuration</h1>
            <p className="text-gray-600">Configure email settings and templates.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100" onClick={fetchConfiguration}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button 
              className="bg-[hsl(var(--novakinetix-primary))] text-white hover:bg-[hsl(var(--novakinetix-dark))]"
              onClick={handleTestEmail}
              disabled={!testEmail || isTesting}
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending Test Email...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Test Email
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Message Alert */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <Alert className={message.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <AlertDescription className={message.type === "success" ? "text-green-800" : "text-red-800"}>
              {message.text}
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Configuration Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
          <CardHeader>
            <CardTitle>SMTP Configuration</CardTitle>
            <CardDescription>Configure your email service provider settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="smtpHost">SMTP Host</Label>
                <Input
                  id="smtpHost"
                  value={config.smtpHost}
                  onChange={(e) => setConfig({ ...config, smtpHost: e.target.value })}
                  placeholder="smtp.gmail.com"
                />
              </div>
              <div>
                <Label htmlFor="smtpPort">SMTP Port</Label>
                <Input
                  id="smtpPort"
                  type="number"
                  value={config.smtpPort}
                  onChange={(e) => setConfig({ ...config, smtpPort: parseInt(e.target.value) })}
                  placeholder="587"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="smtpUser">SMTP Username</Label>
                <Input
                  id="smtpUser"
                  value={config.smtpUser}
                  onChange={(e) => setConfig({ ...config, smtpUser: e.target.value })}
                  placeholder="your-email@gmail.com"
                />
              </div>
              <div>
                <Label htmlFor="smtpPass">SMTP Password</Label>
                <Input
                  id="smtpPass"
                  type="password"
                  value={config.smtpPass}
                  onChange={(e) => setConfig({ ...config, smtpPass: e.target.value })}
                  placeholder="your-app-password"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="fromEmail">From Email</Label>
              <Input
                id="fromEmail"
                value={config.fromEmail}
                onChange={(e) => setConfig({ ...config, fromEmail: e.target.value })}
                placeholder="noreply@novakinetix.com"
              />
            </div>
            <div>
              <Label htmlFor="fromName">From Name</Label>
              <Input
                id="fromName"
                value={config.fromName}
                onChange={(e) => setConfig({ ...config, fromName: e.target.value })}
                placeholder="Novakinetix Academy"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Email Templates */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
          <CardHeader>
            <CardTitle>Email Templates</CardTitle>
            <CardDescription>Customize email templates for different notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs value={activeTemplate} onValueChange={setActiveTemplate} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="welcome">Welcome Email</TabsTrigger>
                <TabsTrigger value="verification">Verification Email</TabsTrigger>
                <TabsTrigger value="reset">Password Reset</TabsTrigger>
              </TabsList>
              <TabsContent value="welcome" className="mt-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="welcomeSubject">Subject</Label>
                    <Input
                      id="welcomeSubject"
                      value={templates.welcome.subject}
                      onChange={(e) => setTemplates({
                        ...templates,
                        welcome: { ...templates.welcome, subject: e.target.value }
                      })}
                      placeholder="Welcome to Novakinetix Academy!"
                    />
                  </div>
                  <div>
                    <Label htmlFor="welcomeBody">Email Body</Label>
                    <Textarea
                      id="welcomeBody"
                      value={templates.welcome.body}
                      onChange={(e) => setTemplates({
                        ...templates,
                        welcome: { ...templates.welcome, body: e.target.value }
                      })}
                      placeholder="Welcome to Novakinetix Academy! We're excited to have you on board..."
                      rows={8}
                    />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="verification" className="mt-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="verificationSubject">Subject</Label>
                    <Input
                      id="verificationSubject"
                      value={templates.verification.subject}
                      onChange={(e) => setTemplates({
                        ...templates,
                        verification: { ...templates.verification, subject: e.target.value }
                      })}
                      placeholder="Verify your email address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="verificationBody">Email Body</Label>
                    <Textarea
                      id="verificationBody"
                      value={templates.verification.body}
                      onChange={(e) => setTemplates({
                        ...templates,
                        verification: { ...templates.verification, body: e.target.value }
                      })}
                      placeholder="Please verify your email address by clicking the link below..."
                      rows={8}
                    />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="reset" className="mt-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="resetSubject">Subject</Label>
                    <Input
                      id="resetSubject"
                      value={templates.reset.subject}
                      onChange={(e) => setTemplates({
                        ...templates,
                        reset: { ...templates.reset, subject: e.target.value }
                      })}
                      placeholder="Reset your password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="resetBody">Email Body</Label>
                    <Textarea
                      id="resetBody"
                      value={templates.reset.body}
                      onChange={(e) => setTemplates({
                        ...templates,
                        reset: { ...templates.reset, body: e.target.value }
                      })}
                      placeholder="Click the link below to reset your password..."
                      rows={8}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      {/* Test Email Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
          <CardHeader>
            <CardTitle>Test Email Configuration</CardTitle>
            <CardDescription>Send a test email to verify your configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="testEmail">Test Email Address</Label>
              <Input
                id="testEmail"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
              />
            </div>
            <Button 
              onClick={handleTestEmail}
              disabled={!testEmail || isTesting}
              variant="outline"
              className="w-full"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending Test Email...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Test Email
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}


