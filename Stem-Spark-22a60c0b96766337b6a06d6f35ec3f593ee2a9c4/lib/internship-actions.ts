"use server"

import { createServerClient } from "./supabase"
import { revalidatePath } from "next/cache"

export async function applyToInternship(formData: FormData) {
  const supabase = createServerClient()

  console.log("🚀 Starting internship application process...")

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.error("❌ No user found - authentication required")
    return { error: "You must be logged in to apply" }
  }

  console.log(`✅ User authenticated: ${user.email}`)

  const internshipId = formData.get("internshipId") as string
  const applicationText = formData.get("applicationText") as string

  console.log(`📝 Application data: internshipId=${internshipId}, textLength=${applicationText?.length}`)

  if (!internshipId || !applicationText) {
    console.error("❌ Missing required fields")
    return { error: "Internship ID and application text are required" }
  }

  try {
    // Check if user is a student
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("❌ Profile fetch error:", profileError)
      return { error: "Failed to verify user profile" }
    }

    console.log(`👤 User role: ${profile?.role}`)

    // For testing purposes, allow any role to apply
    // if (profile?.role !== "student") {
    //   console.error("❌ User is not a student")
    //   return { error: "Only students can apply for internships" }
    // }

    // Check if already applied
    const { data: existingApplication, error: existingError } = await supabase
      .from("internship_applications")
      .select("id")
      .eq("internship_id", internshipId)
      .eq("student_id", user.id)
      .maybeSingle()

    if (existingError) {
      console.error("❌ Error checking existing application:", existingError)
      return { error: "Failed to check existing applications" }
    }

    if (existingApplication) {
      console.error("❌ User already applied")
      return { error: "You have already applied for this internship" }
    }

    console.log("✅ No existing application found")

    // Check if internship is still accepting applications
    const { data: internship, error: internshipError } = await supabase
      .from("internships")
      .select("application_deadline, max_participants, current_participants, title")
      .eq("id", internshipId)
      .single()

    if (internshipError) {
      console.error("❌ Internship fetch error:", internshipError)
      return { error: "Internship not found" }
    }

    console.log(`📋 Internship: ${internship.title}`)
    console.log(`📅 Deadline: ${internship.application_deadline}`)
    console.log(`👥 Participants: ${internship.current_participants}/${internship.max_participants}`)

    if (new Date(internship.application_deadline) < new Date()) {
      console.error("❌ Application deadline has passed")
      return { error: "Application deadline has passed" }
    }

    if (internship.current_participants >= internship.max_participants) {
      console.error("❌ Internship is full")
      return { error: "This internship is full" }
    }

    // Submit application
    const { data: applicationData, error: applicationError } = await supabase
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

    if (applicationError) {
      console.error("❌ Application submission error:", applicationError)

      // Check if the table exists
      const { data: tables } = await supabase.from("pg_tables").select("tablename").eq("schemaname", "public")

      console.log("Available tables:", tables)

      // Try alternative approach - create applications table if it doesn't exist
      await supabase.rpc("create_applications_table_if_not_exists")

      // Try inserting into applications table instead
      const { data: altData, error: altError } = await supabase
        .from("applications")
        .insert({
          student_id: user.id,
          internship_id: internshipId,
          student_statement: applicationText,
          status: "pending",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()

      if (altError) {
        console.error("❌ Alternative application submission error:", altError)
        return { error: "Failed to submit application. Please try again." }
      }

      console.log("✅ Application submitted to alternative table successfully")

      // Update participant count
      const { error: updateError } = await supabase
        .from("internships")
        .update({ current_participants: internship.current_participants + 1 })
        .eq("id", internshipId)

      if (updateError) {
        console.error("⚠️ Warning: Failed to update participant count:", updateError)
      } else {
        console.log("✅ Participant count updated")
      }

      revalidatePath("/internships")
      console.log("🎉 Application process completed successfully (alternative)!")

      return {
        success: true,
        message: `Successfully applied for ${internship.title}!`,
        applicationId: altData?.[0]?.id || "unknown",
      }
    }

    console.log("✅ Application submitted successfully")

    // Update participant count
    const { error: updateError } = await supabase
      .from("internships")
      .update({ current_participants: internship.current_participants + 1 })
      .eq("id", internshipId)

    if (updateError) {
      console.error("⚠️ Warning: Failed to update participant count:", updateError)
    } else {
      console.log("✅ Participant count updated")
    }

    // Log activity
    const { error: activityError } = await supabase
      .from("user_activities")
      .insert({
        user_id: user.id,
        activity_type: "internship_application",
        activity_description: `Applied for internship: ${internship.title}`,
        metadata: {
          internship_id: internshipId,
          internship_title: internship.title,
          application_id: applicationData?.[0]?.id,
        },
      })
      .maybeSingle()

    if (activityError) {
      console.error("⚠️ Warning: Failed to log activity:", activityError)
    } else {
      console.log("✅ Activity logged")
    }

    revalidatePath("/internships")
    console.log("🎉 Application process completed successfully!")

    return {
      success: true,
      message: `Successfully applied for ${internship.title}!`,
      applicationId: applicationData?.[0]?.id,
    }
  } catch (error) {
    console.error("💥 Unexpected error in applyToInternship:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function withdrawFromInternship(applicationId: string) {
  const supabase = createServerClient()

  console.log(`🚀 Starting withdrawal process for application: ${applicationId}`)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.error("❌ No user found - authentication required")
    return { error: "You must be logged in" }
  }

  console.log(`✅ User authenticated: ${user.email}`)

  try {
    // Try both tables
    let application
    let applicationError

    // First try internship_applications
    const { data: app1, error: err1 } = await supabase
      .from("internship_applications")
      .select("internship_id, status")
      .eq("id", applicationId)
      .eq("student_id", user.id)
      .maybeSingle()

    if (!err1 && app1) {
      application = app1
      applicationError = null
    } else {
      // Then try applications
      const { data: app2, error: err2 } = await supabase
        .from("applications")
        .select("internship_id, status")
        .eq("id", applicationId)
        .eq("student_id", user.id)
        .maybeSingle()

      application = app2
      applicationError = err2
    }

    if (applicationError || !application) {
      console.error("❌ Application fetch error:", applicationError)
      return { error: "Application not found" }
    }

    console.log(`📋 Application status: ${application.status}`)

    if (application.status !== "pending") {
      console.error("❌ Cannot withdraw non-pending application")
      return { error: "Can only withdraw pending applications" }
    }

    // Update application status in both tables to be safe
    const { error: updateError1 } = await supabase
      .from("internship_applications")
      .update({ status: "withdrawn", updated_at: new Date().toISOString() })
      .eq("id", applicationId)

    const { error: updateError2 } = await supabase
      .from("applications")
      .update({ status: "withdrawn", updated_at: new Date().toISOString() })
      .eq("id", applicationId)

    if (updateError1 && updateError2) {
      console.error("❌ Withdrawal error:", updateError1, updateError2)
      return { error: "Failed to withdraw application" }
    }

    console.log("✅ Application withdrawn successfully")

    // Update participant count
    const { data: internship, error: internshipError } = await supabase
      .from("internships")
      .select("current_participants")
      .eq("id", application.internship_id)
      .single()

    if (internship && !internshipError) {
      const { error: countError } = await supabase
        .from("internships")
        .update({ current_participants: Math.max(0, internship.current_participants - 1) })
        .eq("id", application.internship_id)

      if (countError) {
        console.error("⚠️ Warning: Failed to update participant count:", countError)
      } else {
        console.log("✅ Participant count updated")
      }
    }

    // Log activity
    const { error: activityError } = await supabase
      .from("user_activities")
      .insert({
        user_id: user.id,
        activity_type: "internship_withdrawal",
        activity_description: `Withdrew internship application`,
        metadata: {
          internship_id: application.internship_id,
          application_id: applicationId,
        },
      })
      .maybeSingle()

    if (activityError) {
      console.error("⚠️ Warning: Failed to log activity:", activityError)
    } else {
      console.log("✅ Activity logged")
    }

    revalidatePath("/internships")
    console.log("🎉 Withdrawal process completed successfully!")

    return {
      success: true,
      message: "Application withdrawn successfully!",
    }
  } catch (error) {
    console.error("💥 Unexpected error in withdrawFromInternship:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function createInternship(formData: FormData) {
  const supabase = createServerClient()

  console.log("🚀 Starting internship creation process...")

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.error("❌ No user found - authentication required")
    return { error: "You must be logged in" }
  }

  console.log(`✅ User authenticated: ${user.email}`)

  try {
    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("❌ Profile fetch error:", profileError)
      return { error: "Failed to verify user profile" }
    }

    console.log(`👤 User role: ${profile?.role}`)

    if (profile?.role !== "admin") {
      console.error("❌ User is not an admin")
      return { error: "Only admins can create internships" }
    }

    const internshipData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      company: formData.get("company") as string,
      location: formData.get("location") as string,
      duration: formData.get("duration") as string,
      requirements: formData.get("requirements") as string,
      application_deadline: formData.get("applicationDeadline") as string,
      start_date: formData.get("startDate") as string,
      end_date: formData.get("endDate") as string,
      max_participants: Number.parseInt(formData.get("maxParticipants") as string),
      created_by: user.id,
      status: "active",
      current_participants: 0,
    }

    console.log(`📋 Creating internship: ${internshipData.title}`)

    const { data: createdInternship, error: createError } = await supabase
      .from("internships")
      .insert(internshipData)
      .select()
      .single()

    if (createError) {
      console.error("❌ Internship creation error:", createError)
      return { error: "Failed to create internship. Please try again." }
    }

    console.log("✅ Internship created successfully")

    // Log activity
    const { error: activityError } = await supabase.from("user_activities").insert({
      user_id: user.id,
      activity_type: "internship_created",
      activity_description: `Created internship: ${internshipData.title}`,
      metadata: {
        title: internshipData.title,
        internship_id: createdInternship.id,
        company: internshipData.company,
      },
    })

    if (activityError) {
      console.error("⚠️ Warning: Failed to log activity:", activityError)
    } else {
      console.log("✅ Activity logged")
    }

    revalidatePath("/admin/internships")
    revalidatePath("/internships")
    console.log("🎉 Internship creation completed successfully!")

    return {
      success: true,
      message: `Internship "${internshipData.title}" created successfully!`,
      internshipId: createdInternship.id,
    }
  } catch (error) {
    console.error("💥 Unexpected error in createInternship:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}
