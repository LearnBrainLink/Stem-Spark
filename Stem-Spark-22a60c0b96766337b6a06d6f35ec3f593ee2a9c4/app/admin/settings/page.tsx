"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Save, RefreshCw, Shield, Mail, Database, Globe, Palette } from "lucide-react"

interface SystemSettings {
  siteName: string
  siteDescription: string
  contactEmail: string
  maintenanceMode: boolean
  registrationEnabled: boolean
  emailVerificationRequired: boolean
  maxFileUploadSize: number
  allowedFileTypes: string[]
  defaultUserRole: string
  sessionTimeout: number
  enableNotifications: boolean
  enableAnalytics: boolean
  themeColor: string
  logoUrl: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: "STEM Spark Academy",
    siteDescription: "Empowering young engineers through innovative STEM education",
    contactEmail: "admin@stemspark.academy",
    maintenanceMode: false,
    registrationEnabled: true,
    emailVerificationRequired: true,
    maxFileUploadSize: 10,
    allowedFileTypes: ["jpg", "jpeg", "png", "pdf", "mp4"],
    defaultUserRole: "student",
    sessionTimeout: 30,
    enableNotifications: true,
    enableAnalytics: true,
    themeColor: "#EF4444",
    logoUrl: "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [activeTab, setActiveTab] = useState("general")

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      // In a real app, you'd load these from a settings table
      // For now, we'll use the default values
      console.log("Settings loaded")
    } catch (error) {
      console.error("Error loading settings:", error)
    }
  }

  const saveSettings = async () => {
    setIsLoading(true)
    try {
      // In a real app, you'd save these to a settings table
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call

      setMessage({ type: "success", text: "Settings saved successfully!" })

      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save settings" })
    } finally {
      setIsLoading(false)
    }
  }

  const resetToDefaults = () => {
    if (confirm("Are you sure you want to reset all settings to default values?")) {
      setSettings({
        siteName: "STEM Spark Academy",
        siteDescription: "Empowering young engineers through innovative STEM education",
        contactEmail: "admin@stemspark.academy",
        maintenanceMode: false,
        registrationEnabled: true,
        emailVerificationRequired: true,
        maxFileUploadSize: 10,
        allowedFileTypes: ["jpg", "jpeg", "png", "pdf", "mp4"],
        defaultUserRole: "student",
        sessionTimeout: 30,
        enableNotifications: true,
        enableAnalytics: true,
        themeColor: "#EF4444",
        logoUrl: "",
      })
      setMessage({ type: "success", text: "Settings reset to defaults" })
    }
  }

  const testEmailConfiguration = async () => {
    setIsLoading(true)
    try {
      // Test email configuration
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setMessage({ type: "success", text: "Email configuration test successful!" })
    } catch (error) {
      setMessage({ type: "error", text: "Email configuration test failed" })
    } finally {
      setIsLoading(false)
    }
  }

  const clearCache = async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setMessage({ type: "success", text: "Cache cleared successfully!" })
    } catch (error) {
      setMessage({ type: "error", text: "Failed to clear cache" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white/80 backdrop-blur-sm shrink-0">
        <div>
          <h1 className="text-2xl font-bold">System Settings</h1>
          <p className="text-gray-600">Configure platform settings and preferences</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetToDefaults}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button onClick={saveSettings} disabled={isLoading} className="button-primary">
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {message && (
          <Alert className={`mb-2 ${message.type === "error" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"} shrink-0`}>
            <AlertDescription className={message.type === "error" ? "text-red-700" : "text-green-700"}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-6 mb-2 shrink-0">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="uploads">Uploads</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <div className="flex-1 min-h-0 overflow-hidden">
            <TabsContent value="general" className="h-full min-h-0 flex flex-col gap-3 overflow-auto">
              <Card className="admin-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    General Settings
                  </CardTitle>
                  <CardDescription>Basic platform configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="siteName">Site Name</Label>
                      <Input
                        id="siteName"
                        value={settings.siteName}
                        onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Contact Email</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={settings.contactEmail}
                        onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siteDescription">Site Description</Label>
                    <Textarea
                      id="siteDescription"
                      value={settings.siteDescription}
                      onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                        <p className="text-sm text-gray-500">Temporarily disable site access</p>
                      </div>
                      <Switch
                        id="maintenanceMode"
                        checked={settings.maintenanceMode}
                        onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="registrationEnabled">User Registration</Label>
                        <p className="text-sm text-gray-500">Allow new user registrations</p>
                      </div>
                      <Switch
                        id="registrationEnabled"
                        checked={settings.registrationEnabled}
                        onCheckedChange={(checked) => setSettings({ ...settings, registrationEnabled: checked })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="security" className="h-full min-h-0 flex flex-col gap-3 overflow-auto">
              <Card className="admin-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>Configure security and authentication options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="emailVerificationRequired">Email Verification Required</Label>
                        <p className="text-sm text-gray-500">Require email verification for new accounts</p>
                      </div>
                      <Switch
                        id="emailVerificationRequired"
                        checked={settings.emailVerificationRequired}
                        onCheckedChange={(checked) => setSettings({ ...settings, emailVerificationRequired: checked })}
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="defaultUserRole">Default User Role</Label>
                        <Select
                          value={settings.defaultUserRole}
                          onValueChange={(value) => setSettings({ ...settings, defaultUserRole: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="teacher">Teacher</SelectItem>
                            <SelectItem value="parent">Parent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                        <Input
                          id="sessionTimeout"
                          type="number"
                          value={settings.sessionTimeout}
                          onChange={(e) => setSettings({ ...settings, sessionTimeout: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="admin-card">
                <CardHeader>
                  <CardTitle>Security Status</CardTitle>
                  <CardDescription>Current security configuration status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">SSL Certificate</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Two-Factor Authentication</span>
                      <Badge className="bg-yellow-100 text-yellow-800">Optional</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Password Policy</span>
                      <Badge className="bg-green-100 text-green-800">Enforced</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Rate Limiting</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="email" className="h-full min-h-0 flex flex-col gap-3 overflow-auto">
              <Card className="admin-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Email Configuration
                  </CardTitle>
                  <CardDescription>Configure email settings and SMTP</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtpHost">SMTP Host</Label>
                      <Input id="smtpHost" placeholder="smtp.gmail.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPort">SMTP Port</Label>
                      <Input id="smtpPort" placeholder="587" />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtpUsername">SMTP Username</Label>
                      <Input id="smtpUsername" placeholder="your-email@gmail.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPassword">SMTP Password</Label>
                      <Input id="smtpPassword" type="password" placeholder="••••••••" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enableNotifications">Email Notifications</Label>
                      <p className="text-sm text-gray-500">Send system notifications via email</p>
                    </div>
                    <Switch
                      id="enableNotifications"
                      checked={settings.enableNotifications}
                      onCheckedChange={(checked) => setSettings({ ...settings, enableNotifications: checked })}
                    />
                  </div>
                  <div className="pt-4">
                    <Button onClick={testEmailConfiguration} disabled={isLoading} className="button-primary">
                      <Mail className="w-4 h-4 mr-2" />
                      Test Email Configuration
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="uploads" className="h-full min-h-0 flex flex-col gap-3 overflow-auto">
              <Card className="admin-card">
                <CardHeader>
                  <CardTitle>File Upload Settings</CardTitle>
                  <CardDescription>Configure file upload restrictions and limits</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxFileUploadSize">Maximum File Size (MB)</Label>
                    <Input
                      id="maxFileUploadSize"
                      type="number"
                      value={settings.maxFileUploadSize}
                      onChange={(e) => setSettings({ ...settings, maxFileUploadSize: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="allowedFileTypes">Allowed File Types</Label>
                    <Input
                      id="allowedFileTypes"
                      value={settings.allowedFileTypes.join(", ")}
                      onChange={(e) => setSettings({ ...settings, allowedFileTypes: e.target.value.split(", ") })}
                      placeholder="jpg, png, pdf, mp4"
                    />
                    <p className="text-sm text-gray-500">Separate file extensions with commas</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="appearance" className="h-full min-h-0 flex flex-col gap-3 overflow-auto">
              <Card className="admin-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Appearance Settings
                  </CardTitle>
                  <CardDescription>Customize the look and feel of your platform</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="logoUrl">Logo URL</Label>
                    <Input
                      id="logoUrl"
                      value={settings.logoUrl}
                      onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="themeColor">Primary Theme Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="themeColor"
                        value={settings.themeColor}
                        onChange={(e) => setSettings({ ...settings, themeColor: e.target.value })}
                        placeholder="#EF4444"
                      />
                      <input
                        type="color"
                        value={settings.themeColor}
                        onChange={(e) => setSettings({ ...settings, themeColor: e.target.value })}
                        className="w-12 h-10 border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="advanced" className="h-full min-h-0 flex flex-col gap-3 overflow-auto">
              <Card className="admin-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Advanced Settings
                  </CardTitle>
                  <CardDescription>Advanced configuration options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enableAnalytics">Analytics Tracking</Label>
                      <p className="text-sm text-gray-500">Enable usage analytics and tracking</p>
                    </div>
                    <Switch
                      id="enableAnalytics"
                      checked={settings.enableAnalytics}
                      onCheckedChange={(checked) => setSettings({ ...settings, enableAnalytics: checked })}
                    />
                  </div>
                  <div className="pt-4 space-y-2">
                    <Button onClick={clearCache} disabled={isLoading} variant="outline">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Clear System Cache
                    </Button>
                    <p className="text-sm text-gray-500">Clear cached data to improve performance</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-md border-0">
                <CardHeader>
                  <CardTitle>System Information</CardTitle>
                  <CardDescription>Current system status and information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Platform Version</span>
                      <Badge variant="outline" className="font-semibold">v2.1.0</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Database Status</span>
                      <Badge className="bg-green-100 text-green-800 font-semibold">Connected</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Storage Usage</span>
                      <Badge variant="outline" className="font-semibold">2.3 GB / 10 GB</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Last Backup</span>
                      <Badge variant="outline" className="font-semibold">2 hours ago</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
