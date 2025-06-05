"use server"

import { createServerClient } from "./supabase"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

interface SignUpData {
  email: string
  password: string
  confirmPassword: string
  fullName: string
  role: string
  grade?: number
  country: string
  state: string
  schoolName?: string
  parentName?: string
  parentEmail?: string
  parentPhone?: string
  relationship?: string
}

export async function signUp(formData: FormData) {
  const supabase = createServerClient()

  const signUpData: SignUpData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
    fullName: formData.get("fullName") as string,
    role: formData.get("role") as string,
    grade: formData.get("grade") ? Number.parseInt(formData.get("grade") as string) : undefined,
    country: formData.get("country") as string,
    state: formData.get("state") as string,
    schoolName: formData.get("schoolName") as string,
    parentName: formData.get("parentName") as string,
    parentEmail: formData.get("parentEmail") as string,
    parentPhone: formData.get("parentPhone") as string,
    relationship: formData.get("relationship") as string,
  }

  // Validation
  if (signUpData.password !== signUpData.confirmPassword) {
    return { error: "Passwords do not match" }
  }

  if (signUpData.password.length < 8) {
    return { error: "Password must be at least 8 characters long" }
  }

  if (signUpData.role === "student" && (!signUpData.grade || !signUpData.parentName || !signUpData.parentEmail)) {
    return { error: "Students must provide grade level and parent information" }
  }

  try {
    console.log(`🚀 Starting signup for ${signUpData.email} as ${signUpData.role}`)

    // Sign up with Supabase Auth - this will send confirmation email automatically
    const { data, error } = await supabase.auth.signUp({
      email: signUpData.email,
      password: signUpData.password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        data: {
          full_name: signUpData.fullName,
          role: signUpData.role,
        },
      },
    })

    if (error) {
      console.error("❌ Signup error:", error)
      return { error: error.message }
    }

    if (data.user) {
      console.log(`✅ User created in auth: ${data.user.id}`)

      // Create profile (the trigger should handle this, but let's be explicit)
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: data.user.id,
        email: signUpData.email,
        full_name: signUpData.fullName,
        role: signUpData.role,
        grade: signUpData.grade,
        country: signUpData.country,
        state: signUpData.state,
        school_name: signUpData.schoolName,
        email_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (profileError) {
        console.error("❌ Profile creation error:", profileError)
        return { error: "Failed to create profile. Please try again." }
      }

      console.log(`✅ Profile created for ${signUpData.role}`)

      // Create parent info if student
      if (signUpData.role === "student" && signUpData.parentName && signUpData.parentEmail) {
        const { error: parentError } = await supabase.from("parent_info").insert({
          student_id: data.user.id,
          parent_name: signUpData.parentName,
          parent_email: signUpData.parentEmail,
          parent_phone: signUpData.parentPhone,
          relationship: signUpData.relationship,
        })

        if (parentError) {
          console.error("⚠️ Parent info creation error:", parentError)
        } else {
          console.log("✅ Parent info created")
        }
      }

      // Log activity
      await supabase.from("user_activities").insert({
        user_id: data.user.id,
        activity_type: "account_created",
        activity_description: `Account created as ${signUpData.role}`,
        metadata: { role: signUpData.role, grade: signUpData.grade },
      })

      console.log(`🎉 Account creation completed for ${signUpData.email}`)

      return {
        success: true,
        message: "Account created successfully! Please check your email to verify your account before signing in.",
      }
    }

    return { error: "Failed to create account. Please try again." }
  } catch (error) {
    console.error("💥 Unexpected signup error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function signIn(formData: FormData) {
  const supabase = createServerClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  try {
    console.log(`🚀 Starting signin for ${email}`)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("❌ Sign in error:", error)
      if (error.message.includes("Email not confirmed")) {
        return {
          error: "Please verify your email address before signing in. Check your inbox for the confirmation email.",
        }
      }
      if (error.message.includes("Invalid login credentials")) {
        return { error: "Invalid email or password. Please check your credentials and try again." }
      }
      return { error: error.message }
    }

    if (data.user) {
      console.log(`✅ User authenticated: ${data.user.id}`)

      // Get user profile to check role
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, full_name, email_verified")
        .eq("id", data.user.id)
        .single()

      if (profileError || !profile) {
        console.error("❌ Profile fetch error:", profileError)
        return { error: "Profile not found. Please contact support." }
      }

      console.log(`👤 User role: ${profile.role}`)

      // Check if email is verified (for new signups)
      if (!data.user.email_confirmed_at) {
        await supabase.auth.signOut()
        return {
          error: "Please verify your email address before signing in. Check your inbox for the confirmation email.",
        }
      }

      // Update email_verified status in profile if needed
      if (!profile.email_verified) {
        await supabase
          .from("profiles")
          .update({ email_verified: true, updated_at: new Date().toISOString() })
          .eq("id", data.user.id)
        console.log("✅ Email verification status updated")
      }

      // Log activity
      await supabase.from("user_activities").insert({
        user_id: data.user.id,
        activity_type: "login",
        activity_description: "User logged in",
        metadata: {
          timestamp: new Date().toISOString(),
          role: profile.role,
        },
      })

      console.log(`🎉 Login successful for ${email} as ${profile.role}`)

      // Revalidate and redirect based on role
      revalidatePath("/")

      if (profile.role === "admin") {
        console.log("🔄 Redirecting to admin dashboard")
        redirect("/admin")
      } else if (profile.role === "teacher") {
        console.log("🔄 Redirecting to teacher dashboard")
        redirect("/teacher-dashboard")
      } else {
        console.log("🔄 Redirecting to student dashboard")
        redirect("/student-dashboard")
      }
    }
  } catch (error) {
    console.error("💥 Unexpected sign in error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function signOut() {
  const supabase = createServerClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      // Log activity
      await supabase.from("user_activities").insert({
        user_id: user.id,
        activity_type: "logout",
        activity_description: "User logged out",
        metadata: { timestamp: new Date().toISOString() },
      })
      console.log(`👋 User ${user.email} logged out`)
    }

    await supabase.auth.signOut()
    revalidatePath("/")
    redirect("/")
  } catch (error) {
    console.error("❌ Sign out error:", error)
    redirect("/")
  }
}

export async function forgotPassword(formData: FormData) {
  const supabase = createServerClient()
  const email = formData.get("email") as string

  if (!email) {
    return { error: "Email is required" }
  }

  try {
    console.log(`🔐 Password reset requested for ${email}`)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
    })

    if (error) {
      console.error("❌ Password reset error:", error)
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

export async function resetPassword(formData: FormData) {
  const supabase = createServerClient()
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" }
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters long" }
  }

  try {
    console.log("🔐 Updating password")

    const { error } = await supabase.auth.updateUser({
      password: password,
    })

    if (error) {
      console.error("❌ Password update error:", error)
      return { error: error.message }
    }

    console.log("✅ Password updated successfully")
    return { success: true, message: "Password updated successfully!" }
  } catch (error) {
    console.error("💥 Unexpected password update error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}
