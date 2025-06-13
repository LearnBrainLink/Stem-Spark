"use client"

import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Logo } from "@/components/logo"
import Link from "next/link"
import { AlertCircle, ArrowLeft, RefreshCw, Home } from "lucide-react"

export default function AuthCodeErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  const errorDescription = searchParams.get("error_description")

  const getErrorMessage = () => {
    switch (error) {
      case "access_denied":
        return {
          title: "Access Denied",
          message: "You cancelled the authentication process. Please try again if you want to sign in.",
          canRetry: true,
        }
      case "exchange_failed":
        return {
          title: "Authentication Failed",
          message: errorDescription || "Failed to complete the authentication process. Please try again.",
          canRetry: true,
        }
      case "unexpected_error":
        return {
          title: "Unexpected Error",
          message: errorDescription || "An unexpected error occurred during authentication.",
          canRetry: true,
        }
      default:
        return {
          title: "Authentication Error",
          message: errorDescription || "An error occurred during the authentication process.",
          canRetry: true,
        }
    }
  }

  const errorInfo = getErrorMessage()

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="admin-card shadow-brand-lg">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-6">
              <Logo variant="large" className="drop-shadow-lg" />
            </div>
            <CardTitle className="text-2xl font-bold text-brand-primary flex items-center justify-center gap-2">
              <AlertCircle className="w-6 h-6 text-red-500" />
              {errorInfo.title}
            </CardTitle>
            <CardDescription className="text-lg text-brand-secondary">
              We encountered an issue during authentication
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700 font-medium">{errorInfo.message}</AlertDescription>
            </Alert>

            <div className="space-y-4">
              {errorInfo.canRetry && (
                <Button asChild className="w-full button-primary h-12 text-lg">
                  <Link href="/login">
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Try Again
                  </Link>
                </Button>
              )}

              <Button asChild variant="outline" className="w-full h-12 text-lg interactive-button">
                <Link href="/">
                  <Home className="w-5 h-5 mr-2" />
                  Go to Homepage
                </Link>
              </Button>

              <Button asChild variant="ghost" className="w-full h-12 text-lg">
                <Link href="/contact" className="text-brand-secondary hover:text-brand-primary">
                  Contact Support
                </Link>
              </Button>
            </div>

            {/* Debug Info (only in development) */}
            {process.env.NODE_ENV === "development" && (error || errorDescription) && (
              <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Debug Information:</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  {error && (
                    <div>
                      <strong>Error:</strong> {error}
                    </div>
                  )}
                  {errorDescription && (
                    <div>
                      <strong>Description:</strong> {errorDescription}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-brand-primary hover:text-brand-dark transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
