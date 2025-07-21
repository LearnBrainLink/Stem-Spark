"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ExternalLink, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SupabaseConfigGuide() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <CheckCircle className="w-8 h-8 text-green-600" />
        <div>
          <h1 className="text-3xl font-bold">Supabase Configuration Guide</h1>
          <p className="text-gray-600">Your credentials are configured - complete the setup</p>
        </div>
      </div>

      {/* Status */}
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="w-4 h-4" />
        <AlertDescription className="text-green-700">
          ✅ Environment variables configured successfully! Your Supabase project is ready.
        </AlertDescription>
      </Alert>

      {/* Project Details */}
      <Card>
        <CardHeader>
          <CardTitle>Your Supabase Project</CardTitle>
          <CardDescription>Project details and configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-500">Project URL:</span>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">https://qnuevynptgkoivekuzer.supabase.co</code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard("https://qnuevynptgkoivekuzer.supabase.co")}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Project ID:</span>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">qnuevynptgkoivekuzer</code>
                <Button size="sm" variant="ghost" onClick={() => copyToClipboard("qnuevynptgkoivekuzer")}>
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>

          <div>
            <span className="text-sm font-medium text-gray-500">Site URL:</span>
            <div className="flex items-center gap-2 mt-1">
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                https://v0-empowering-young-engineers-dt.vercel.app
              </code>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard("https://v0-empowering-young-engineers-dt.vercel.app")}
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Setup Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Required Setup Steps</CardTitle>
          <CardDescription>Complete these steps in your Supabase dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">
                1
              </Badge>
              <div className="flex-1">
                <h4 className="font-semibold">Configure Authentication Settings</h4>
                <p className="text-sm text-gray-600 mb-2">Go to Authentication → Settings in your Supabase dashboard</p>
                <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
                  <div>
                    <strong>Site URL:</strong> https://v0-empowering-young-engineers-dt.vercel.app
                  </div>
                  <div>
                    <strong>Redirect URLs:</strong>
                  </div>
                  <div className="ml-4">• https://v0-empowering-young-engineers-dt.vercel.app/auth/callback</div>
                  <div className="ml-4">• http://localhost:3000/auth/callback (for development)</div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2"
                  onClick={() =>
                    window.open("https://supabase.com/dashboard/project/qnuevynptgkoivekuzer/auth/settings", "_blank")
                  }
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Auth Settings
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">
                2
              </Badge>
              <div className="flex-1">
                <h4 className="font-semibold">Set Up Database Tables</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Run the database setup script to create all necessary tables
                </p>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <code>scripts/setup-database-for-production.sql</code>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2"
                  onClick={() =>
                    window.open("https://supabase.com/dashboard/project/qnuevynptgkoivekuzer/sql", "_blank")
                  }
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open SQL Editor
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">
                3
              </Badge>
              <div className="flex-1">
                <h4 className="font-semibold">Configure Email Templates (Optional)</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Customize email templates for signup confirmation and password reset
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    window.open("https://supabase.com/dashboard/project/qnuevynptgkoivekuzer/auth/templates", "_blank")
                  }
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Email Templates
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">
                4
              </Badge>
              <div className="flex-1">
                <h4 className="font-semibold">Test the System</h4>
                <p className="text-sm text-gray-600 mb-2">Run the test scripts to verify everything is working</p>
                <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
                  <div>• scripts/test-connection-with-credentials.js</div>
                  <div>• scripts/test-login-with-credentials.js</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
          <CardDescription>Direct links to your Supabase dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => window.open("https://supabase.com/dashboard/project/qnuevynptgkoivekuzer", "_blank")}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Project Dashboard
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() =>
                window.open("https://supabase.com/dashboard/project/qnuevynptgkoivekuzer/auth/users", "_blank")
              }
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              User Management
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() =>
                window.open("https://supabase.com/dashboard/project/qnuevynptgkoivekuzer/editor", "_blank")
              }
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Table Editor
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => window.open("https://supabase.com/dashboard/project/qnuevynptgkoivekuzer/sql", "_blank")}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              SQL Editor
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
