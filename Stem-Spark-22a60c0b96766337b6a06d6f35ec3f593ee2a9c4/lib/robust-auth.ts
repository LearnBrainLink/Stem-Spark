"use server"

import { createServerClient } from "./supabase-simple"
import { roleManager, type UserRole } from "./role-manager"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

interface AuthResult {
  success?: boolean
  error?: string
  message?: string
  redirectUrl?: string
}

export async function robustSignIn(formData: FormData): Promise<AuthResult> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  try {
    console.log(`🚀 Starting robust sign in for ${email}`)
    const supabase = createServerClient()

    // Step 1: Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      console.error("❌ Authentication failed:", authError.message)

      if (authError.message.includes("Email not confirmed")) {
        return {
          error: "Please verify your email address before signing in. Check your inbox for the confirmation email.",
        }
      }

      if (authError.message.includes("Invalid login credentials")) {
        return { error: "Invalid email or password. Please check your credentials and try again." }
      }

      return { error: authError.message }
    }

    if (!authData.user) {
      return { error: "Authentication failed. Please try again." }
    }

    console.log(`✅ User authenticated: ${authData.user.id}`)

    // Step 2: Check email verification
    if (!authData.user.email_confirmed_at) {
      await supabase.auth.signOut()
      return {
        error: "Please verify your email address before signing in. Check your inbox for the confirmation email.",
      }
    }

    // Step 3: Get user role with robust fallback
    let userRole: UserRole
    try {
      userRole = await roleManager.getUserRole(authData.user)
      console.log(`✅ User role determined: ${userRole}`)
    } catch (roleError) {
      console.error("❌ Role determination failed:", roleError)
      userRole = "student" // Fallback role
    }

    // Step 4: Ensure profile exists
    try {
      const profileExists = await roleManager.getUserProfile(authData.user.id)
      if (!profileExists) {
        console.log("📝 Creating missing profile...")
        await roleManager.upsertUserProfile(authData.user, userRole)
      }
    } catch (profileError) {
      console.error("⚠️ Profile creation failed:", profileError)
      // Continue anyway - don't block login
    }

    // Step 5: Log activity (non-blocking)
    try {
      await supabase.from("user_activities").insert({
        user_id: authData.user.id,
        activity_type: "login",
        activity_description: "User logged in successfully",
        metadata: {
          timestamp: new Date().toISOString(),
          role: userRole,
          email: email,
        },
      })
    } catch (activityError) {
      console.error("⚠️ Activity logging failed:", activityError)
      // Don't block login for activity logging failures
    }

    // Step 6: Set session cookie for client-side auth
    try {
      if (authData.session) {
        cookies().set("supabase-auth-token", JSON.stringify(authData.session), {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7, // 7 days
        })
      }
    } catch (cookieError) {
      console.error("⚠️ Cookie setting failed:", cookieError)
      // Continue anyway
    }

    console.log(`🎉 Login successful for ${email} as ${userRole}`)

    // Step 7: Determine redirect URL
    const redirectUrl = roleManager.getDashboardUrl(userRole)

    // Step 8: Revalidate and redirect (with error handling)
    try {
      revalidatePath("/")
      revalidatePath(redirectUrl)

      // Use a delayed redirect to prevent NEXT_REDIRECT errors
      setTimeout(() => {
        redirect(redirectUrl)
      }, 100)

      // Return success with redirect URL as fallback
      return {
        success: true,
        message: "Login successful! Redirecting...",
        redirectUrl,
      }
    } catch (redirectError) {
      console.error("⚠️ Redirect failed:", redirectError)
      // Return success with manual redirect URL
      return {
        success: true,
        message: "Login successful! Please navigate to your dashboard.",
        redirectUrl,
      }
    }
  } catch (error) {
    console.error("💥 Unexpected sign in error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function robustSignUp(formData: FormData): Promise<AuthResult> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string
  const fullName = formData.get("fullName") as string
  const role = formData.get("role") as UserRole

  // Validation
  if (password !== confirmPassword) {
    return { error: "Passwords do not match" }
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters long" }
  }

  if (!["student", "teacher", "parent"].includes(role)) {
    return { error: "Invalid role selected" }
  }

  try {
    console.log(`🚀 Starting robust sign up for ${email} as ${role}`)
    const supabase = createServerClient()

    // Step 1: Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        data: {
          full_name: fullName,
          role: role,
        },
      },
    })

    if (authError) {
      console.error("❌ Signup error:", authError.message)
      return { error: authError.message }
    }

    if (!authData.user) {
      return { error: "Failed to create account. Please try again." }
    }

    console.log(`✅ User created in auth: ${authData.user.id}`)

    // Step 2: Create profile (with retry mechanism)
    let profileCreated = false
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt)) // Progressive delay

        const success = await roleManager.upsertUserProfile(authData.user, role, {
          full_name: fullName,
          grade: formData.get("grade") ? Number(formData.get("grade")) : null,
          country: formData.get("country") as string,
          state: formData.get("state") as string,
          school_name: formData.get("schoolName") as string,
        })

        if (success) {
          profileCreated = true
          console.log(`✅ Profile created on attempt ${attempt}`)
          break
        }
      } catch (profileError) {
        console.error(`⚠️ Profile creation attempt ${attempt} failed:`, profileError)
        if (attempt === 3) {
          console.error("❌ All profile creation attempts failed")
        }
      }
    }

    // Step 3: Log activity (non-blocking)
    try {
      await supabase.from("user_activities").insert({
        user_id: authData.user.id,
        activity_type: "account_created",
        activity_description: `Account created as ${role}`,
        metadata: { role, email, profile_created: profileCreated },
      })
    } catch (activityError) {
      console.error("⚠️ Activity logging failed:", activityError)
    }

    console.log(`🎉 Account creation completed for ${email}`)

    return {
      success: true,
      message: "Account created successfully! Please check your email to verify your account before signing in.",
    }
  } catch (error) {
    console.error("💥 Unexpected signup error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function robustSignOut(): Promise<void> {
  try {
    const supabase = createServerClient()

    // Get current user for logging
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Log activity (non-blocking)
    if (user) {
      try {
        await supabase.from("user_activities").insert({
          user_id: user.id,
          activity_type: "logout",
          activity_description: "User logged out",
          metadata: { timestamp: new Date().toISOString() },
        })
        console.log(`👋 User ${user.email} logged out`)
      } catch (activityError) {
        console.error("⚠️ Activity logging failed:", activityError)
      }
    }

    // Clear auth session
    await supabase.auth.signOut()

    // Clear cookies
    try {
      cookies().delete("supabase-auth-token")
    } catch (cookieError) {
      console.error("⚠️ Cookie clearing failed:", cookieError)
    }

    // Revalidate and redirect
    revalidatePath("/")
    redirect("/")
  } catch (error) {
    console.error("❌ Sign out error:", error)
    // Force redirect even if there's an error
    redirect("/")
  }
}

export async function robustForgotPassword(formData: FormData): Promise<AuthResult> {
  const email = formData.get("email") as string

  if (!email) {
    return { error: "Email is required" }
  }

  try {
    console.log(`🔐 Password reset requested for ${email}`)
    const supabase = createServerClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
    })

    if (error) {
      console.error("❌ Password reset error:", error.message)
      return { error: error.message }
    }

    console.log(`✅ Password reset email sent to ${email}`)

    return {
      success: true,
      message: "Password reset email sent! Check your inbox for the reset link.",
    }
  } catch (error) {
    console.error("💥 Unexpected password reset error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}
