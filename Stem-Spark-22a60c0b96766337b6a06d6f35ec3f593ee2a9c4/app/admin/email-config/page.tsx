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

export default function EmailConfigPage() {
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
    <div className="container mx-auto p-4 max-w-4xl h-screen flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <Settings className="w-7 h-7 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold leading-tight">Email Configuration</h1>
          <p className="text-gray-600 text-sm md:text-base leading-tight">Manage email settings and URL configurations</p>
        </div>
      </div>

      {message && (
        <Alert className={`${message.type === "error" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"} shrink-0`}>
          <AlertDescription className={message.type === "error" ? "text-red-700" : "text-green-700"}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="configuration" className="flex-1 flex flex-col min-h-0">
        <TabsList className="grid w-full grid-cols-3 mb-2 shrink-0">
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="templates">Email Templates</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
        </TabsList>

        <div className="flex-1 min-h-0">
          <TabsContent value="configuration" className="h-full min-h-0 flex flex-col gap-3">
            <div className="flex-1 min-h-0 flex flex-col gap-3 overflow-auto">
              <Card className="shadow-md border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    <Globe className="w-4 h-4" />
                    Site Configuration
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm">Configure your site URLs for email redirects and callbacks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="site-url">Site URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="site-url"
                        value={siteUrl}
                        onChange={(e) => setSiteUrl(e.target.value)}
                        placeholder="https://your-domain.com"
                        className="text-xs px-2 py-1"
                      />
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(siteUrl)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">This URL is used for email redirects and callbacks</p>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="supabase-url">Supabase URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="supabase-url"
                        value={supabaseUrl}
                        onChange={(e) => setSupabaseUrl(e.target.value)}
                        placeholder="https://your-project.supabase.co"
                        className="text-xs px-2 py-1"
                      />
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(supabaseUrl)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">Your Supabase project URL for authentication</p>
                  </div>

                  <Alert className="border-blue-200 bg-blue-50 mt-2">
                    <Shield className="w-4 h-4" />
                    <AlertDescription className="text-blue-700 text-xs">
                      <strong>Important:</strong> Make sure to configure these URLs in your Supabase dashboard under Authentication → URL Configuration.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card className="shadow-md border-0">
                <CardHeader>
                  <CardTitle className="text-base md:text-lg">Required Supabase Settings</CardTitle>
                  <CardDescription className="text-xs md:text-sm">Configure these settings in your Supabase dashboard</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-xs">Site URL</p>
                        <p className="text-xs text-gray-600">Authentication → URL Configuration</p>
                      </div>
                      <code className="text-xs bg-white px-2 py-1 rounded">{siteUrl}</code>
                    </div>

                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-xs">Redirect URLs</p>
                        <p className="text-xs text-gray-600">Authentication → URL Configuration</p>
                      </div>
                      <div className="text-right">
                        <code className="text-xs bg-white px-2 py-1 rounded block mb-1">{siteUrl}/auth/callback</code>
                        <code className="text-xs bg-white px-2 py-1 rounded block">{siteUrl}/auth/reset-password</code>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="h-full min-h-0 flex flex-col gap-3">
            <div className="flex-1 min-h-0 overflow-auto">
              <Card className="shadow-md border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    <Mail className="w-4 h-4" />
                    Email Templates
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm">Current email template configurations and redirect URLs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {emailTemplates.map((template, index) => (
                      <div key={index} className="border rounded-lg p-3 bg-gray-50">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-sm md:text-base">{template.name}</h3>
                          <Badge variant={template.status === "active" ? "default" : "secondary"} className="capitalize">{template.status}</Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{template.description}</p>
                        <div className="flex items-center gap-2">
                          <LinkIcon className="w-4 h-4 text-gray-400" />
                          <code className="text-xs bg-white px-2 py-1 rounded flex-1">{template.redirectUrl}</code>
                          <Button variant="outline" size="sm" onClick={() => copyToClipboard(template.redirectUrl)}>
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => window.open(template.redirectUrl, "_blank")}> 
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="testing" className="h-full min-h-0 flex flex-col gap-3">
            <div className="flex-1 min-h-0 overflow-auto">
              <Card className="shadow-md border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    <CheckCircle className="w-4 h-4" />
                    Email Testing
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm">Test your email configuration and verify everything is working</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Button onClick={testEmailConfiguration} disabled={isLoading} className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold shadow-md text-xs py-2">
                      {isLoading ? "Testing..." : "Test Email Configuration"}
                    </Button>

                    <Alert className="border-amber-200 bg-amber-50">
                      <AlertTriangle className="w-4 h-4" />
                      <AlertDescription className="text-amber-700 text-xs">
                        <strong>Note:</strong> Email testing requires proper Supabase configuration. Make sure your authentication settings are configured correctly.
                      </AlertDescription>
                    </Alert>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-semibold text-xs">Test Checklist:</h4>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-xs">Site URL configured in Supabase</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-xs">Redirect URLs added to allowed list</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-xs">Email templates enabled</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-xs">SMTP settings configured (if using custom provider)</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
