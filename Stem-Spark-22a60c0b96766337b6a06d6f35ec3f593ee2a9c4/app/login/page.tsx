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

  // Animated background gradient and floating particles
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 z-0 animate-gradient bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 opacity-80 blur-2xl" />
      {/* Floating Particles */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {[...Array(18)].map((_, i) => (
          <span
            key={i}
            className={`absolute rounded-full opacity-40 animate-float${i % 3 + 1}`}
            style={{
              width: `${32 + (i % 4) * 12}px`,
              height: `${32 + (i % 4) * 12}px`,
              left: `${Math.random() * 90}%`,
              top: `${Math.random() * 90}%`,
              background: `linear-gradient(135deg, #fff 0%, #${(Math.floor(Math.random()*16777215)).toString(16)} 100%)`,
              filter: 'blur(2px)',
            }}
          />
        ))}
      </div>
      {/* Centered Logo Card with glassmorphism effect */}
      <div className="relative z-20 w-full max-w-xs sm:max-w-sm">
        <Card className="shadow-2xl border-0 w-full mx-auto p-8 bg-white/30 backdrop-blur-lg rounded-3xl flex items-center justify-center">
          <CardContent className="flex flex-col items-center justify-center">
            <Logo variant="mega" className="drop-shadow-2xl w-40 h-40 sm:w-56 sm:h-56 animate-bounce-slow" />
          </CardContent>
        </Card>
      </div>
      {/* Custom CSS for animation */}
      <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 8s ease-in-out infinite;
        }
        @keyframes float1 {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.1); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(30px) scale(0.9); }
        }
        @keyframes float3 {
          0%, 100% { transform: translateX(0) scale(1); }
          50% { transform: translateX(30px) scale(1.05); }
        }
        .animate-float1 { animation: float1 7s ease-in-out infinite; }
        .animate-float2 { animation: float2 9s ease-in-out infinite; }
        .animate-float3 { animation: float3 11s ease-in-out infinite; }
        .animate-bounce-slow { animation: bounce 2.5s infinite alternate; }
        @keyframes bounce {
          0% { transform: translateY(0); }
          100% { transform: translateY(-18px); }
        }
      `}</style>
    </div>
  )
}
