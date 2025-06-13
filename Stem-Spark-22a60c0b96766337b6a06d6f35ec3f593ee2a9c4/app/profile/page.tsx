import { createServerClient } from "@/lib/supabase"
import { redirect } from "next/navigation"
import { ProfileContent } from "./profile-content"

export default async function ProfilePage() {
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get parent info if student
  const { data: parentInfo } = await supabase.from("parent_info").select("*").eq("student_id", user.id).single()

  // Get user activities
  const { data: activities } = await supabase
    .from("user_activities")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10)

  // Get internship applications
  const { data: applications } = await supabase
    .from("internship_applications")
    .select("*, internships(title, company)")
    .eq("student_id", user.id)
    .order("applied_at", { ascending: false })

  return (
    <ProfileContent profile={profile} parentInfo={parentInfo} activities={activities} applications={applications} />
  )
}
