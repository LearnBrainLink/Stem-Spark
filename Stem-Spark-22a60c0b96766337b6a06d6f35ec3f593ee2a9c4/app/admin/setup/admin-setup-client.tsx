"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, User } from "lucide-react"

interface AdminAccount {
  email: string
  password: string
  fullName: string
  role: string
  state: string
}

interface AdminSetupClientProps {
  adminAccounts: AdminAccount[]
}

export function AdminSetupClient({ adminAccounts }: AdminSetupClientProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [setupResults, setSetupResults] = useState<any>(null)
  const [verificationResults, setVerificationResults] = useState<any>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleCreateAdmins = async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      // Import the function dynamically to avoid SSR issues
      const { createAdminAccounts } = await import("@/lib/enhanced-auth-actions")
      const results = await createAdminAccounts()
      setSetupResults(results)

      if (results.totalCreated > 0) {
        setMessage({
          type: "success",
          text: `Successfully created ${results.totalCreated} admin accounts!`,
        })
      } else {
        setMessage({
          type: "error",
          text: "Failed to create admin accounts. Check the console for details.",
        })
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "An unexpected error occurred while creating admin accounts.",
      })
      console.error("Admin creation error:", error)
    }

    setIsLoading(false)
  }

  const handleVerifyAdmins = async () => {
    setIsLoading(true)

    try {
      // Import the function dynamically to avoid SSR issues
      const { verifyAdminAccounts } = await import("@/lib/enhanced-auth-actions")
      const results = await verifyAdminAccounts()
      setVerificationResults(results)

      if (results.success) {
        setMessage({
          type: "success",
          text: `Found ${results.totalFound} of ${results.expectedCount} admin accounts.`,
        })
      } else {
        setMessage({
          type: "error",
          text: results.error || "Failed to verify admin accounts.",
        })
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "An error occurred while verifying admin accounts.",
      })
    }

    setIsLoading(false)
  }

  return (
    <>
      {message && (
        <Alert className={`${message.type === "error" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}>
          <AlertDescription className={message.type === "error" ? "text-red-700" : "text-green-700"}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Setup Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create Admin Accounts</CardTitle>
            <CardDescription>Set up all 4 administrator accounts with the credentials shown above</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleCreateAdmins}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              {isLoading ? "Creating..." : "Create Admin Accounts"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verify Admin Accounts</CardTitle>
            <CardDescription>Check if admin accounts already exist in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleVerifyAdmins} disabled={isLoading} variant="outline" className="w-full">
              {isLoading ? "Verifying..." : "Verify Existing Accounts"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Setup Results */}
      {setupResults && (
        <Card>
          <CardHeader>
            <CardTitle>Setup Results</CardTitle>
            <CardDescription>Results from the admin account creation process</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span>Total Accounts Created:</span>
                <Badge variant="default">{setupResults.totalCreated}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span>Failed Creations:</span>
                <Badge variant={setupResults.totalFailed > 0 ? "destructive" : "secondary"}>
                  {setupResults.totalFailed}
                </Badge>
              </div>

              <div className="space-y-2">
                {setupResults.results.map((result: any, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-2 border rounded">
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{result.email}</p>
                      {result.success ? (
                        <p className="text-sm text-gray-600">
                          {result.fullName} - {result.role}
                        </p>
                      ) : (
                        <p className="text-sm text-red-600">{result.error}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Verification Results */}
      {verificationResults && (
        <Card>
          <CardHeader>
            <CardTitle>Verification Results</CardTitle>
            <CardDescription>Current admin accounts found in the system</CardDescription>
          </CardHeader>
          <CardContent>
            {verificationResults.success ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span>Admin Accounts Found:</span>
                  <Badge variant="default">{verificationResults.totalFound}</Badge>
                </div>

                {verificationResults.adminAccounts?.map((admin: any, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <User className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="font-medium">{admin.full_name}</p>
                      <p className="text-sm text-gray-600">{admin.email}</p>
                    </div>
                    <Badge variant="outline">{new Date(admin.created_at).toLocaleDateString()}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{verificationResults.error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </>
  )
}
