// Test script to verify roles are always loaded from database
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase environment variables")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testDatabaseRoleLoading() {
  try {
    console.log("🧪 Testing database role loading...")

    // Test 1: Check if we can query profiles table
    console.log("\n📋 Test 1: Querying profiles table...")
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, email, role, full_name")
      .limit(5)

    if (profilesError) {
      console.error("❌ Error querying profiles:", profilesError)
      return
    }

    console.log(`✅ Successfully queried ${profiles.length} profiles`)
    profiles.forEach((profile) => {
      console.log(`  - ${profile.email}: ${profile.role}`)
    })

    // Test 2: Test role loading for specific user
    if (profiles.length > 0) {
      const testProfile = profiles[0]
      console.log(`\n🔍 Test 2: Testing role loading for ${testProfile.email}...`)

      const { data: roleData, error: roleError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", testProfile.id)
        .single()

      if (roleError) {
        console.error("❌ Error loading role:", roleError)
      } else {
        console.log(`✅ Role loaded from database: ${roleData.role}`)
      }
    }

    // Test 3: Check for users without roles
    console.log("\n⚠️ Test 3: Checking for users without roles...")
    const { data: usersWithoutRoles, error: noRoleError } = await supabase
      .from("profiles")
      .select("id, email, role")
      .or("role.is.null,role.eq.")

    if (noRoleError) {
      console.error("❌ Error checking for users without roles:", noRoleError)
    } else {
      if (usersWithoutRoles.length === 0) {
        console.log("✅ All users have roles assigned")
      } else {
        console.log(`⚠️ Found ${usersWithoutRoles.length} users without roles:`)
        usersWithoutRoles.forEach((user) => {
          console.log(`  - ${user.email}: ${user.role || "NULL"}`)
        })
      }
    }

    // Test 4: Check role distribution
    console.log("\n📊 Test 4: Role distribution...")
    const { data: roleStats, error: statsError } = await supabase.from("profiles").select("role")

    if (statsError) {
      console.error("❌ Error getting role stats:", statsError)
    } else {
      const roleCounts = roleStats.reduce((acc, profile) => {
        const role = profile.role || "undefined"
        acc[role] = (acc[role] || 0) + 1
        return acc
      }, {})

      console.log("Role distribution:")
      Object.entries(roleCounts).forEach(([role, count]) => {
        console.log(`  - ${role}: ${count}`)
      })
    }

    console.log("\n🎉 Database role loading test completed!")
  } catch (error) {
    console.error("❌ Test failed:", error)
  }
}

// Run the test
testDatabaseRoleLoading()
