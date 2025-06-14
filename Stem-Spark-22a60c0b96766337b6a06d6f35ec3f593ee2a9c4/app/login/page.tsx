"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/logo"
import { useRouter } from "next/navigation"
import { secureSignInWithEmail, secureSignInWithGoogle, secureSignInWithGitHub, secureForgotPassword, resendVerificationEmail } from "@/lib/secure-auth-actions"
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Loader2, Github, AlertCircle, CheckCircle, RefreshCw } from "lucide-react"

interface AuthMessage {
  type: "success" | "error" | "info"
  text: string
  requiresVerification?: boolean
}

export default function SecureLoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<AuthMessage | null>(null)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [email, setEmail] = useState("")
  const router = useRouter()

  // Clear messages after 10 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 10000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const handleEmailLogin = async (formData: FormData) => {
    setIsLoading(true)
    setMessage(null)

    try {
      const result = await secureSignInWithEmail(formData)

      if (result.error) {
        setMessage({
          type: "error",
          text: result.error,
          requiresVerification: result.requiresVerification,
        })

        // Store email for verification resend
        if (result.requiresVerification) {
          setEmail(formData.get("email") as string)
        }
      } else if (result.success) {
        setMessage({
          type: "success",
          text: result.message || "Login successful!",
        })

        // Redirect after short delay
        if (result.redirectUrl) {
          setTimeout(() => {
            router.push(result.redirectUrl!)
          }, 1500)
        }
      }
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "An unexpected error occurred during login",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = async (provider: "google" | "github") => {
    setSocialLoading(provider)
    setMessage(null)

    try {
      const result = provider === "google" ? await secureSignInWithGoogle() : await secureSignInWithGitHub()

      if (result.error) {
        setMessage({ type: "error", text: result.error })
      } else if (result.success && result.redirectUrl) {
        setMessage({
          type: "info",
          text: result.message || `Redirecting to ${provider}...`,
        })

        // Redirect to OAuth provider
        window.location.href = result.redirectUrl
      }
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || `Failed to initiate ${provider} login`,
      })
    } finally {
      setSocialLoading(null)
    }
  }

  const handleForgotPassword = async (formData: FormData) => {
    setIsLoading(true)
    setMessage(null)

    try {
      const result = await secureForgotPassword(formData)

      if (result.error) {
        setMessage({ type: "error", text: result.error })
      } else if (result.success) {
        setMessage({ type: "success", text: result.message! })
        setShowForgotPassword(false)
      }
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Failed to send password reset email",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (!email) return

    setIsLoading(true)
    setMessage(null)

    try {
      const result = await resendVerificationEmail(email)

      if (result.error) {
        setMessage({ type: "error", text: result.error })
      } else if (result.success) {
        setMessage({ type: "success", text: result.message! })
      }
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Failed to resend verification email",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getMessageIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4" />
      case "error":
        return <AlertCircle className="h-4 w-4" />
      case "info":
        return <Loader2 className="h-4 w-4 animate-spin" />
      default:
        return null
    }
  }

  const getMessageStyles = (type: string) => {
    switch (type) {
      case "success":
        return "border-green-200 bg-green-50 text-green-700"
      case "error":
        return "border-red-200 bg-red-50 text-red-700"
      case "info":
        return "border-blue-200 bg-blue-50 text-blue-700"
      default:
        return "border-gray-200 bg-gray-50 text-gray-700"
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 px-2 sm:px-6">
      <Logo variant="mega" className="mb-10 drop-shadow-2xl w-40 h-40 sm:w-56 sm:h-56" />
      <div className="w-full max-w-xs sm:max-w-sm">
        <Card className="shadow-xl border-0 w-full mx-auto p-4 sm:p-8 bg-white/80">
          <CardContent className="flex flex-col items-center justify-center">
            {/* Only show the logo image, no text, no form, no buttons */}
            <Logo variant="mega" className="drop-shadow-2xl w-32 h-32 sm:w-40 sm:h-40" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
