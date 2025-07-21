"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/logo"

export default function VerifyPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email")
  const token = searchParams.get("token")

  const [isVerifying, setIsVerifying] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    const verifyEmail = async () => {
      if (!email) {
        setErrorMessage("Missing email parameter")
        setIsVerifying(false)
        return
      }

      try {
        // In a real implementation, you would verify the token
        // For this demo, we'll simulate verification

        // Update the profile to mark email as verified
        const { data: profiles, error: profileError } = await supabase
          .from("profiles")
          .update({ email_verified: true })
          .eq("email", email)
          .select()

        if (profileError) {
          console.error("Error updating profile:", profileError)
          setErrorMessage("Failed to verify email. Please try again.")
          setIsVerifying(false)
          return
        }

        if (profiles && profiles.length > 0) {
          // Log the verification activity
          await supabase.from("user_activities").insert({
            user_id: profiles[0].id,
            activity_type: "email_verified",
            activity_description: "Email address verified",
            metadata: { email, timestamp: new Date().toISOString() },
          })

          setIsSuccess(true)
        } else {
          setErrorMessage("No account found with this email address.")
        }
      } catch (error) {
        console.error("Verification error:", error)
        setErrorMessage("An unexpected error occurred during verification.")
      }

      setIsVerifying(false)
    }

    verifyEmail()
  }, [email, token])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-4">
            <Logo width={60} height={60} />
            <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              STEM Spark Academy
            </span>
          </Link>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Email Verification</CardTitle>
            <CardDescription className="text-center">Verifying your email address</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4 pt-4">
            {isVerifying ? (
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                <p className="text-gray-600">Verifying your email address...</p>
              </div>
            ) : isSuccess ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Email Verified!</h3>
                  <p className="text-gray-600 mb-4">
                    Your email address has been successfully verified. You can now access all features of your account.
                  </p>
                </div>
                <div className="flex gap-4">
                  <Button asChild>
                    <Link href="/dashboard">Go to Dashboard</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/profile">View Profile</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <div className="rounded-full bg-red-100 p-3">
                  <XCircle className="h-12 w-12 text-red-600" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Verification Failed</h3>
                  <Alert className="border-red-200 bg-red-50 mb-4">
                    <AlertDescription className="text-red-700">{errorMessage}</AlertDescription>
                  </Alert>
                  <p className="text-gray-600">Please try again or contact support if the problem persists.</p>
                </div>
                <div className="flex gap-4">
                  <Button asChild>
                    <Link href="/login">Return to Login</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/">Go to Home</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
