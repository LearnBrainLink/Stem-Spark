"use server"

import { createServerClient } from "./supabase"

export interface AdminAccount {
  email: string
  password: string
  fullName: string
  role: string
  state: string
}

export const ADMIN_ACCOUNTS: AdminAccount[] = [
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

export async function createAdminAccounts() {
  const supabase = createServerClient()
  const results = []

  console.log("Starting admin account creation...")

  for (const admin of ADMIN_ACCOUNTS) {
    try {
      console.log(`Creating admin account for ${admin.email}...`)

      // First, try to create the auth user
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
        console.log(`Auth user created for ${admin.email}, creating profile...`)

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

        console.log(`Successfully created admin account for ${admin.email}`)

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

  console.log("Admin account creation completed:", results)

  return {
    success: true,
    results,
    totalCreated: results.filter((r) => r.success).length,
    totalFailed: results.filter((r) => !r.success).length,
  }
}

export async function verifyAdminAccounts() {
  const supabase = createServerClient()

  const { data: adminProfiles, error } = await supabase
    .from("profiles")
    .select("email, full_name, role, created_at")
    .eq("role", "admin")
    .in(
      "email",
      ADMIN_ACCOUNTS.map((a) => a.email),
    )

  if (error) {
    return { success: false, error: error.message }
  }

  return {
    success: true,
    adminAccounts: adminProfiles,
    totalFound: adminProfiles?.length || 0,
    expectedCount: ADMIN_ACCOUNTS.length,
  }
}
