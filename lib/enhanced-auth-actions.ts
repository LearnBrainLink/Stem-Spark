"use server"

import { createServerClient } from "./supabase"
// Removed: import { redirect } from "next/navigation" // Direct redirects are handled client-side
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
        email_verified: false, // Email is not verified until the user clicks the link
      })

      if (profileError) {
        console.error("Profile creation error:", profileError)
        // Potentially delete the auth user if profile creation fails to keep data consistent
        // await supabase.auth.admin.deleteUser(data.user.id); // Requires admin privileges
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
          // This might not be a critical failure, so we log it but don't necessarily stop the process
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
        emailSent: true, // Indicates that Supabase handles the email sending
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
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Sign in error:", error)
      return { error: "Invalid email or password. Please try again." }
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

    revalidatePath("/videos") // Or /internships if that's the preferred default
    // Return success and the path for client-side redirection
    return { success: true, redirectPath: "/videos" } // Changed redirectPath

  } catch (error) {
     // Check if the error is the specific NEXT_REDIRECT error
    if (typeof error === 'object' && error !== null && 'digest' in error && typeof error.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT')) {
        console.warn("signIn action: NEXT_REDIRECT caught. This indicates an issue if redirect is expected client-side.");
        // This state suggests the client should handle the redirect.
        return { success: true, redirectPath: "/videos", needsClientRedirect: true }; // Changed redirectPath
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
      // Log activity
      await supabase.from("user_activities").insert({
        user_id: user.id,
        activity_type: "logout",
        activity_description: "User logged out",
        metadata: { timestamp: new Date().toISOString() },
      })
       console.log(`✅ User ${user.email} logged out successfully.`)
    }

    await supabase.auth.signOut()
    revalidatePath("/")
    // Return success and the path for client-side redirection
    return { success: true, redirectPath: "/" }

  } catch (error) {
    if (typeof error === 'object' && error !== null && 'digest' in error && typeof error.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT')) {
        console.warn("signOut action: NEXT_REDIRECT caught. This indicates an issue if redirect is expected client-side.");
        return { success: true, redirectPath: "/", needsClientRedirect: true };
    }
    console.error("Sign out error:", error)
    // Even if logging fails, try to sign out and redirect client-side
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
      emailSent: true, // Indicates Supabase handles email sending
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
     // Log activity
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        await supabase.from("user_activities").insert({
            user_id: user.id,
            activity_type: "password_reset",
            activity_description: "User reset their password successfully",
            metadata: { timestamp: new Date().toISOString() },
        });
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
    // This should ideally not happen if the page calling this is protected
    return { error: "You must be logged in to update your profile." }
  }

  try {
    // Get current profile data
    const { data: currentProfile, error: fetchProfileError } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    
    if (fetchProfileError || !currentProfile) {
      console.error("Error fetching current profile:", fetchProfileError);
      return { error: "Could not retrieve your profile. Please try again." };
    }


    const fullName = formData.get("fullName") as string
    const email = formData.get("email") as string // New email
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
    if (email && email !== user.email) { // Check if email is provided and different
      emailChanged = true
      updatedFields.push("email")

      // Use Supabase's built-in email change. This sends a confirmation to the new email.
      const { error: emailError } = await supabase.auth.updateUser({
        email: email,
      })

      if (emailError) {
        console.error("Auth email update error:", emailError)
        return { error: `Failed to update email: ${emailError.message}` }
      }
      console.log(`📧 Email change verification sent to ${email} via Supabase. Old email ${user.email} remains primary until new one is confirmed.`)
    }

    // Update profile in 'profiles' table
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        // Only update email in profiles table if it's successfully changed in auth.users and verified
        // For now, we keep the profile email as is, or update it if not requiring verification for display
        // If emailChanged is true, Supabase handles the actual email change upon verification.
        // The `email_verified` flag in profiles should be set to `false` if the email is changed.
        email: emailChanged ? email : currentProfile.email, // Update profile email, but verification is key
        school_name: schoolName,
        grade: grade,
        country: country,
        state: state,
        email_verified: emailChanged ? false : currentProfile.email_verified, // Mark as unverified if email changed
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (profileError) {
      console.error("Profile update error:", profileError)
      return { error: "Failed to update profile information." }
    }

    // Log activity
    if (updatedFields.length > 0) {
      await supabase.from("user_activities").insert({
        user_id: user.id,
        activity_type: "profile_updated",
        activity_description: "Profile information updated",
        metadata: { updated_fields: updatedFields },
      })
    }

    revalidatePath("/profile")

    return {
      success: true,
      message: emailChanged
        ? "Profile updated! Please check your new email address to verify the change."
        : "Profile updated successfully!",
      emailSent: emailChanged, // True if a verification email was sent for the new email
    }
  } catch (error) {
    console.error("Unexpected profile update error:", error)
    return { error: "An unexpected error occurred while updating your profile. Please try again." }
  }
}

export async function changePassword(formData: FormData) {
  const supabase = createServerClient()

  // const currentPassword = formData.get("currentPassword") as string // Supabase updateUser doesn't require currentPassword
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
    // Update password using Supabase auth
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      console.error("Password change error:", error)
      return { error: `Failed to change password: ${error.message}` }
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
    console.error("Unexpected password change error:", error)
    return { error: "An unexpected error occurred while changing your password. Please try again." }
  }
}


// Admin account creation and verification functions
const ADMIN_ACCOUNTS_LIST = [
    {
      email: "admin@stemspark.academy",
      password: "STEMAdmin2024!",
      fullName: "Dr. Sarah Johnson",
      roleDescription: "Main Administrator", // Using a different key to avoid conflict with 'role' in SignUpData
      state: "California",
    },
    {
      email: "director@stemspark.academy",
      password: "STEMDirector2024!",
      fullName: "Prof. Michael Chen",
      roleDescription: "Program Director",
      state: "New York",
    },
    {
      email: "coordinator@stemspark.academy",
      password: "STEMCoord2024!",
      fullName: "Dr. Emily Rodriguez",
      roleDescription: "Education Coordinator",
      state: "Texas",
    },
    {
      email: "manager@stemspark.academy",
      password: "STEMManager2024!",
      fullName: "Prof. David Kim",
      roleDescription: "Content Manager",
      state: "Washington",
    },
  ]


export async function createAdminAccounts() {
  const supabase = createServerClient()
  const results = []

  console.log("🚀 Starting admin account creation...")

  for (const admin of ADMIN_ACCOUNTS_LIST) {
    try {
      console.log(`Creating admin account for ${admin.email}...`)

      // Check if user already exists in auth.users
      // Supabase admin.createUser will error if user exists, so this check is more for logging/profile handling
      let { data: existingAuthUser } = await supabase.auth.admin.getUserByEmail(admin.email);
      
      let userId: string | undefined;
      let authUserCreated = false;

      if (existingAuthUser && existingAuthUser.user) {
         console.log(`Auth user ${admin.email} already exists. ID: ${existingAuthUser.user.id}`);
         userId = existingAuthUser.user.id;
      } else {
        // Create auth user with email confirmation
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: admin.email,
          password: admin.password,
          email_confirm: true, // Auto-confirm admin emails
          user_metadata: {
            full_name: admin.fullName,
            role: "admin", // This metadata is for auth.users
          },
        })

        if (authError) {
          console.error(`Auth creation error for ${admin.email}:`, authError.message)
          results.push({
            success: false,
            email: admin.email,
            error: authError.message,
          })
          continue // Skip to next admin account
        }
        if (!authData.user) {
            console.error(`Auth user data not returned for ${admin.email}`);
            results.push({ success: false, email: admin.email, error: "Auth user data not returned after creation." });
            continue;
        }
        userId = authData.user.id;
        authUserCreated = true;
        console.log(`✅ Auth user created for ${admin.email}, ID: ${userId}`);
      }
      
      if (!userId) {
        console.error(`Could not obtain User ID for ${admin.email}`);
        results.push({ success: false, email: admin.email, error: "Could not obtain User ID." });
        continue;
      }

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userId) // Check by ID first
        .single();

      if (existingProfile) {
        console.log(`Profile for ${admin.email} (ID: ${userId}) already exists. Updating if necessary...`);
        // Optionally update existing profile here if needed
        const { error: profileUpdateError } = await supabase.from("profiles").update({
            full_name: admin.fullName,
            role: "admin", // This is for the 'profiles' table
            country: "United States",
            state: admin.state,
            email_verified: true, // Admins are auto-verified
            updated_at: new Date().toISOString(),
        }).eq("id", userId);

        if (profileUpdateError) {
            console.error(`Profile update error for ${admin.email}:`, profileUpdateError.message);
            // Decide if this is a critical error
        }

      } else {
        // Create profile if it doesn't exist
        console.log(`Creating profile for ${admin.email} (ID: ${userId})...`);
        const { error: profileError } = await supabase.from("profiles").insert({
          id: userId,
          email: admin.email, // Ensure email is also in profiles table
          full_name: admin.fullName,
          role: "admin", // This is for the 'profiles' table
          country: "United States",
          state: admin.state,
          email_verified: true, // Admins are auto-verified
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (profileError) {
          console.error(`Profile creation error for ${admin.email}:`, profileError.message)
          // If auth user was just created and profile fails, consider deleting the auth user
          if (authUserCreated) {
            // await supabase.auth.admin.deleteUser(userId);
            console.warn(`Auth user ${admin.email} was created but profile creation failed. Manual cleanup might be needed.`);
          }
          results.push({
            success: false,
            email: admin.email,
            error: profileError.message,
          })
          continue // Skip to next admin account
        }
         console.log(`✅ Profile created/updated for ${admin.email}`);
      }

      // Log admin creation activity
      await supabase.from("user_activities").insert({
        user_id: userId,
        activity_type: "admin_account_created",
        activity_description: `Admin account processed: ${admin.roleDescription}`,
        metadata: {
          email: admin.email,
          full_name: admin.fullName,
          role_description: admin.roleDescription, // Use the descriptive role
          auto_created: true,
          processed_at: new Date().toISOString(),
        },
      })

      results.push({
        success: true,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.roleDescription,
        note: authUserCreated ? "Created" : "Existing Auth User, Profile Checked/Created",
      })

    } catch (error) {
      console.error(`Unexpected error creating admin ${admin.email}:`, error)
      results.push({
        success: false,
        email: admin.email,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  console.log("🎉 Admin account creation process completed:", JSON.stringify(results, null, 2))

  return {
    success: true, // Overall process success (individual results in array)
    results,
    totalProcessed: results.length,
    totalSucceeded: results.filter((r) => r.success).length,
    totalFailed: results.filter((r) => !r.success).length,
  }
}

export async function verifyAdminAccounts() {
  const supabase = createServerClient()

  const ADMIN_EMAILS = ADMIN_ACCOUNTS_LIST.map(acc => acc.email);

  const { data: adminProfiles, error } = await supabase
    .from("profiles")
    .select("email, full_name, role, created_at, email_verified")
    .eq("role", "admin") // Ensure we only get actual admins from profiles
    .in("email", ADMIN_EMAILS)

  if (error) {
    console.error("Error verifying admin accounts:", error.message)
    return { success: false, error: error.message }
  }

  return {
    success: true,
    adminAccounts: adminProfiles,
    totalFound: adminProfiles?.length || 0,
    expectedCount: ADMIN_ACCOUNTS_LIST.length,
  }
}
