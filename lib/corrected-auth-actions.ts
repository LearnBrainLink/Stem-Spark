"use server"

import { createServerClient } from "./supabase-simple"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function signUp(formData: FormData) {
  console.log("🚀 Starting signup process...")

  try {
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string
    const fullName = formData.get("fullName") as string
    const role = (formData.get("role") as string) || "student"

    // Basic validation
    if (!email || !password || !confirmPassword || !fullName) {
      return { error: "All required fields must be filled" }
    }

    if (password !== confirmPassword) {
      return { error: "Passwords do not match" }
    }

    if (password.length < 8) {
      return { error: "Password must be at least 8 characters long" }
    }

    console.log(`👤 Creating account for: ${email} as ${role}`)

    const supabase = createServerClient()

    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
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

    if (error) {
      console.error("❌ Signup error:", error.message)
      return { error: error.message }
    }

    if (data.user) {
      console.log(`✅ User created successfully: ${data.user.id}`)

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
  console.log("🔑 Starting signin process...")

  try {
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!email || !password) {
      return { error: "Email and password are required" }
    }

    console.log(`👤 Attempting login for: ${email}`)

    const supabase = createServerClient()

    // Attempt sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("❌ Auth error:", error.message)
      if (error.message.includes("Email not confirmed")) {
        return {
          error: "Please verify your email address before signing in. Check your inbox for the confirmation email.",
        }
      }
      return { error: "Invalid email or password" }
    }

    if (data.user) {
      console.log(`✅ Authentication successful for: ${email}`)

      // Try to get user profile, but don't fail if it doesn't exist
      let userRole = "student"
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, full_name")
          .eq("id", data.user.id)
          .single()

        if (profile) {
          userRole = profile.role
          console.log(`👤 User role from database: ${userRole}`)
        } else {
          // Use role from auth metadata if profile doesn't exist
          userRole = data.user.user_metadata?.role || "student"
          console.log(`👤 User role from metadata: ${userRole}`)
        }
      } catch (profileError) {
        console.log("⚠️ Could not fetch profile, using default role")
        userRole = data.user.user_metadata?.role || "student"
      }

      // Log activity (don't fail if this doesn't work)
      try {
        await supabase.from("user_activities").insert({
          user_id: data.user.id,
          activity_type: "login",
          activity_description: "User logged in",
          metadata: { role: userRole, timestamp: new Date().toISOString() },
        })
      } catch (activityError) {
        console.log("⚠️ Could not log activity:", activityError)
      }

      console.log(`🎉 Login successful, redirecting to ${userRole} dashboard`)

      // Redirect based on role
      revalidatePath("/")

      if (userRole === "admin") {
        redirect("/admin")
      } else if (userRole === "teacher") {
        redirect("/teacher-dashboard")
      } else {
        redirect("/student-dashboard")
      }
    }
  } catch (error) {
    console.error("💥 Unexpected signin error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function signOut() {
  console.log("👋 Starting signout process...")

  try {
    const supabase = createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      // Try to log activity, but don't fail if it doesn't work
      try {
        await supabase.from("user_activities").insert({
          user_id: user.id,
          activity_type: "logout",
          activity_description: "User logged out",
          metadata: { timestamp: new Date().toISOString() },
        })
      } catch (activityError) {
        console.log("⚠️ Could not log logout activity:", activityError)
      }
    }

    await supabase.auth.signOut()
    console.log("✅ Signout successful")

    revalidatePath("/")
    redirect("/")
  } catch (error) {
    console.error("💥 Signout error:", error)
    redirect("/")
  }
}

export async function applyToInternship(formData: FormData) {
  console.log("📝 Processing internship application...")

  try {
    const internshipId = formData.get("internshipId") as string
    const applicationText = formData.get("applicationText") as string

    if (!internshipId || !applicationText) {
      return { error: "Internship ID and application text are required" }
    }

    const supabase = createServerClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: "You must be logged in to apply" }
    }

    console.log(`👤 User ${user.email} applying to internship ${internshipId}`)

    // Insert application (using correct column name: student_id)
    const { data, error } = await supabase
      .from("internship_applications")
      .insert({
        student_id: user.id, // Using student_id instead of user_id
        internship_id: internshipId,
        application_text: applicationText,
        status: "pending",
      })
      .select()

    if (error) {
      console.error("❌ Application error:", error.message)
      if (error.code === "23505") {
        return { error: "You have already applied to this internship" }
      }
      return { error: "Failed to submit application. Please try again." }
    }

    // Log activity
    try {
      await supabase.from("user_activities").insert({
        user_id: user.id,
        activity_type: "internship_application",
        activity_description: "Applied to internship",
        metadata: { internship_id: internshipId },
      })
    } catch (activityError) {
      console.log("⚠️ Could not log application activity:", activityError)
    }

    console.log("✅ Application submitted successfully")

    return {
      success: true,
      message: "Application submitted successfully! You will be notified about the status.",
    }
  } catch (error) {
    console.error("💥 Unexpected application error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}
