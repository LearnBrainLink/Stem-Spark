// Test login functionality
const { createClient } = require("@supabase/supabase-js")

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase environment variables")
  console.error("Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test accounts
const accounts = [
  { email: "admin@stemspark.academy", password: "STEMAdmin2024!" },
  { email: "director@stemspark.academy", password: "STEMDirector2024!" },
  { email: "coordinator@stemspark.academy", password: "STEMCoord2024!" },
  { email: "manager@stemspark.academy", password: "STEMManager2024!" },
  { email: "student@test.com", password: "TestStudent123!" },
]

// Test login for each account
async function testLogin() {
  console.log("🔑 Testing login functionality...\n")

  for (const account of accounts) {
    try {
      console.log(`Testing login for ${account.email}...`)

      const { data, error } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password,
      })

      if (error) {
        console.error(`❌ Login failed for ${account.email}: ${error.message}`)
      } else {
        console.log(`✅ Login successful for ${account.email}`)

        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single()

        if (profileError) {
          console.error(`❌ Failed to fetch profile for ${account.email}: ${profileError.message}`)
        } else {
          console.log(`   Role: ${profile.role}`)
          console.log(`   Name: ${profile.full_name}`)
        }
      }
    } catch (err) {
      console.error(`❌ Unexpected error for ${account.email}: ${err.message}`)
    }

    console.log("-----------------------------------")
  }

  console.log("\n🔍 Login testing completed!")
}

// Run the test
testLogin()
