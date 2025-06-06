"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { robustSignIn, robustSignUp, robustForgotPassword } from "@/lib/robust-auth"
import { RedirectHandler } from "@/components/redirect-handler"
import { Mail, Lock, User, CheckCircle, Copy, Loader2 } from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/logo"

export default function AuthPage() {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState("")
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false)
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleSignIn = async (formData: FormData) => {
    setIsLoading(true)
    setMessage(null)
    setRedirectUrl(null)

    try {
      const result = await robustSignIn(formData)

      if (result?.error) {
        setMessage({ type: "error", text: result.error })
      } else if (result?.success) {
        setMessage({ type: "success", text: result.message || "Login successful!" })

        // Handle redirect
        if (result.redirectUrl) {
          setRedirectUrl(result.redirectUrl)
        }
      }
    } catch (error) {
      console.error("Login error:", error)
      setMessage({
        type: "error",
        text: "Connection error. Please check your database setup and try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (formData: FormData) => {
    setIsLoading(true)
    setMessage(null)

    try {
      const result = await robustSignUp(formData)

      if (result?.error) {
        setMessage({ type: "error", text: result.error })
      } else if (result?.success) {
        setMessage({
          type: "success",
          text: result.message || "Account created successfully!",
        })
      }
    } catch (error) {
      console.error("Signup error:", error)
      setMessage({
        type: "error",
        text: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (formData: FormData) => {
    setIsLoading(true)
    setMessage(null)

    try {
      const result = await robustForgotPassword(formData)

      if (result?.error) {
        setMessage({ type: "error", text: result.error })
      } else if (result?.success) {
        setMessage({
          type: "success",
          text: result.message || "Password reset email sent!",
        })
        setIsForgotPasswordOpen(false)
      }
    } catch (error) {
      console.error("Password reset error:", error)
      setMessage({
        type: "error",
        text: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-4">
      <RedirectHandler redirectUrl={redirectUrl || undefined} />

      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-4">
            <Logo width={120} height={60} />
          </Link>
          <p className="text-gray-600">Join our community of young engineers!</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-brand-navy">Welcome</CardTitle>
            <CardDescription className="text-center">Sign in to your account or create a new one</CardDescription>
          </CardHeader>
          <CardContent>
            {message && (
              <Alert
                className={`mb-4 ${message.type === "error" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}
              >
                <AlertDescription className={message.type === "error" ? "text-red-700" : "text-green-700"}>
                  {message.text}
                  {message.type === "success" && (
                    <div className="mt-2 flex items-center gap-1 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      {message.text.includes("email") && "Check your email inbox for the verification/reset link"}
                      {redirectUrl && "Redirecting to your dashboard..."}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <form action={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signin-email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        className="pl-10"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signin-password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Dialog open={isForgotPasswordOpen} onOpenChange={setIsForgotPasswordOpen}>
                      <DialogTrigger asChild>
                        <Button variant="link" className="px-0 text-sm text-brand-navy" disabled={isLoading}>
                          Forgot password?
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reset Password</DialogTitle>
                          <DialogDescription>
                            Enter your email address and we'll send you a link to reset your password.
                          </DialogDescription>
                        </DialogHeader>
                        <form action={handleForgotPassword} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="forgot-email">Email</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                id="forgot-email"
                                name="email"
                                type="email"
                                placeholder="your@email.com"
                                className="pl-10"
                                required
                                disabled={isLoading}
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button type="submit" disabled={isLoading} className="flex-1 bg-brand-navy text-white">
                              {isLoading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Sending...
                                </>
                              ) : (
                                "Send Reset Link"
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsForgotPasswordOpen(false)}
                              disabled={isLoading}
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-brand-navy hover:bg-brand-dark text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>

                {/* Test Accounts */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">🧪 Test Accounts</h4>
                  <p className="text-sm text-blue-600 mb-3">Use these credentials to test different roles:</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Student:</span>
                      <div className="flex items-center gap-2">
                        <code className="bg-white px-2 py-1 rounded text-xs">student@test.com / TestStudent123!</code>
                        <Button size="sm" variant="ghost" onClick={() => copyToClipboard("student@test.com")}>
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Teacher:</span>
                      <div className="flex items-center gap-2">
                        <code className="bg-white px-2 py-1 rounded text-xs">teacher@test.com / TestTeacher123!</code>
                        <Button size="sm" variant="ghost" onClick={() => copyToClipboard("teacher@test.com")}>
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Admin:</span>
                      <div className="flex items-center gap-2">
                        <code className="bg-white px-2 py-1 rounded text-xs">admin@test.com / TestAdmin123!</code>
                        <Button size="sm" variant="ghost" onClick={() => copyToClipboard("admin@test.com")}>
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form action={handleSignUp} className="space-y-4">
                  {/* Basic Information */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="signup-name"
                          name="fullName"
                          type="text"
                          placeholder="Your full name"
                          className="pl-10"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="signup-email"
                          name="email"
                          type="email"
                          placeholder="your@email.com"
                          className="pl-10"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password Fields */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password *</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="signup-password"
                          name="password"
                          type="password"
                          placeholder="••••••••"
                          className="pl-10"
                          minLength={8}
                          required
                          disabled={isLoading}
                        />
                      </div>
                      <p className="text-xs text-gray-500">Minimum 8 characters</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password *</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="confirm-password"
                          name="confirmPassword"
                          type="password"
                          placeholder="••••••••"
                          className="pl-10"
                          minLength={8}
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Role Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="role">I am a... *</Label>
                    <Select name="role" required onValueChange={setSelectedRole} disabled={isLoading}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="teacher">Teacher</SelectItem>
                        <SelectItem value="parent">Parent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-brand-navy hover:bg-brand-dark text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    By creating an account, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-gray-600 hover:text-brand-navy transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
