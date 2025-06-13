// Verify database setup
const { createClient } = require("@supabase/supabase-js")

async function verifyDatabaseSetup() {
  console.log("🔍 Verifying database setup...")

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
    return
  }

  try {
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Check connection
    console.log("🔌 Testing database connection...")
    const { data: connectionTest, error: connectionError } = await supabase.from("profiles").select("count")

    if (connectionError) {
      console.error("❌ Connection failed:", connectionError.message)
      return
    }

    console.log("✅ Database connection successful")

    // Check tables
    const tables = ["profiles", "internships", "internship_applications"]

    for (const table of tables) {
      console.log(`📋 Checking table: ${table}`)
      const { data, error } = await supabase.from(table).select("count")

      if (error) {
        console.error(`❌ Table ${table} check failed:`, error.message)
      } else {
        console.log(`✅ Table ${table} exists`)
      }
    }

    // Check internships table columns
    console.log("🔍 Checking internships table columns...")
    const { data: internship, error: internshipError } = await supabase
      .from("internships")
      .select("start_date, end_date")
      .limit(1)

    if (internshipError) {
      if (internshipError.message.includes("start_date")) {
        console.error("❌ start_date column is missing:", internshipError.message)
      } else if (internshipError.message.includes("end_date")) {
        console.error("❌ end_date column is missing:", internshipError.message)
      } else {
        console.error("❌ Error checking internships columns:", internshipError.message)
      }
    } else {
      console.log("✅ start_date and end_date columns exist in internships table")
    }

    console.log("\n✅ Database verification completed")
  } catch (error) {
    console.error("❌ Unexpected error during verification:", error.message)
  }
}

verifyDatabaseSetup()
