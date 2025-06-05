// Test database connection and schema
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase environment variables")
  console.log("Required variables:")
  console.log("- NEXT_PUBLIC_SUPABASE_URL")
  console.log("- SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDatabase() {
  console.log("🔍 Testing database connection and schema...")

  try {
    // Test 1: Check if we can connect
    console.log("\n1. Testing connection...")
    const { data, error } = await supabase.from("profiles").select("count").limit(1)
    if (error) {
      console.error("❌ Connection failed:", error.message)
      return false
    }
    console.log("✅ Database connection successful")

    // Test 2: Check if tables exist
    console.log("\n2. Checking table structure...")
    const tables = ["profiles", "internships", "internship_applications", "user_activities", "parent_info", "videos"]

    for (const table of tables) {
      try {
        const { error: tableError } = await supabase.from(table).select("*").limit(1)
        if (tableError) {
          console.error(`❌ Table ${table} error:`, tableError.message)
        } else {
          console.log(`✅ Table ${table} exists and accessible`)
        }
      } catch (err) {
        console.error(`❌ Table ${table} check failed:`, err.message)
      }
    }

    // Test 3: Check test accounts
    console.log("\n3. Checking test accounts...")
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("email, role, email_verified")
      .in("email", ["student@test.com", "teacher@test.com", "admin@test.com"])

    if (profileError) {
      console.error("❌ Failed to fetch test profiles:", profileError.message)
    } else {
      console.log("✅ Test profiles found:", profiles.length)
      profiles.forEach((profile) => {
        console.log(`   - ${profile.email} (${profile.role}) - Verified: ${profile.email_verified}`)
      })
    }

    // Test 4: Check sample data
    console.log("\n4. Checking sample data...")
    const { data: internships, error: internshipError } = await supabase
      .from("internships")
      .select("title, status")
      .eq("status", "active")

    if (internshipError) {
      console.error("❌ Failed to fetch internships:", internshipError.message)
    } else {
      console.log(`✅ Found ${internships.length} active internships`)
      internships.forEach((internship) => {
        console.log(`   - ${internship.title}`)
      })
    }

    console.log("\n🎉 Database test completed successfully!")
    console.log("\n📋 Next steps:")
    console.log("1. Make sure you have created the auth users in Supabase Dashboard")
    console.log("2. Go to Authentication > Users in Supabase Dashboard")
    console.log("3. Create users with emails: student@test.com, teacher@test.com, admin@test.com")
    console.log("4. Set their passwords to: TestStudent123!, TestTeacher123!, TestAdmin123!")
    console.log("5. Mark their emails as verified")

    return true
  } catch (error) {
    console.error("💥 Database test failed:", error.message)
    return false
  }
}

testDatabase()
