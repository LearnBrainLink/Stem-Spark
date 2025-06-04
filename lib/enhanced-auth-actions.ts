"use server"

import { createServerClient } from "./supabase"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

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

export async function enhancedSignUp(formData: FormData) {
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
    // Use Supabase's built-in email verification
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
      console.error("Signup error:", error)
      return { error: error.message }
    }

    if (data.user) {
      // Create profile
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        email: signUpData.email,
        full_name: signUpData.fullName,
        role: signUpData.role,
        grade: signUpData.grade,
        country: signUpData.country,
        state: signUpData.state,
        school_name: signUpData.schoolName,
        email_verified: false,
      })

      if (profileError) {
        console.error("Profile creation error:", profileError)
        return { error: "Failed to create profile. Please try again." }
      }

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
          console.error("Parent info creation error:", parentError)
        }
      }

      // Log activity
      await supabase.from("user_activities").insert({
        user_id: data.user.id,
        activity_type: "account_created",
        activity_description: `Account created as ${signUpData.role}`,
        metadata: { role: signUpData.role, grade: signUpData.grade },
      })

      console.log(`✅ Account created for ${signUpData.email} as ${signUpData.role}`)
      console.log(`📧 Verification email sent to ${signUpData.email} via Supabase`)

      return {
        success: true,
        message: "Account created successfully! Please check your email to verify your account.",
        emailSent: true,
      }
    }

    return { error: "Failed to create account. Please try again." }
  } catch (error) {
    console.error("Unexpected signup error:", error)
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
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Sign in error:", error)
      return { error: "Invalid email or password" }
    }

    if (data.user) {
      // Get user profile to check role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", data.user.id)
        .single()

      // Log activity
      await supabase.from("user_activities").insert({
        user_id: data.user.id,
        activity_type: "login",
        activity_description: "User logged in",
        metadata: {
          timestamp: new Date().toISOString(),
          role: profile?.role || "unknown",
        },
      })

      console.log(`✅ User ${email} logged in successfully as ${profile?.role || "unknown"}`)
    }

    revalidatePath("/dashboard")
    redirect("/dashboard")
  } catch (error) {
    console.error("Unexpected sign in error:", error)
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
    }

    await supabase.auth.signOut()
    revalidatePath("/")
    redirect("/")
  } catch (error) {
    console.error("Sign out error:", error)
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
    // Use Supabase's built-in password reset
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
    })

    if (error) {
      console.error("Password reset error:", error)
      return { error: error.message }
    }

    console.log(`🔐 Password reset email sent to ${email} via Supabase`)

    return {
      success: true,
      message: "Password reset email sent! Check your inbox.",
      emailSent: true,
    }
  } catch (error) {
    console.error("Unexpected password reset error:", error)
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
    const { error } = await supabase.auth.updateUser({
      password: password,
    })

    if (error) {
      console.error("Password update error:", error)
      return { error: error.message }
    }

    return { success: true, message: "Password updated successfully!" }
  } catch (error) {
    console.error("Unexpected password update error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function updateProfile(formData: FormData) {
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in" }
  }

  try {
    // Get current profile data
    const { data: currentProfile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    if (!currentProfile) {
      return { error: "Profile not found" }
    }

    const fullName = formData.get("fullName") as string
    const email = formData.get("email") as string
    const schoolName = formData.get("schoolName") as string
    const grade = formData.get("grade") ? Number.parseInt(formData.get("grade") as string) : currentProfile.grade
    const country = (formData.get("country") as string) || currentProfile.country
    const state = (formData.get("state") as string) || currentProfile.state

    // Track what fields are being updated
    const updatedFields = []
    if (fullName !== currentProfile.full_name) updatedFields.push("full_name")
    if (schoolName !== currentProfile.school_name) updatedFields.push("school_name")
    if (grade !== currentProfile.grade) updatedFields.push("grade")
    if (country !== currentProfile.country) updatedFields.push("country")
    if (state !== currentProfile.state) updatedFields.push("state")

    // Update auth user email if changed
    let emailChanged = false
    if (email !== user.email) {
      emailChanged = true
      updatedFields.push("email")

      // Use Supabase's built-in email change
      const { error: emailError } = await supabase.auth.updateUser({
        email: email,
      })

      if (emailError) {
        return { error: emailError.message }
      }

      console.log(`📧 Email change verification sent to ${email} via Supabase`)
    }

    // Update profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        email: emailChanged ? email : currentProfile.email,
        school_name: schoolName,
        grade: grade,
        country: country,
        state: state,
        email_verified: emailChanged ? false : currentProfile.email_verified,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (profileError) {
      return { error: "Failed to update profile" }
    }

    // Log activity
    await supabase.from("user_activities").insert({
      user_id: user.id,
      activity_type: "profile_updated",
      activity_description: "Profile information updated",
      metadata: { updated_fields: updatedFields },
    })

    revalidatePath("/profile")

    return {
      success: true,
      message: emailChanged
        ? "Profile updated successfully! Please check your email to verify your new email address."
        : "Profile updated successfully!",
      emailSent: emailChanged,
    }
  } catch (error) {
    console.error("Profile update error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function changePassword(formData: FormData) {
  const supabase = createServerClient()

  const currentPassword = formData.get("currentPassword") as string
  const newPassword = formData.get("newPassword") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (newPassword !== confirmPassword) {
    return { error: "New passwords do not match" }
  }

  if (newPassword.length < 8) {
    return { error: "Password must be at least 8 characters long" }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in" }
  }

  try {
    // Update password
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      return { error: error.message }
    }

    // Log activity
    await supabase.from("user_activities").insert({
      user_id: user.id,
      activity_type: "password_changed",
      activity_description: "Password changed successfully",
      metadata: { timestamp: new Date().toISOString() },
    })

    return { success: true, message: "Password changed successfully!" }
  } catch (error) {
    console.error("Password change error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function createAdminAccounts() {
  const supabase = createServerClient()

  const ADMIN_ACCOUNTS = [
    {
      email: "admin@stemspark.academy",
      password: "STEMAdmin2024!",
      fullName: "Dr. Sarah Johnson",
      role: "Main Administrator",
      state: "California",
    },
    {
      email: "director@stemspark.academy",
      password: "STEMDirector2024!",
      fullName: "Prof. Michael Chen",
      role: "Program Director",
      state: "New York",
    },
    {
      email: "coordinator@stemspark.academy",
      password: "STEMCoord2024!",
      fullName: "Dr. Emily Rodriguez",
      role: "Education Coordinator",
      state: "Texas",
    },
    {
      email: "manager@stemspark.academy",
      password: "STEMManager2024!",
      fullName: "Prof. David Kim",
      role: "Content Manager",
      state: "Washington",
    },
  ]

  const results = []

  console.log("🚀 Starting admin account creation...")

  for (const admin of ADMIN_ACCOUNTS) {
    try {
      console.log(`Creating admin account for ${admin.email}...`)

      // Create auth user with email confirmation
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: admin.email,
        password: admin.password,
        email_confirm: true,
        user_metadata: {
          full_name: admin.fullName,
          role: "admin",
        },
      })

      if (authError) {
        console.error(`Auth error for ${admin.email}:`, authError)

        // If user already exists, try to get the existing user
        if (authError.message.includes("already registered")) {
          console.log(`User ${admin.email} already exists, checking profile...`)

          // Check if profile exists
          const { data: existingProfile } = await supabase
            .from("profiles")
            .select("*")
            .eq("email", admin.email)
            .single()

          if (existingProfile) {
            results.push({
              success: true,
              email: admin.email,
              fullName: admin.fullName,
              role: admin.role,
              note: "Already exists",
            })
            continue
          }
        }

        results.push({
          success: false,
          email: admin.email,
          error: authError.message,
        })
        continue
      }

      if (authData.user) {
        console.log(`✅ Auth user created for ${admin.email}, creating profile...`)

        // Create or update profile
        const { error: profileError } = await supabase.from("profiles").upsert({
          id: authData.user.id,
          email: admin.email,
          full_name: admin.fullName,
          role: "admin",
          country: "United States",
          state: admin.state,
          email_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (profileError) {
          console.error(`Profile error for ${admin.email}:`, profileError)
          results.push({
            success: false,
            email: admin.email,
            error: profileError.message,
          })
          continue
        }

        // Log admin creation activity
        await supabase.from("user_activities").insert({
          user_id: authData.user.id,
          activity_type: "admin_account_created",
          activity_description: `Admin account created: ${admin.role}`,
          metadata: {
            email: admin.email,
            full_name: admin.fullName,
            role: admin.role,
            auto_created: true,
            created_at: new Date().toISOString(),
          },
        })

        console.log(`✅ Successfully created admin account for ${admin.email}`)

        results.push({
          success: true,
          email: admin.email,
          fullName: admin.fullName,
          role: admin.role,
        })
      }
    } catch (error) {
      console.error(`Unexpected error creating admin ${admin.email}:`, error)
      results.push({
        success: false,
        email: admin.email,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  console.log("🎉 Admin account creation completed:", results)

  return {
    success: true,
    results,
    totalCreated: results.filter((r) => r.success).length,
    totalFailed: results.filter((r) => !r.success).length,
  }
}

export async function verifyAdminAccounts() {
  const supabase = createServerClient()

  const ADMIN_EMAILS = [
    "admin@stemspark.academy",
    "director@stemspark.academy",
    "coordinator@stemspark.academy",
    "manager@stemspark.academy",
  ]

  const { data: adminProfiles, error } = await supabase
    .from("profiles")
    .select("email, full_name, role, created_at")
    .eq("role", "admin")
    .in("email", ADMIN_EMAILS)

  if (error) {
    return { success: false, error: error.message }
  }

  return {
    success: true,
    adminAccounts: adminProfiles,
    totalFound: adminProfiles?.length || 0,
    expectedCount: ADMIN_EMAILS.length,
  }
}
