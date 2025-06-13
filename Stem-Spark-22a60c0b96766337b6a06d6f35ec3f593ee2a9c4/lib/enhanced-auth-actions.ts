"use server"

import { createServerClient } from "./supabase"
import { revalidatePath } from "next/cache"
import { roleManager } from "./role-manager"

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
    console.log(`🚀 Starting signup for ${signUpData.email} as ${signUpData.role}`)

    // Use Supabase's built-in email verification
    const { data, error } = await supabase.auth.signUp({
      email: signUpData.email,
      password: signUpData.password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        data: {
          full_name: signUpData.fullName,
          // Don't store role in metadata - we'll use database only
        },
      },
    })

    if (error) {
      console.error("Signup error:", error)
      return { error: error.message }
    }

    if (data.user) {
      console.log(`✅ Auth user created: ${data.user.id}`)

      // Create profile in database with role - this is the source of truth
      const profileSuccess = await roleManager.upsertUserProfile(data.user, signUpData.role as any, {
        grade: signUpData.grade,
        country: signUpData.country,
        state: signUpData.state,
        school_name: signUpData.schoolName,
        email_verified: false,
      })

      if (!profileSuccess) {
        console.error("❌ Profile creation failed")
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

      return {
        success: true,
        message: "Account created successfully! Please check your email to verify your account.",
        emailSent: true,
      }
    }

    return { error: "Failed to create account. Please try again." }
  } catch (error) {
    console.error("Unexpected signup error:", error)
    return { error: "An unexpected error occurred during signup. Please try again." }
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
      return { error: "Invalid email or password. Please try again." }
    }

    if (data.user) {
      console.log(`✅ User authenticated: ${data.user.id}`)

      // ALWAYS get role from database, never from metadata
      const userRole = await roleManager.getUserRole(data.user)
      const userProfile = await roleManager.getUserProfile(data.user.id)

      if (!userProfile) {
        console.error("❌ No profile found for authenticated user")
        return { error: "Profile not found. Please contact support." }
      }

      console.log(`👤 User role from database: ${userRole}`)

      // Log activity
      await supabase.from("user_activities").insert({
        user_id: data.user.id,
        activity_type: "login",
        activity_description: "User logged in",
        metadata: {
          timestamp: new Date().toISOString(),
          role: userRole,
        },
      })

      console.log(`✅ User ${email} logged in successfully as ${userRole}`)

      revalidatePath("/")

      // Return success with redirect path based on database role
      const redirectPath = roleManager.getDashboardUrl(userRole)
      return { success: true, redirectPath }
    }
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "digest" in error &&
      typeof error.digest === "string" &&
      error.digest.startsWith("NEXT_REDIRECT")
    ) {
      console.warn("signIn action: NEXT_REDIRECT caught")
      return { success: true, redirectPath: "/dashboard", needsClientRedirect: true }
    }
    console.error("Unexpected sign in error:", error)
    return { error: "An unexpected error occurred during sign-in. Please try again." }
  }
}

export async function signOut() {
  const supabase = createServerClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      // Get role from database for logging
      const userRole = await roleManager.getUserRole(user)

      // Log activity
      await supabase.from("user_activities").insert({
        user_id: user.id,
        activity_type: "logout",
        activity_description: "User logged out",
        metadata: {
          timestamp: new Date().toISOString(),
          role: userRole,
        },
      })
      console.log(`✅ User ${user.email} logged out successfully`)
    }

    await supabase.auth.signOut()
    revalidatePath("/")
    return { success: true, redirectPath: "/" }
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "digest" in error &&
      typeof error.digest === "string" &&
      error.digest.startsWith("NEXT_REDIRECT")
    ) {
      console.warn("signOut action: NEXT_REDIRECT caught")
      return { success: true, redirectPath: "/", needsClientRedirect: true }
    }
    console.error("Sign out error:", error)
    return { error: "An error occurred during sign out.", redirectPath: "/" }
  }
}

export async function forgotPassword(formData: FormData) {
  const supabase = createServerClient()
  const email = formData.get("email") as string

  if (!email) {
    return { error: "Email is required" }
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
    })

    if (error) {
      console.error("Password reset error:", error)
      return { error: error.message }
    }

    console.log(`🔐 Password reset email sent to ${email}`)

    return {
      success: true,
      message: "Password reset email sent! Check your inbox.",
      emailSent: true,
    }
  } catch (error) {
    console.error("Unexpected password reset error:", error)
    return { error: "An unexpected error occurred while sending the password reset email. Please try again." }
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

    // Log activity with role from database
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      const userRole = await roleManager.getUserRole(user)
      await supabase.from("user_activities").insert({
        user_id: user.id,
        activity_type: "password_reset",
        activity_description: "User reset their password successfully",
        metadata: {
          timestamp: new Date().toISOString(),
          role: userRole,
        },
      })
    }

    return { success: true, message: "Password updated successfully!" }
  } catch (error) {
    console.error("Unexpected password update error:", error)
    return { error: "An unexpected error occurred while updating your password. Please try again." }
  }
}

export async function updateProfile(formData: FormData) {
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in to update your profile." }
  }

  try {
    // Get current profile from database
    const currentProfile = await roleManager.getUserProfile(user.id)

    if (!currentProfile) {
      console.error("Error fetching current profile")
      return { error: "Could not retrieve your profile. Please try again." }
    }

    const fullName = formData.get("fullName") as string
    const email = formData.get("email") as string
    const schoolName = formData.get("schoolName") as string
    const grade = formData.get("grade") ? Number.parseInt(formData.get("grade") as string) : currentProfile.grade
    const country = (formData.get("country") as string) || currentProfile.country
    const state = (formData.get("state") as string) || currentProfile.state

    // Track what fields are being updated for logging
    const updatedFields: string[] = []
    if (fullName !== currentProfile.full_name) updatedFields.push("full_name")
    if (schoolName !== currentProfile.school_name) updatedFields.push("school_name")
    if (grade !== currentProfile.grade) updatedFields.push("grade")
    if (country !== currentProfile.country) updatedFields.push("country")
    if (state !== currentProfile.state) updatedFields.push("state")

    let emailChanged = false
    if (email && email !== user.email) {
      emailChanged = true
      updatedFields.push("email")

      const { error: emailError } = await supabase.auth.updateUser({
        email: email,
      })

      if (emailError) {
        console.error("Auth email update error:", emailError)
        return { error: `Failed to update email: ${emailError.message}` }
      }
      console.log(`📧 Email change verification sent to ${email}`)
    }

    // Update profile in database
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
      console.error("Profile update error:", profileError)
      return { error: "Failed to update profile information." }
    }

    // Log activity with role from database
    if (updatedFields.length > 0) {
      const userRole = await roleManager.getUserRole(user)
      await supabase.from("user_activities").insert({
        user_id: user.id,
        activity_type: "profile_updated",
        activity_description: "Profile information updated",
        metadata: {
          updated_fields: updatedFields,
          role: userRole,
        },
      })
    }

    revalidatePath("/profile")

    return {
      success: true,
      message: emailChanged
        ? "Profile updated! Please check your new email address to verify the change."
        : "Profile updated successfully!",
      emailSent: emailChanged,
    }
  } catch (error) {
    console.error("Unexpected profile update error:", error)
    return { error: "An unexpected error occurred while updating your profile. Please try again." }
  }
}

export async function changePassword(formData: FormData) {
  const supabase = createServerClient()

  const newPassword = formData.get("newPassword") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (newPassword !== confirmPassword) {
    return { error: "New passwords do not match" }
  }

  if (newPassword.length < 8) {
    return { error: "New password must be at least 8 characters long" }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in to change your password." }
  }

  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      console.error("Password change error:", error)
      return { error: `Failed to change password: ${error.message}` }
    }

    // Log activity with role from database
    const userRole = await roleManager.getUserRole(user)
    await supabase.from("user_activities").insert({
      user_id: user.id,
      activity_type: "password_changed",
      activity_description: "Password changed successfully",
      metadata: {
        timestamp: new Date().toISOString(),
        role: userRole,
      },
    })

    return { success: true, message: "Password changed successfully!" }
  } catch (error) {
    console.error("Unexpected password change error:", error)
    return { error: "An unexpected error occurred while changing your password. Please try again." }
  }
}

export async function signInWithEmail(formData: FormData) {
  // This is an alias for the existing signIn function for compatibility
  return await signIn(formData)
}

export async function signInWithGoogle() {
  const supabase = createServerClient()

  try {
    console.log("🚀 Starting Google OAuth sign in")

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
      return { error: error.message }
    }

    console.log("✅ Google OAuth initiated successfully")

    return {
      success: true,
      redirectUrl: data.url,
      message: "Redirecting to Google for authentication...",
    }
  } catch (error) {
    console.error("Unexpected Google OAuth error:", error)
    return { error: "An unexpected error occurred during Google sign-in. Please try again." }
  }
}

// Migration function to ensure all existing users have proper database roles
export async function migrateAllUserRoles() {
  try {
    console.log("🚀 Starting migration of all user roles to database...")

    const result = await roleManager.migrateExistingUsersRoles()

    console.log(`🎉 Migration completed: ${result.success}/${result.total} users migrated successfully`)

    return {
      success: true,
      message: `Migration completed: ${result.success}/${result.total} users migrated successfully`,
      details: result,
    }
  } catch (error) {
    console.error("❌ Migration failed:", error)
    return {
      success: false,
      error: "Migration failed. Please try again.",
      details: error,
    }
  }
}
