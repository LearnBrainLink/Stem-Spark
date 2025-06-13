// Create admin accounts using Supabase's JavaScript client
const { createClient } = require("@supabase/supabase-js")

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables")
  console.error("Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Admin accounts to create
const adminAccounts = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    email: "admin@stemspark.academy",
    password: "STEMAdmin2024!",
    fullName: "Dr. Sarah Johnson",
    country: "United States",
    state: "California",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    email: "director@stemspark.academy",
    password: "STEMDirector2024!",
    fullName: "Prof. Michael Chen",
    country: "United States",
    state: "New York",
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    email: "coordinator@stemspark.academy",
    password: "STEMCoord2024!",
    fullName: "Dr. Emily Rodriguez",
    country: "United States",
    state: "Texas",
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    email: "manager@stemspark.academy",
    password: "STEMManager2024!",
    fullName: "Prof. David Kim",
    country: "United States",
    state: "Washington",
  },
]

async function createAdminAccounts() {
  console.log("🔑 Creating admin accounts...\n")

  for (const admin of adminAccounts) {
    try {
      console.log(`Creating account for ${admin.email}...`)

      // First, check if user already exists
      const { data: existingUser } = await supabase.from("profiles").select("id").eq("email", admin.email).single()

      if (existingUser) {
        console.log(`User ${admin.email} already exists, deleting...`)

        // Delete existing user from auth.users
        await supabase.auth.admin.deleteUser(existingUser.id)

        // Delete from profiles table
        await supabase.from("profiles").delete().eq("email", admin.email)
      }

      // Create user with admin.createUser
      const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        uuid: admin.id,
        email: admin.email,
        password: admin.password,
        email_confirm: true,
        user_metadata: {
          full_name: admin.fullName,
        },
      })

      if (userError) {
        console.error(`❌ Failed to create user ${admin.email}: ${userError.message}`)
        continue
      }

      console.log(`✅ Created auth user for ${admin.email}`)

      // Create profile
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: userData.user.id,
        email: admin.email,
        full_name: admin.fullName,
        role: "admin",
        country: admin.country,
        state: admin.state,
        email_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (profileError) {
        console.error(`❌ Failed to create profile for ${admin.email}: ${profileError.message}`)
      } else {
        console.log(`✅ Created profile for ${admin.email}`)
      }

      // Log activity
      const { error: activityError } = await supabase.from("user_activities").insert({
        user_id: userData.user.id,
        activity_type: "admin_account_created",
        activity_description: "Admin account created and configured",
        metadata: {
          email: admin.email,
          full_name: admin.fullName,
          role: "admin",
          auto_created: true,
        },
        created_at: new Date().toISOString(),
      })

      if (activityError) {
        console.error(`❌ Failed to log activity for ${admin.email}: ${activityError.message}`)
      }
    } catch (err) {
      console.error(`❌ Unexpected error for ${admin.email}: ${err.message}`)
    }

    console.log("-----------------------------------")
  }

  console.log("\n✅ Admin account creation completed!")
}

// Run the function
createAdminAccounts()
