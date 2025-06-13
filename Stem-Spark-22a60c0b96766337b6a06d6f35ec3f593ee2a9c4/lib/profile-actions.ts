"use server"

import { createServerClient } from "./supabase"
import { redirect } from "next/navigation"

export async function exportUserData() {
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // Get all user data
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: parentInfo } = await supabase.from("parent_info").select("*").eq("student_id", user.id)

  const { data: activities } = await supabase
    .from("user_activities")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const { data: applications } = await supabase
    .from("internship_applications")
    .select("*, internships(title, company)")
    .eq("student_id", user.id)

  // Create export data
  const exportData = {
    profile,
    parentInfo,
    activities,
    applications,
    exportedAt: new Date().toISOString(),
  }

  // Log the export activity
  await supabase.from("user_activities").insert({
    user_id: user.id,
    activity_type: "data_export",
    activity_description: "User exported their data",
    metadata: { timestamp: new Date().toISOString() },
  })

  // In a real application, you would generate a downloadable file
  // For now, we'll redirect to a page showing the data
  console.log("User data export:", exportData)

  // You could implement actual file download here
  redirect("/profile?exported=true")
}
