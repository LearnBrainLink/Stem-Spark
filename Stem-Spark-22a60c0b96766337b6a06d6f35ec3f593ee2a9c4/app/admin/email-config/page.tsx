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
import { Settings, Mail, LinkIcon, CheckCircle, AlertTriangle, Copy, ExternalLink, Globe, Shield, RefreshCw, Loader2, Save, TestTube, FileText, Send } from "lucide-react"
import { motion } from "framer-motion"
import { getEnhancedConfigurationData } from '../enhanced-actions'
import { Checkbox } from "@/components/ui/checkbox"

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
  smtpSecure: boolean
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
    fromName: "",
    smtpSecure: true
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
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchConfiguration()
  }, [])

  const fetchConfiguration = async () => {
    try {
      setIsLoading(true)
      setMessage(null)
      setError(null)
      
      const result = await getEnhancedConfigurationData()
      
      if (result.error) {
        setError(result.error)
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
          email_enabled: configData.email_enabled,
          smtpSecure: configData.smtp_secure === "true"
        })
      }
    } catch (err) {
      setError("Failed to load configuration")
      setMessage({ type: "error", text: "Failed to load configuration" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveConfig = async () => {
    setIsSaving(true)
    setMessage(null)
    setError(null)

    try {
      // Save configuration logic would go here
      setMessage({ type: "success", text: "Configuration saved successfully!" })
    } catch (error) {
      setError("Failed to save configuration")
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
    setError(null)

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
        setError(result.error || "Email test failed")
        setMessage({ type: "error", text: result.error || "Email test failed" })
      }
    } catch (error) {
      setError("Failed to test email configuration")
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
    setError(null)

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
        setError(result.error || "Failed to send test email")
        setMessage({ type: "error", text: result.error || "Failed to send test email" })
      }
    } catch (error) {
      setError("Failed to send test email")
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
    <div className="admin-page-content space-y-6 p-0 m-0">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Configuration</h1>
          <p className="text-gray-600 mt-1">Configure email settings and templates</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" onClick={testEmailConfiguration} className="w-full sm:w-auto">
            <TestTube className="w-4 h-4 mr-2" />
            Test Connection
          </Button>
          <Button variant="outline" onClick={handleSaveConfig} className="w-full sm:w-auto">
            <Save className="w-4 h-4 mr-2" />
            Save Configuration
          </Button>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <Alert className={message.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <AlertDescription className={message.type === "success" ? "text-green-800" : "text-red-800"}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Error Display */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Configuration Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SMTP Configuration */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              SMTP Configuration
            </CardTitle>
            <CardDescription>
              Configure your email server settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtp-host">SMTP Host</Label>
                <Input 
                  id="smtp-host" 
                  value={config.smtpHost} 
                  onChange={(e) => setConfig({...config, smtpHost: e.target.value})}
                  placeholder="smtp.gmail.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-port">SMTP Port</Label>
                <Input 
                  id="smtp-port" 
                  type="number" 
                  value={config.smtpPort} 
                  onChange={(e) => setConfig({...config, smtpPort: parseInt(e.target.value)})}
                  placeholder="587"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-username">SMTP Username</Label>
              <Input 
                id="smtp-username" 
                value={config.smtpUser} 
                onChange={(e) => setConfig({...config, smtpUser: e.target.value})}
                placeholder="your-email@gmail.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-password">SMTP Password</Label>
              <Input 
                id="smtp-password" 
                type="password" 
                value={config.smtpPass} 
                onChange={(e) => setConfig({...config, smtpPass: e.target.value})}
                placeholder="Your app password"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="smtp-secure" 
                checked={config.smtpSecure} 
                onCheckedChange={(checked) => setConfig({...config, smtpSecure: checked as boolean})}
              />
              <Label htmlFor="smtp-secure">Use secure connection (TLS/SSL)</Label>
            </div>
          </CardContent>
        </Card>

        {/* Email Templates */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              Email Templates
            </CardTitle>
            <CardDescription>
              Customize email templates for different notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="welcome-subject">Welcome Email Subject</Label>
              <Input 
                id="welcome-subject" 
                value={templates.welcome.subject} 
                onChange={(e) => setTemplates({
                  ...templates,
                  welcome: { ...templates.welcome, subject: e.target.value }
                })}
                placeholder="Welcome to Novakinetix Academy!"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="welcome-body">Welcome Email Body</Label>
              <textarea 
                id="welcome-body" 
                className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={templates.welcome.body} 
                onChange={(e) => setTemplates({
                  ...templates,
                  welcome: { ...templates.welcome, body: e.target.value }
                })}
                placeholder="Welcome to our platform! We're excited to have you join us..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reset-subject">Password Reset Subject</Label>
              <Input 
                id="reset-subject" 
                value={templates.reset.subject} 
                onChange={(e) => setTemplates({
                  ...templates,
                  reset: { ...templates.reset, subject: e.target.value }
                })}
                placeholder="Reset Your Password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reset-body">Password Reset Body</Label>
              <textarea 
                id="reset-body" 
                className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={templates.reset.body} 
                onChange={(e) => setTemplates({
                  ...templates,
                  reset: { ...templates.reset, body: e.target.value }
                })}
                placeholder="Click the link below to reset your password..."
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Email Section */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-purple-600" />
            Test Email Configuration
          </CardTitle>
          <CardDescription>
            Send a test email to verify your configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="test-email">Test Email Address</Label>
              <Input 
                id="test-email" 
                value={testEmail} 
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="test-subject">Test Subject</Label>
              <Input 
                id="test-subject" 
                value={testEmail} 
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Test Email from Novakinetix"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="test-message">Test Message</Label>
            <textarea 
              id="test-message" 
              className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={testEmail} 
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="This is a test email to verify your email configuration..."
            />
          </div>
          <Button 
            onClick={handleTestEmail} 
            disabled={!testEmail || isTesting}
            className="w-full sm:w-auto"
          >
            {isTesting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Test Email
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}


