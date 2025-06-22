"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Mail, LinkIcon, CheckCircle, AlertTriangle, Copy, ExternalLink, Globe, Shield, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"
import { getConfigurationData } from '../actions'

export default function EmailConfigPage() {
  const [config, setConfig] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [testLoading, setTestLoading] = useState(false)

  useEffect(() => {
    fetchConfiguration()
  }, [])

  const fetchConfiguration = async () => {
    try {
      setIsLoading(true)
      const result = await getConfigurationData()
      
      if (result.error) {
        setMessage({ type: "error", text: result.error })
      } else {
        setConfig(result.config)
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to load configuration" })
    } finally {
      setIsLoading(false)
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
    <div className="space-y-6 max-w-7xl mx-auto">
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
            <p className="text-gray-600">Configure and test email settings for the platform.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
              onClick={fetchConfiguration}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
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

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Site Configuration */}
        <Card className="border-0 shadow-md rounded-lg bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold mb-0 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600" />
              Site Configuration
            </CardTitle>
            <CardDescription className="text-xs text-gray-500">Current site URLs for email redirects and callbacks</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-medium text-gray-700">Site URL</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input 
                    value={config?.site_url || ''} 
                    readOnly 
                    className="text-xs px-2 py-1 bg-gray-50" 
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(config?.site_url || '')}
                    className="px-2"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {config?.site_url ? (
                    <>
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      <span className="text-xs text-green-600">Configured</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      <span className="text-xs text-amber-600">Not configured</span>
                    </>
                  )}
                </div>
              </div>
              
              <div>
                <Label className="text-xs font-medium text-gray-700">Supabase URL</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input 
                    value={config?.supabase_url || ''} 
                    readOnly 
                    className="text-xs px-2 py-1 bg-gray-50" 
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(config?.supabase_url || '')}
                    className="px-2"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {config?.supabase_url ? (
                    <>
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      <span className="text-xs text-green-600">Configured</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      <span className="text-xs text-amber-600">Not configured</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email Status */}
        <Card className="border-0 shadow-md rounded-lg bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold mb-0 flex items-center gap-2">
              <Mail className="w-4 h-4 text-green-600" />
              Email Status
            </CardTitle>
            <CardDescription className="text-xs text-gray-500">Current email system status and testing</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-medium text-gray-700">Email System</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={`text-xs px-2 py-1 ${
                    config?.email_enabled === 'true' 
                      ? 'bg-green-100 text-green-800 border-green-200' 
                      : 'bg-red-100 text-red-800 border-red-200'
                  }`}>
                    {config?.email_enabled === 'true' ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label className="text-xs font-medium text-gray-700">Test Email Configuration</Label>
                <Button
                  size="sm"
                  onClick={testEmailConfiguration}
                  disabled={testLoading}
                  className="mt-1 w-full"
                >
                  {testLoading ? (
                    <>
                      <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Mail className="w-3 h-3 mr-2" />
                      Test Email
                    </>
                  )}
                </Button>
              </div>
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
        <Card className="border-0 shadow-md rounded-lg bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-600" />
              Email Templates
            </CardTitle>
            <CardDescription>Configured email templates and their redirect URLs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {emailTemplates.map((template, index) => (
                <div key={template.name} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{template.name}</h4>
                    <p className="text-sm text-gray-600">{template.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <LinkIcon className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500 font-mono">{template.redirectUrl}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="text-xs px-2 py-1 bg-green-100 text-green-800 border-green-200">
                      {template.status}
                    </Badge>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}


