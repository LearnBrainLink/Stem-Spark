// Verification script to ensure all users have proper roles in database
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function verifyDatabaseRoles() {
  try {
    console.log("🔍 Verifying all users have proper roles in database...")

    // Get all auth users
    const {
      data: { users },
      error: usersError,
    } = await supabase.auth.admin.listUsers()

    if (usersError) {
      console.error("❌ Error fetching users:", usersError)
      return
    }

    console.log(`📊 Checking ${users.length} users...`)

    let withValidRoles = 0
    let withoutRoles = 0
    let withInvalidRoles = 0
    const issues = []

    for (const user of users) {
      try {
        // Get profile from database
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, role, email, full_name")
          .eq("id", user.id)
          .single()

        if (profileError) {
          if (profileError.code === "PGRST116") {
            console.log(`⚠️ No profile found for ${user.email}`)
            withoutRoles++
            issues.push({
              email: user.email,
              issue: "No profile in database",
              userId: user.id,
            })
          } else {
            console.error(`❌ Error fetching profile for ${user.email}:`, profileError)
            issues.push({
              email: user.email,
              issue: `Database error: ${profileError.message}`,
              userId: user.id,
            })
          }
          continue
        }

        // Check if role is valid
        const validRoles = ["admin", "teacher", "student", "parent"]
        if (!profile.role || !validRoles.includes(profile.role)) {
          console.log(`⚠️ Invalid role for ${user.email}: ${profile.role}`)
          withInvalidRoles++
          issues.push({
            email: user.email,
            issue: `Invalid role: ${profile.role}`,
            userId: user.id,
          })
          continue
        }

        console.log(`✅ ${user.email} has valid role: ${profile.role}`)
        withValidRoles++
      } catch (userError) {
        console.error(`❌ Error checking user ${user.email}:`, userError)
        issues.push({
          email: user.email,
          issue: `Unexpected error: ${userError.message}`,
          userId: user.id,
        })
      }
    }

    console.log("\n📊 Verification Summary:")
    console.log(`✅ Users with valid roles: ${withValidRoles}`)
    console.log(`⚠️ Users without profiles: ${withoutRoles}`)
    console.log(`❌ Users with invalid roles: ${withInvalidRoles}`)
    console.log(`📈 Success rate: ${((withValidRoles / users.length) * 100).toFixed(1)}%`)

    if (issues.length > 0) {
      console.log("\n🚨 Issues found:")
      issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.email}: ${issue.issue}`)
      })

      console.log("\n💡 To fix these issues, run the migration script: migrate-all-user-roles.js")
    } else {
      console.log("\n🎉 All users have valid roles in the database!")
    }

    // Test role loading for a few users
    console.log("\n🧪 Testing role loading from database...")
    const testUsers = users.slice(0, 3) // Test first 3 users

    for (const user of testUsers) {
      try {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

        if (profile?.role) {
          console.log(`✅ Successfully loaded role for ${user.email}: ${profile.role}`)
        } else {
          console.log(`⚠️ Could not load role for ${user.email}`)
        }
      } catch (error) {
        console.log(`❌ Error loading role for ${user.email}:`, error.message)
      }
    }
  } catch (error) {
    console.error("❌ Verification failed:", error)
  }
}

// Run the verification
verifyDatabaseRoles()
