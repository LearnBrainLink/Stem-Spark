"use server"

import { createServerClient } from "./supabase"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

// ... (other imports and interfaces)

export async function signIn(formData: FormData) {
  const supabase = createServerClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  console.log("Attempting sign-in for:", email); // Added logging

  if (!email || !password) {
    console.error("Sign-in attempt: Email or password missing."); // Added logging
    return { error: "Email and password are required" }
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Supabase signInWithPassword error:", error.message); // Added logging
      return { error: error.message } // Return the exact Supabase error message
    }

    if (!data.user) {
      console.error("Sign-in successful, but no user data returned."); // Added logging
      return { error: "Authentication successful, but no user data found." };
    }

    console.log(`User ${email} authenticated with Supabase. User ID: ${data.user.id}`); // Added logging

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", data.user.id)
      .single()

    if (profileError) {
      console.error("Error fetching user profile:", profileError.message); // Added logging
      // This could happen if the profile wasn't created correctly or RLS prevents access
      return { error: `Failed to retrieve user profile: ${profileError.message}` };
    }

    console.log(`User profile fetched: Role=${profile?.role}, Name=${profile?.full_name}`); // Added logging

    // Log activity
    const { error: activityError } = await supabase.from("user_activities").insert({
      user_id: data.user.id,
      activity_type: "login",
      activity_description: "User logged in",
      metadata: {
        timestamp: new Date().toISOString(),
        role: profile?.role || "unknown",
      },
    })

    if (activityError) {
      console.error("Error logging user activity:", activityError.message); // Added logging
      // This is usually not critical enough to stop login, but good to know
    }

    console.log(`✅ User ${email} logged in successfully as ${profile?.role || "unknown"}`); // Added logging
    revalidatePath("/dashboard")
    redirect("/dashboard")
  } catch (error) {
    console.error("Unexpected sign in error (catch block):", error); // Added logging
    return { error: "An unexpected error occurred. Please try again." }
  }
}
