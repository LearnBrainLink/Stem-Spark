"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Phone, MapPin, Calendar, Edit, Save, X } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ProfileContent } from "./profile-content"

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [parentInfo, setParentInfo] = useState<any>(null)
  const [activities, setActivities] = useState<any[]>([])
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        
        if (!supabaseUrl || !supabaseAnonKey) {
          console.error('Supabase configuration missing')
          return
        }

        const supabase = supabase

        const {
          data: { user },
        } = await supabase.auth.getUser()
        
        if (!user) {
          redirect("/login")
          return
        }

        // Get user profile
        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        // Get parent info if student
        const { data: parentInfoData } = await supabase.from("parent_info").select("*").eq("student_id", user.id).single()

        // Get user activities
        const { data: activitiesData } = await supabase
          .from("user_activities")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10)

        // Get internship applications
        const { data: applicationsData } = await supabase
          .from("internship_applications")
          .select("*, internships(title, company)")
          .eq("student_id", user.id)
          .order("applied_at", { ascending: false })

        setProfile(profileData)
        setParentInfo(parentInfoData)
        setActivities(activitiesData || [])
        setApplications(applicationsData || [])
      } catch (error) {
        console.error('Error fetching profile data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <ProfileContent profile={profile} parentInfo={parentInfo} activities={activities} applications={applications} />
  )
}
