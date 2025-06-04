"use server"

import { createServerClient } from "./supabase"
import { revalidatePath } from "next/cache"

export async function simpleApplyToInternship(internshipId: string, applicationText: string) {
  console.log("🚀 Simple apply function called")
  console.log("📝 Internship ID:", internshipId)
  console.log("📝 Application text length:", applicationText?.length)

  const supabase = createServerClient()

  try {
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("❌ No user found:", userError)
      return { error: "You must be logged in to apply" }
    }

    console.log("✅ User found:", user.email)

    // Validate inputs
    if (!internshipId || !applicationText || applicationText.trim().length === 0) {
      console.error("❌ Missing required fields")
      return { error: "Please fill in all required fields" }
    }

    // Check if internship exists
    const { data: internship, error: internshipError } = await supabase
      .from("internships")
      .select("*")
      .eq("id", internshipId)
      .single()

    if (internshipError || !internship) {
      console.error("❌ Internship not found:", internshipError)
      return { error: "Internship not found" }
    }

    console.log("✅ Internship found:", internship.title)

    // Check if already applied
    const { data: existingApp } = await supabase
      .from("internship_applications")
      .select("id")
      .eq("internship_id", internshipId)
      .eq("student_id", user.id)
      .maybeSingle()

    if (existingApp) {
      console.error("❌ Already applied")
      return { error: "You have already applied for this internship" }
    }

    console.log("✅ No existing application found")

    // Submit application
    const { data: newApp, error: appError } = await supabase
      .from("internship_applications")
      .insert({
        internship_id: internshipId,
        student_id: user.id,
        application_text: applicationText,
        status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (appError) {
      console.error("❌ Failed to create application:", appError)
      return { error: "Failed to submit application. Please try again." }
    }

    console.log("✅ Application created:", newApp.id)

    // Update participant count
    const { error: updateError } = await supabase
      .from("internships")
      .update({
        current_participants: (internship.current_participants || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", internshipId)

    if (updateError) {
      console.error("⚠️ Failed to update participant count:", updateError)
    } else {
      console.log("✅ Participant count updated")
    }

    revalidatePath("/internships")
    console.log("🎉 Application submitted successfully!")

    return {
      success: true,
      message: `Successfully applied for ${internship.title}!`,
      applicationId: newApp.id,
    }
  } catch (error) {
    console.error("💥 Unexpected error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function simpleWithdrawApplication(applicationId: string) {
  console.log("🚀 Simple withdraw function called")
  console.log("📝 Application ID:", applicationId)

  const supabase = createServerClient()

  try {
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("❌ No user found:", userError)
      return { error: "You must be logged in" }
    }

    console.log("✅ User found:", user.email)

    // Get application
    const { data: application, error: appError } = await supabase
      .from("internship_applications")
      .select("*")
      .eq("id", applicationId)
      .eq("student_id", user.id)
      .single()

    if (appError || !application) {
      console.error("❌ Application not found:", appError)
      return { error: "Application not found" }
    }

    console.log("✅ Application found:", application.id)

    if (application.status !== "pending") {
      console.error("❌ Cannot withdraw non-pending application")
      return { error: "Can only withdraw pending applications" }
    }

    // Update application status
    const { error: updateError } = await supabase
      .from("internship_applications")
      .update({
        status: "withdrawn",
        updated_at: new Date().toISOString(),
      })
      .eq("id", applicationId)

    if (updateError) {
      console.error("❌ Failed to withdraw application:", updateError)
      return { error: "Failed to withdraw application" }
    }

    console.log("✅ Application withdrawn")

    // Update participant count
    const { data: internship } = await supabase
      .from("internships")
      .select("current_participants")
      .eq("id", application.internship_id)
      .single()

    if (internship) {
      await supabase
        .from("internships")
        .update({
          current_participants: Math.max(0, (internship.current_participants || 1) - 1),
          updated_at: new Date().toISOString(),
        })
        .eq("id", application.internship_id)

      console.log("✅ Participant count updated")
    }

    revalidatePath("/internships")
    console.log("🎉 Application withdrawn successfully!")

    return {
      success: true,
      message: "Application withdrawn successfully!",
    }
  } catch (error) {
    console.error("💥 Unexpected error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}
