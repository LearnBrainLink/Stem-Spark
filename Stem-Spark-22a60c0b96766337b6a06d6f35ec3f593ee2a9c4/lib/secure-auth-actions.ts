"use server"

import { createServerClient } from "./supabase"
import { revalidatePath } from "next/cache"
import { roleManager } from "./role-manager"

interface AuthResult {
  success?: boolean
  error?: string
  message?: string
  redirectUrl?: string
  requiresVerification?: boolean
}

export async function secureSignInWithEmail(formData: FormData): Promise<AuthResult> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  // Input validation
  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  if (!isValidEmail(email)) {
    return { error: "Please enter a valid email address" }
  }

  try {
    console.log(`🔐 Attempting secure login for: ${email}`)
    const supabase = createServerClient()

    // Attempt authentication
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    })

    if (authError) {
      console.error("❌ Authentication failed:", authError.message)
      return handleAuthError(authError)
    }

    if (!authData.user) {
      return { error: "Authentication failed. Please try again." }
    }

    console.log(`✅ User authenticated: ${authData.user.id}`)

    // Check email verification
    if (!authData.user.email_confirmed_at) {
      await supabase.auth.signOut()
      return {
        error: "Please verify your email address before signing in. Check your inbox for the verification email.",
        requiresVerification: true,
      }
    }

    // Get user profile and role
    const userProfile = await roleManager.getUserProfile(authData.user.id)
    if (!userProfile) {
      console.error("❌ No profile found for user")
      return { error: "User profile not found. Please contact support." }
    }

    const userRole = await roleManager.getUserRole(authData.user)
    console.log(`👤 User role: ${userRole}`)

    // Log successful login activity
    try {
      await supabase.from("user_activities").insert({
        user_id: authData.user.id,
        activity_type: "login",
        activity_description: "Successful email login",
        metadata: {
          timestamp: new Date().toISOString(),
          role: userRole,
          login_method: "email",
          ip_address: "unknown", // Could be enhanced with actual IP
        },
      })
    } catch (activityError) {
      console.error("⚠️ Activity logging failed:", activityError)
    }

    // Update last login timestamp
    try {
      await supabase
        .from("profiles")
        .update({
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", authData.user.id)
    } catch (updateError) {
      console.error("⚠️ Profile update failed:", updateError)
    }

    console.log(`🎉 Login successful for ${email}`)

    // Revalidate paths
    revalidatePath("/")

    // Determine redirect URL based on role
    const redirectUrl = roleManager.getDashboardUrl(userRole)

    return {
      success: true,
      message: "Login successful! Redirecting to your dashboard...",
      redirectUrl,
    }
  } catch (error) {
    console.error("💥 Unexpected login error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function secureSignInWithGoogle(): Promise<AuthResult> {
  try {
    console.log("🔐 Initiating Google OAuth login")
    const supabase = createServerClient()

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    })

    if (error) {
      console.error("❌ Google OAuth error:", error)
      return handleAuthError(error)
    }

    console.log("✅ Google OAuth initiated successfully")
    return {
      success: true,
      redirectUrl: data.url,
      message: "Redirecting to Google for authentication...",
    }
  } catch (error) {
    console.error("💥 Unexpected Google OAuth error:", error)
    return { error: "Failed to initiate Google login. Please try again." }
  }
}

export async function secureSignInWithGitHub(): Promise<AuthResult> {
  try {
    console.log("🔐 Initiating GitHub OAuth login")
    const supabase = createServerClient()

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })

    if (error) {
      console.error("❌ GitHub OAuth error:", error)
      return handleAuthError(error)
    }

    console.log("✅ GitHub OAuth initiated successfully")
    return {
      success: true,
      redirectUrl: data.url,
      message: "Redirecting to GitHub for authentication...",
    }
  } catch (error) {
    console.error("💥 Unexpected GitHub OAuth error:", error)
    return { error: "Failed to initiate GitHub login. Please try again." }
  }
}

export async function secureSignOut(): Promise<AuthResult> {
  try {
    const supabase = createServerClient()

    // Get current user for logging
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      try {
        const userRole = await roleManager.getUserRole(user)

        // Log logout activity
        await supabase.from("user_activities").insert({
          user_id: user.id,
          activity_type: "logout",
          activity_description: "User logged out",
          metadata: {
            timestamp: new Date().toISOString(),
            role: userRole,
          },
        })

        console.log(`👋 User ${user.email} logged out`)
      } catch (logError) {
        console.error("⚠️ Logout logging failed:", logError)
      }
    }

    // Sign out from Supabase
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("❌ Logout error:", error)
      return { error: "Failed to log out. Please try again." }
    }

    // Revalidate paths
    revalidatePath("/")

    return {
      success: true,
      message: "Successfully logged out",
      redirectUrl: "/",
    }
  } catch (error) {
    console.error("💥 Unexpected logout error:", error)
    return { error: "An unexpected error occurred during logout." }
  }
}

export async function secureForgotPassword(formData: FormData): Promise<AuthResult> {
  const email = formData.get("email") as string

  if (!email) {
    return { error: "Email address is required" }
  }

  if (!isValidEmail(email)) {
    return { error: "Please enter a valid email address" }
  }

  try {
    console.log(`🔐 Password reset requested for: ${email}`)
    const supabase = createServerClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim(), {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
    })

    if (error) {
      console.error("❌ Password reset error:", error)
      return handleAuthError(error)
    }

    console.log(`✅ Password reset email sent to: ${email}`)

    return {
      success: true,
      message: "Password reset email sent! Please check your inbox and follow the instructions.",
    }
  } catch (error) {
    console.error("💥 Unexpected password reset error:", error)
    return { error: "Failed to send password reset email. Please try again." }
  }
}

export async function resendVerificationEmail(email: string): Promise<AuthResult> {
  if (!email || !isValidEmail(email)) {
    return { error: "Please provide a valid email address" }
  }

  try {
    console.log(`📧 Resending verification email to: ${email}`)
    const supabase = createServerClient()

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email.toLowerCase().trim(),
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })

    if (error) {
      console.error("❌ Verification email resend error:", error)
      return handleAuthError(error)
    }

    console.log(`✅ Verification email resent to: ${email}`)

    return {
      success: true,
      message: "Verification email sent! Please check your inbox.",
    }
  } catch (error) {
    console.error("💥 Unexpected verification email error:", error)
    return { error: "Failed to resend verification email. Please try again." }
  }
}

// Helper functions
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function handleAuthError(error: any): AuthResult {
  const message = error.message?.toLowerCase() || ""

  if (message.includes("invalid login credentials") || message.includes("invalid email or password")) {
    return { error: "Invalid email or password. Please check your credentials and try again." }
  }

  if (message.includes("email not confirmed")) {
    return {
      error: "Please verify your email address before signing in. Check your inbox for the verification email.",
      requiresVerification: true,
    }
  }

  if (message.includes("too many requests")) {
    return { error: "Too many login attempts. Please wait a few minutes before trying again." }
  }

  if (message.includes("user not found")) {
    return { error: "No account found with this email address. Please check your email or sign up." }
  }

  if (message.includes("network")) {
    return { error: "Network error. Please check your internet connection and try again." }
  }

  if (message.includes("timeout")) {
    return { error: "Request timed out. Please try again." }
  }

  // Generic fallback
  return { error: "Authentication failed. Please try again or contact support if the problem persists." }
}
