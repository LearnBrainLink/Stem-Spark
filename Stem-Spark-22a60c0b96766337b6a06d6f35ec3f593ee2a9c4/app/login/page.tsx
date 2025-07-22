"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Logo } from "@/components/logo"
import { useRouter } from "next/navigation"
import Link from "next/link";
import { secureSignInWithEmail, secureSignInWithGoogle, secureSignInWithGitHub, secureForgotPassword, resendVerificationEmail } from "@/lib/secure-auth-actions"
import { enhancedSignUp } from "@/lib/enhanced-auth-actions"
import { Eye, EyeOff, Mail, Lock, Github, Loader2, AlertCircle, CheckCircle, RefreshCw } from "lucide-react"
import { createClient } from '@supabase/supabase-js'

interface AuthMessage {
  type: "success" | "error" | "info"
  text: string
  requiresVerification?: boolean
}

export default function SecureLoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<AuthMessage | null>(null)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [selectedRole, setSelectedRole] = useState("")
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    grade: '',
    country: '',
    state: '',
    schoolName: '',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    relationship: '',
    role: '',
  })
  const router = useRouter()
  
  // Create Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Clear messages after 10 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 10000)
      return () => clearTimeout(timer)
    }
  }, [message])

  // Floating particles animation
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 40 + 20,
    left: Math.random() * 100,
    top: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5
  }))

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRoleChange = (value: string) => {
    setSelectedRole(value);
    setFormData({ ...formData, role: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      if (isLogin) {
        // Create FormData with the current form values
        const loginFormData = new FormData();
        loginFormData.append('email', formData.email);
        loginFormData.append('password', formData.password);
        
        const result = await secureSignInWithEmail(loginFormData);

        if (result.error) {
          setMessage({
            type: "error",
            text: result.error,
            requiresVerification: result.requiresVerification,
          })

          // Store email for verification resend
          if (result.requiresVerification) {
            setEmail(formData.email)
          }
        } else if (result.success) {
          setMessage({
            type: "success",
            text: "Login successful! Redirecting...",
          })

          // Simple redirect to dashboard - let the dashboard handle role checking
          setTimeout(() => {
            router.push('/dashboard')
          }, 1000)
        }
      } else {
        // Create FormData for enhancedSignUp
        const form = new FormData(e.target as HTMLFormElement);
        const result = await enhancedSignUp(form);
        if (result?.error) {
          setMessage({ type: "error", text: result.error });
        } else if (result?.success) {
          setMessage({ type: "success", text: result.message || "Account created successfully! Please check your email to verify your account." });
          setIsLogin(true);
        }
        setIsLoading(false);
        return;
      }
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
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

  // Motivational section (shared for both login and sign up)
  const MotivationalSection = () => (
    <div className="w-full flex flex-col items-center justify-center text-center mb-8 mt-8">
      <p className="text-xl lg:text-2xl text-blue-100 max-w-md mx-auto leading-relaxed">
        Unlock your potential with cutting-edge education and innovation
      </p>
      <div className="flex flex-wrap justify-center gap-4 pt-4">
        <div className="bg-white/10 backdrop-blur-md rounded-full px-4 py-2 text-sm font-medium">
          🚀 Advanced Learning
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-full px-4 py-2 text-sm font-medium">
          🎓 Expert Instructors
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-full px-4 py-2 text-sm font-medium">
          🌟 Career Growth
        </div>
      </div>
    </div>
  )

  // Animated background gradient and floating particles
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse" />
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-white/10 backdrop-blur-sm animate-bounce"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
              filter: 'blur(1px)'
            }}
          />
        ))}
      </div>
      {/* Main Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
            {/* Logo Section */}
            <div className="flex flex-col items-center justify-center text-center lg:pr-8">
              <div className="mb-4 transform hover:scale-105 transition-transform duration-500">
                <Link href="/">
                  <Logo variant="mega" className="w-80 h-auto drop-shadow-2xl animate-pulse cursor-pointer" />
                </Link>
              </div>
              {/* Motivational Section directly below the logo */}
              <div className="mb-8 w-full flex flex-col items-center">
                <MotivationalSection />
              </div>
            </div>
          {/* Authentication Form */}
          <div className="w-full max-w-md mx-auto">
            <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden">
              <CardHeader className="space-y-1 pb-6">
                <CardTitle className="text-2xl font-bold text-center text-white">
                  {isLogin ? 'Sign In' : 'Create Account'}
                </CardTitle>
                <p className="text-center text-blue-100">
                  {isLogin ? 'Welcome back! Please sign in to continue.' : 'Join NovaKinetix Academy today.'}
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {message && (
                  <div className={`p-4 rounded-lg ${getMessageStyles(message.type!)}`}>
                    <div className="flex items-center">
                      {getMessageIcon(message.type!)}
                      <p className="ml-2 text-sm">{message.text}</p>
                    </div>
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="role" className="text-white font-medium">I am a... *</Label>
                      <select
                        id="role"
                        name="role"
                        value={selectedRole}
                        onChange={e => handleRoleChange(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-blue-400/20 w-full py-2 px-3 rounded"
                        required
                      >
                        <option value="">Select your role</option>
                        <option value="student">Student</option>
                        <option value="intern">Intern</option>
                        <option value="parent">Parent</option>
                      </select>
                    </div>
                  )}
                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-white font-medium">Full Name *</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-blue-400/20"
                        required={!isLogin}
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white font-medium">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-300" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-blue-400/20"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white font-medium">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-300" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-blue-400/20"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-white font-medium">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-300" />
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          placeholder="Confirm your password"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-blue-400/20"
                          required={!isLogin}
                        />
                      </div>
                    </div>
                  )}
                  {isLogin && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="text-sm text-blue-300 hover:text-white transition-colors underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transform hover:scale-105 transition-all duration-200 shadow-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isLogin ? 'Signing In...' : 'Creating Account...'}
                      </>
                    ) : (
                      isLogin ? 'Sign In' : 'Create Account'
                    )}
                  </Button>
                </form>
                <div className="relative">
                  <Separator className="bg-white/20" />
                  <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-purple-900 px-3 text-sm text-blue-200">
                    or continue with
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => handleSocialLogin('google')}
                    disabled={socialLoading === 'google'}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-200"
                  >
                    {socialLoading === 'google' ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <span className="mr-2 h-4 w-4 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                      </span>
                    )}
                    Google
                  </Button>
                  <Button
                    onClick={() => handleSocialLogin('github')}
                    disabled={socialLoading === 'github'}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-200"
                  >
                    {socialLoading === 'github' ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Github className="mr-2 h-4 w-4" />
                    )}
                    GitHub
                  </Button>
                </div>
                <div className="text-center">
                  <span className="text-blue-200">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                  </span>
                  {isLogin ? (
                    <button
                      type="button"
                      onClick={() => router.push("/sign%20up")}
                      className="ml-2 text-blue-300 hover:text-white font-medium underline transition-colors"
                    >
                      Sign up
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsLogin(true)}
                      className="ml-2 text-blue-300 hover:text-white font-medium underline transition-colors"
                    >
                      Sign in
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {/* Custom animations */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
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
