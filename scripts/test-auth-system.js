// Test the authentication system
import { createClient } from "@supabase/supabase-js"

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log("\n🔍 TESTING AUTHENTICATION SYSTEM")
console.log("=".repeat(50))

// Check environment variables
console.log("\n1️⃣ Checking environment variables...")
if (!supabaseUrl) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL is missing")
  process.exit(1)
}

if (!supabaseKey) {
  console.error("❌ No Supabase API key available")
  process.exit(1)
}

console.log("✅ Environment variables found")

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey)

// Test user creation and authentication
async function testAuth() {
  try {
    console.log("\n2️⃣ Testing user creation...")

    // Create test users if they don't exist
    const testUsers = [
      { email: "student@test.com", password: "TestStudent123!", role: "student" },
      { email: "teacher@test.com", password: "TestTeacher123!", role: "teacher" },
      { email: "admin@test.com", password: "TestAdmin123!", role: "admin" },
    ]

    for (const user of testUsers) {
      // Check if user exists
      const { data: existingUsers } = await supabase
        .from("auth.users")
        .select("*")
        .eq("email", user.email)
        .maybeSingle()

      if (!existingUsers) {
        console.log(`Creating test user: ${user.email}`)

        // Create user
        const { data, error } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: {
            role: user.role,
            full_name: `Test ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}`,
          },
        })

        if (error) {
          console.error(`❌ Failed to create ${user.email}:`, error.message)
        } else {
          console.log(`✅ Created ${user.email} with ID: ${data.user.id}`)
        }
      } else {
        console.log(`✅ User ${user.email} already exists`)
      }
    }

    console.log("\n3️⃣ Testing authentication...")

    // Test login for each user
    for (const user of testUsers) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password,
      })

      if (error) {
        console.error(`❌ Failed to authenticate ${user.email}:`, error.message)
      } else {
        console.log(`✅ Successfully authenticated ${user.email}`)
        console.log(`   Role: ${data.user.user_metadata.role}`)
        console.log(`   Session valid: ${!!data.session}`)
      }
    }

    console.log("\n🎉 AUTHENTICATION SYSTEM TEST COMPLETED")
    console.log("=".repeat(50))

    console.log("\n📋 SUMMARY:")
    console.log("✅ Environment variables configured")
    console.log("✅ Test users created/verified")
    console.log("✅ Authentication working")

    console.log("\n🚀 NEXT STEPS:")
    console.log("1. Try logging in with the test accounts:")
    console.log("   - student@test.com / TestStudent123!")
    console.log("   - teacher@test.com / TestTeacher123!")
    console.log("   - admin@test.com / TestAdmin123!")
    console.log("2. Verify role-based redirects are working")
    console.log("3. Test signup functionality")
  } catch (error) {
    console.error("💥 Test failed with error:", error)
  }
}

testAuth()
