"use server"

import { createServerClient } from "./supabase-simple"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

// Simple login function that focuses on just authentication
export async function simpleLogin(formData: FormData) {
  console.log("🔑 Simple login attempt started")

  try {
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!email || !password) {
      console.log("❌ Missing email or password")
      return { error: "Email and password are required" }
    }

    console.log(`👤 Attempting login for: ${email}`)

    // Create server client
    const supabase = createServerClient()

    // Attempt sign in with just auth (no database queries yet)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("❌ Auth error:", error.message)
      return { error: error.message }
    }

    if (!data.user) {
      console.error("❌ No user returned from auth")
      return { error: "Authentication failed" }
    }

    console.log(`✅ Auth successful for: ${email}`)

    // Get user metadata to determine role
    const role = data.user.user_metadata?.role || "student"
    console.log(`👤 User role from metadata: ${role}`)

    // Set cookies for client-side auth
    cookies().set("supabase-auth-token", JSON.stringify(data.session))

    // Redirect based on role
    if (role === "admin") {
      redirect("/admin")
    } else if (role === "teacher") {
      redirect("/teacher-dashboard")
    } else {
      redirect("/student-dashboard")
    }
  } catch (error) {
    console.error("💥 Unexpected login error:", error)
    return {
      error: "An unexpected error occurred. Please try again.",
      details: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Simple signup function
export async function simpleSignup(formData: FormData) {
  console.log("📝 Simple signup attempt started")

  try {
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string
    const fullName = formData.get("fullName") as string
    const role = formData.get("role") as string

    // Basic validation
    if (!email || !password || !confirmPassword || !fullName || !role) {
      return { error: "All required fields must be filled" }
    }

    if (password !== confirmPassword) {
      return { error: "Passwords do not match" }
    }

    console.log(`👤 Attempting signup for: ${email} as ${role}`)

    // Create server client
    const supabase = createServerClient()

    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
        data: {
          full_name: fullName,
          role: role,
        },
      },
    })

    if (error) {
      console.error("❌ Signup error:", error.message)
      return { error: error.message }
    }

    console.log(`✅ Signup successful for: ${email}`)

    return {
      success: true,
      message: "Account created successfully! Please check your email to verify your account before signing in.",
    }
  } catch (error) {
    console.error("💥 Unexpected signup error:", error)
    return {
      error: "An unexpected error occurred. Please try again.",
      details: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Simple password reset request
export async function simpleResetPassword(formData: FormData) {
  console.log("🔄 Simple password reset attempt started")

  try {
    const email = formData.get("email") as string

    if (!email) {
      return { error: "Email is required" }
    }

    console.log(`🔑 Attempting password reset for: ${email}`)

    // Create server client
    const supabase = createServerClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/reset-password`,
    })

    if (error) {
      console.error("❌ Password reset error:", error.message)
      return { error: error.message }
    }

    console.log(`✅ Password reset email sent to: ${email}`)

    return {
      success: true,
      message: "Password reset email sent! Check your inbox for the reset link.",
    }
  } catch (error) {
    console.error("💥 Unexpected password reset error:", error)
    return {
      error: "An unexpected error occurred. Please try again.",
      details: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Simple sign out
export async function simpleSignOut() {
  console.log("👋 Simple sign out attempt started")

  try {
    const supabase = createServerClient()
    await supabase.auth.signOut()

    // Clear cookies
    cookies().delete("supabase-auth-token")

    console.log("✅ Sign out successful")
    redirect("/")
  } catch (error) {
    console.error("💥 Unexpected sign out error:", error)
    redirect("/")
  }
}
