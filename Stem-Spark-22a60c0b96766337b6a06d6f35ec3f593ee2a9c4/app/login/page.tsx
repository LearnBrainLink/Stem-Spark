"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Logo } from "@/components/logo"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  secureSignInWithEmail,
  secureSignInWithGoogle,
  secureSignInWithGitHub,
  secureForgotPassword,
  resendVerificationEmail,
} from "@/lib/secure-auth-actions"
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
    <div className="min-h-screen hero-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-brand-primary hover:text-brand-dark transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
        </div>

        <Card className="admin-card shadow-brand-lg">
          <CardHeader className="text-center pb-8">
            {/* Large Logo */}
            <div className="flex justify-center mb-8">
              <Logo variant="large" className="drop-shadow-lg logo-hero" />
            </div>
            <CardTitle className="text-3xl font-bold text-brand-primary">
              {showForgotPassword ? "Reset Password" : "Welcome Back"}
            </CardTitle>
            <CardDescription className="text-lg text-brand-secondary">
              {showForgotPassword
                ? "Enter your email to receive a password reset link"
                : "Sign in to your NOVAKINETIX ACADEMY account"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Message Display */}
            {message && (
              <Alert className={getMessageStyles(message.type)}>
                <div className="flex items-start gap-2">
                  {getMessageIcon(message.type)}
                  <div className="flex-1">
                    <AlertDescription className="font-medium">{message.text}</AlertDescription>
                    {message.requiresVerification && email && (
                      <div className="mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleResendVerification}
                          disabled={isLoading}
                          className="text-sm"
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Resend Verification Email
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Alert>
            )}

            {showForgotPassword ? (
              /* Forgot Password Form */
              <form action={handleForgotPassword} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="text-base font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-brand-secondary" />
                    <Input
                      id="reset-email"
                      name="email"
                      type="email"
                      placeholder="Enter your email address"
                      required
                      className="pl-10 h-12 text-base input-brand"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="submit" className="flex-1 button-primary h-12 text-lg" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="px-6 h-12"
                    onClick={() => setShowForgotPassword(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              /* Login Form */
              <>
                <form action={handleEmailLogin} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-base font-medium">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-brand-secondary" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        required
                        className="pl-10 h-12 text-base input-brand"
                        disabled={isLoading}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-base font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-brand-secondary" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        required
                        className="pl-10 pr-10 h-12 text-base input-brand"
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-brand-secondary" />
                        ) : (
                          <Eye className="h-5 w-5 text-brand-secondary" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Button
                      type="button"
                      variant="link"
                      className="px-0 text-sm text-brand-primary hover:text-brand-dark"
                      onClick={() => setShowForgotPassword(true)}
                      disabled={isLoading}
                    >
                      Forgot your password?
                    </Button>
                  </div>

                  <Button type="submit" className="w-full button-primary h-12 text-lg" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>

                {/* Social Login Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-4 text-brand-secondary font-medium">Or continue with</span>
                  </div>
                </div>

                {/* Social Login Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 text-base border-2 border-brand-light hover:bg-brand-accent interactive-button"
                    onClick={() => handleSocialLogin("google")}
                    disabled={isLoading || socialLoading !== null}
                  >
                    {socialLoading === "google" ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        Google
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 text-base border-2 border-brand-light hover:bg-brand-accent interactive-button"
                    onClick={() => handleSocialLogin("github")}
                    disabled={isLoading || socialLoading !== null}
                  >
                    {socialLoading === "github" ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Github className="w-5 h-5 mr-2" />
                        GitHub
                      </>
                    )}
                  </Button>
                </div>

                {/* Sign Up Link */}
                <div className="text-center">
                  <p className="text-brand-secondary">
                    Don't have an account?{" "}
                    <Link
                      href="/register"
                      className="text-brand-primary hover:text-brand-dark font-semibold transition-colors"
                    >
                      Sign up
                    </Link>
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-sm text-brand-secondary">🔒 Your data is protected with enterprise-grade security</p>
        </div>
      </div>
    </div>
  )
}
