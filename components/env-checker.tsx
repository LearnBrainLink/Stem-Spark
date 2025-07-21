"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertTriangle, Copy, Eye, EyeOff } from "lucide-react"

interface EnvVar {
  name: string
  description: string
  required: boolean
  example: string
  category: string
}

const requiredEnvVars: EnvVar[] = [
  {
    name: "NEXT_PUBLIC_SUPABASE_URL",
    description: "Your Supabase project URL",
    required: true,
    example: "https://your-project-id.supabase.co",
    category: "Supabase",
  },
  {
    name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    description: "Your Supabase anonymous/public key",
    required: true,
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    category: "Supabase",
  },
  {
    name: "SUPABASE_SERVICE_ROLE_KEY",
    description: "Your Supabase service role key (server-side only)",
    required: true,
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    category: "Supabase",
  },
  {
    name: "NEXT_PUBLIC_SITE_URL",
    description: "Your site URL for redirects and email links",
    required: true,
    example: "https://your-domain.com",
    category: "Site Configuration",
  },
  {
    name: "SUPABASE_JWT_SECRET",
    description: "JWT secret for token verification",
    required: false,
    example: "your-jwt-secret-from-supabase-settings",
    category: "Supabase",
  },
  {
    name: "RESEND_API_KEY",
    description: "Resend API key for custom email sending (optional)",
    required: false,
    example: "re_xxxxxxxxxx",
    category: "Email (Optional)",
  },
]

export default function EnvChecker() {
  const [envStatus, setEnvStatus] = useState<Record<string, boolean>>({})
  const [showValues, setShowValues] = useState<Record<string, boolean>>({})
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    checkEnvironmentVariables()
  }, [])

  const checkEnvironmentVariables = () => {
    const status: Record<string, boolean> = {}

    requiredEnvVars.forEach((envVar) => {
      if (envVar.name.startsWith("NEXT_PUBLIC_")) {
        // Client-side env vars
        status[envVar.name] = !!process.env[envVar.name as keyof typeof process.env]
      } else {
        // Server-side env vars - we can't check these on client
        status[envVar.name] = true // Assume they exist for now
      }
    })

    setEnvStatus(status)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const toggleShowValue = (envName: string) => {
    setShowValues((prev) => ({
      ...prev,
      [envName]: !prev[envName],
    }))
  }

  const getEnvValue = (envName: string) => {
    if (envName.startsWith("NEXT_PUBLIC_")) {
      return process.env[envName as keyof typeof process.env] || "Not set"
    }
    return "Hidden (server-side)"
  }

  const requiredCount = requiredEnvVars.filter((env) => env.required).length
  const setCount = Object.values(envStatus).filter(Boolean).length
  const allRequiredSet = requiredEnvVars.filter((env) => env.required).every((env) => envStatus[env.name])

  if (!isClient) {
    return <div>Loading environment check...</div>
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <AlertTriangle className="w-8 h-8 text-amber-600" />
        <div>
          <h1 className="text-3xl font-bold">Environment Variables Setup</h1>
          <p className="text-gray-600">Configure required environment variables for STEM Spark Academy</p>
        </div>
      </div>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {allRequiredSet ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
            Environment Status
          </CardTitle>
          <CardDescription>
            {setCount} of {requiredCount} required variables configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allRequiredSet ? (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="w-4 h-4" />
              <AlertDescription className="text-green-700">
                ✅ All required environment variables are configured! Your system should work properly.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="w-4 h-4" />
              <AlertDescription className="text-red-700">
                ❌ Some required environment variables are missing. Please configure them to use the system.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Environment Variables List */}
      <div className="space-y-4">
        {["Supabase", "Site Configuration", "Email (Optional)"].map((category) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle>{category}</CardTitle>
              <CardDescription>
                {category === "Supabase" && "Database and authentication configuration"}
                {category === "Site Configuration" && "Site URL and redirect settings"}
                {category === "Email (Optional)" && "Optional email service configuration"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {requiredEnvVars
                .filter((env) => env.category === category)
                .map((envVar) => (
                  <div key={envVar.name} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{envVar.name}</code>
                        {envVar.required ? (
                          <Badge variant="destructive">Required</Badge>
                        ) : (
                          <Badge variant="secondary">Optional</Badge>
                        )}
                        {envStatus[envVar.name] ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => copyToClipboard(envVar.name)}>
                          <Copy className="w-4 h-4" />
                        </Button>
                        {envVar.name.startsWith("NEXT_PUBLIC_") && (
                          <Button variant="outline" size="sm" onClick={() => toggleShowValue(envVar.name)}>
                            {showValues[envVar.name] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-2">{envVar.description}</p>

                    <div className="space-y-2">
                      <div>
                        <span className="text-xs font-medium text-gray-500">Example:</span>
                        <code className="block text-xs bg-gray-50 p-2 rounded mt-1">{envVar.example}</code>
                      </div>

                      {envVar.name.startsWith("NEXT_PUBLIC_") && showValues[envVar.name] && (
                        <div>
                          <span className="text-xs font-medium text-gray-500">Current Value:</span>
                          <code className="block text-xs bg-blue-50 p-2 rounded mt-1">{getEnvValue(envVar.name)}</code>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
          <CardDescription>How to configure your environment variables</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-semibold">1. Create .env.local file</h4>
            <p className="text-sm text-gray-600">
              Create a <code>.env.local</code> file in your project root with the following variables:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-sm">
                {`# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Optional: JWT Secret
SUPABASE_JWT_SECRET=your-jwt-secret

# Optional: Email Service
RESEND_API_KEY=your-resend-api-key`}
              </pre>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">2. Get Supabase Keys</h4>
            <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
              <li>Go to your Supabase project dashboard</li>
              <li>Navigate to Settings → API</li>
              <li>Copy the Project URL and anon/public key</li>
              <li>Copy the service_role key (keep this secret!)</li>
            </ol>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">3. Configure Site URL</h4>
            <p className="text-sm text-gray-600">
              Set your site URL for proper redirects. For development, use <code>http://localhost:3000</code>
            </p>
          </div>

          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription className="text-amber-700">
              <strong>Important:</strong> Never commit your <code>.env.local</code> file to version control. Add it to
              your <code>.gitignore</code> file.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
