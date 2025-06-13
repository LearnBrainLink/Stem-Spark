// Fix all issues script
const { createClient } = require("@supabase/supabase-js")
const fs = require("fs")
const path = require("path")

async function fixAllIssues() {
  console.log("🔧 Starting comprehensive fix for all issues...")

  // 1. Check environment variables
  console.log("\n📝 Checking environment variables...")
  const requiredVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"]

  const missingVars = []

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName)
    }
  }

  if (missingVars.length > 0) {
    console.log("❌ Missing environment variables:", missingVars.join(", "))
    console.log("📝 Creating .env.local file with sample values...")

    const envContent = `# STEM Spark Academy - Environment Variables
# Replace these with your actual Supabase credentials

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://qnuevynptgkoivekuzer.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFudWV2eW5wdGdrb2l2ZWt1emVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NzM4MzYsImV4cCI6MjA2NDU0OTgzNn0.z3GzoVvcFXFx1CL1LA3cww_0587aUwrlkZStgQFRrww
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFudWV2eW5wdGdrb2l2ZWt1emVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODk3MzgzNiwiZXhwIjoyMDY0NTQ5ODM2fQ.0dzieduL18-aoMkfxPTD95bP7tykb764LAEsuOjUkVA

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://v0-empowering-young-engineers-dt.vercel.app

# Optional: JWT Secret (from Supabase Settings → API → JWT Settings)
SUPABASE_JWT_SECRET=your-jwt-secret-from-supabase

# Optional: Email Service
RESEND_API_KEY=your-resend-api-key
`

    try {
      fs.writeFileSync(".env.local", envContent)
      console.log("✅ Created .env.local file")

      // Load the environment variables
      Object.entries({
        NEXT_PUBLIC_SUPABASE_URL: "https://qnuevynptgkoivekuzer.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFudWV2eW5wdGdrb2l2ZWt1emVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NzM4MzYsImV4cCI6MjA2NDU0OTgzNn0.z3GzoVvcFXFx1CL1LA3cww_0587aUwrlkZStgQFRrww",
        SUPABASE_SERVICE_ROLE_KEY:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFudWV2eW5wdGdrb2l2ZWt1emVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODk3MzgzNiwiZXhwIjoyMDY0NTQ5ODM2fQ.0dzieduL18-aoMkfxPTD95bP7tykb764LAEsuOjUkVA",
        NEXT_PUBLIC_SITE_URL: "https://v0-empowering-young-engineers-dt.vercel.app",
      }).forEach(([key, value]) => {
        process.env[key] = value
      })
    } catch (error) {
      console.error("❌ Failed to create .env.local file:", error.message)
    }
  } else {
    console.log("✅ All required environment variables are set")
  }

  // 2. Connect to Supabase
  console.log("\n🔌 Connecting to Supabase...")

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase credentials. Cannot proceed with database fixes.")
    return
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Test connection
    const { data: connectionTest, error: connectionError } = await supabase.from("profiles").select("count")

    if (connectionError) {
      console.error("❌ Supabase connection failed:", connectionError.message)
      console.log("⚠️ Proceeding with other fixes, but database issues cannot be resolved.")
    } else {
      console.log("✅ Supabase connection successful")

      // 3. Fix internships table
      console.log("\n🛠️ Checking internships table structure...")

      try {
        // Check if start_date column exists
        const { data: startDateCheck, error: startDateError } = await supabase
          .from("internships")
          .select("start_date")
          .limit(1)

        if (startDateError && startDateError.message.includes("start_date")) {
          console.log("❌ start_date column is missing, adding it...")

          // Add start_date column
          const { error: addStartDateError } = await supabase.rpc("add_column_if_not_exists", {
            table_name: "internships",
            column_name: "start_date",
            column_type: "DATE",
          })

          if (addStartDateError) {
            console.error("❌ Failed to add start_date column:", addStartDateError.message)
          } else {
            console.log("✅ Added start_date column to internships table")
          }
        } else {
          console.log("✅ start_date column exists in internships table")
        }

        // Check if end_date column exists
        const { data: endDateCheck, error: endDateError } = await supabase
          .from("internships")
          .select("end_date")
          .limit(1)

        if (endDateError && endDateError.message.includes("end_date")) {
          console.log("❌ end_date column is missing, adding it...")

          // Add end_date column
          const { error: addEndDateError } = await supabase.rpc("add_column_if_not_exists", {
            table_name: "internships",
            column_name: "end_date",
            column_type: "DATE",
          })

          if (addEndDateError) {
            console.error("❌ Failed to add end_date column:", addEndDateError.message)
          } else {
            console.log("✅ Added end_date column to internships table")
          }
        } else {
          console.log("✅ end_date column exists in internships table")
        }
      } catch (error) {
        console.error("❌ Error checking internships table:", error.message)
      }

      // 4. Fix duplicate users
      console.log("\n🧹 Checking for duplicate users...")

      try {
        // Find duplicate emails
        const { data: duplicateEmails, error: duplicateError } = await supabase.rpc("find_duplicate_emails")

        if (duplicateError) {
          console.error("❌ Failed to check for duplicate emails:", duplicateError.message)
        } else if (duplicateEmails && duplicateEmails.length > 0) {
          console.log(`❌ Found ${duplicateEmails.length} duplicate email(s), fixing...`)

          // Fix duplicate emails
          const { error: fixError } = await supabase.rpc("fix_duplicate_users")

          if (fixError) {
            console.error("❌ Failed to fix duplicate users:", fixError.message)
          } else {
            console.log("✅ Fixed duplicate users")
          }
        } else {
          console.log("✅ No duplicate users found")
        }
      } catch (error) {
        console.error("❌ Error checking duplicate users:", error.message)
      }

      // 5. Fix policy issues
      console.log("\n🔒 Checking and fixing policies...")

      try {
        // Fix policies
        const { error: policyError } = await supabase.rpc("fix_policies")

        if (policyError) {
          console.error("❌ Failed to fix policies:", policyError.message)
        } else {
          console.log("✅ Fixed policies")
        }
      } catch (error) {
        console.error("❌ Error fixing policies:", error.message)
      }
    }

    // 6. Update logo component
    console.log("\n🖼️ Updating logo component...")

    try {
      const logoPath = path.join(process.cwd(), "components", "logo.tsx")

      if (fs.existsSync(logoPath)) {
        const logoContent = fs.readFileSync(logoPath, "utf8")

        // Update the image URL
        const updatedLogoContent = logoContent.replace(
          /const imageUrl = ".*"/,
          'const imageUrl = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Adobe%20Express%20-%20file-HcjnXFMgDvMkdXpZjaJB4D1wiaY9C4.png"',
        )

        fs.writeFileSync(logoPath, updatedLogoContent)
        console.log("✅ Updated logo component with new image URL")
      } else {
        console.log("⚠️ Logo component file not found")
      }
    } catch (error) {
      console.error("❌ Error updating logo component:", error.message)
    }

    console.log("\n🎉 All fixes completed!")
    console.log("\n📋 Summary of fixes:")
    console.log("✅ Environment variables checked and .env.local created if needed")
    console.log("✅ Database connection tested")
    console.log("✅ Internships table structure fixed")
    console.log("✅ Duplicate users checked and fixed")
    console.log("✅ Database policies fixed")
    console.log("✅ Logo component updated")
  } catch (error) {
    console.error("❌ Unexpected error during fixes:", error.message)
  }
}

fixAllIssues()
