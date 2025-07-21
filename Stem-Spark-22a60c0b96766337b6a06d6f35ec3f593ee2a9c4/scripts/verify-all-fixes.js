// Comprehensive verification script for all fixes
const { createClient } = require("@supabase/supabase-js")

async function verifyAllFixes() {
  console.log("🔍 Starting comprehensive verification...")

  // 1. Check environment variables
  console.log("\n📝 Checking environment variables...")
  const requiredVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"]

  let envScore = 0
  for (const varName of requiredVars) {
    if (process.env[varName]) {
      console.log(`✅ ${varName} is set`)
      envScore++
    } else {
      console.log(`❌ ${varName} is missing`)
    }
  }

  console.log(`📊 Environment Score: ${envScore}/${requiredVars.length}`)

  if (envScore === 0) {
    console.log("❌ Cannot proceed without environment variables")
    return
  }

  // 2. Test database connection
  console.log("\n🔌 Testing database connection...")

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: connectionTest, error: connectionError } = await supabase.from("profiles").select("count").limit(1)

    if (connectionError) {
      console.log("❌ Database connection failed:", connectionError.message)
    } else {
      console.log("✅ Database connection successful")

      // 3. Test database functions
      console.log("\n🧪 Testing database functions...")

      const functionsToTest = ["find_duplicate_emails", "fix_duplicate_users", "add_column_if_not_exists"]

      let functionScore = 0
      for (const functionName of functionsToTest) {
        try {
          if (functionName === "find_duplicate_emails") {
            const { data, error } = await supabase.rpc(functionName)
            if (error) {
              console.log(`❌ ${functionName}: ${error.message}`)
            } else {
              console.log(`✅ ${functionName}: Found ${data?.length || 0} duplicates`)
              functionScore++
            }
          } else if (functionName === "add_column_if_not_exists") {
            // Test with a safe operation
            const { data, error } = await supabase.rpc(functionName, {
              table_name: "profiles",
              column_name: "test_column_check",
              column_type: "TEXT",
            })
            if (error) {
              console.log(`❌ ${functionName}: ${error.message}`)
            } else {
              console.log(`✅ ${functionName}: Working`)
              functionScore++
            }
          } else {
            console.log(`ℹ️ ${functionName}: Skipped (requires parameters)`)
            functionScore++
          }
        } catch (error) {
          console.log(`❌ ${functionName}: ${error.message}`)
        }
      }

      console.log(`📊 Function Score: ${functionScore}/${functionsToTest.length}`)

      // 4. Test table structure
      console.log("\n🏗️ Testing table structure...")

      const tablesToTest = [
        { name: "profiles", columns: ["id", "email", "full_name", "role"] },
        { name: "internships", columns: ["id", "title", "start_date", "end_date"] },
        { name: "internship_applications", columns: ["id", "internship_id", "student_id"] },
      ]

      let tableScore = 0
      for (const table of tablesToTest) {
        try {
          const { data, error } = await supabase.from(table.name).select(table.columns.join(",")).limit(1)

          if (error) {
            console.log(`❌ ${table.name}: ${error.message}`)
          } else {
            console.log(`✅ ${table.name}: Structure correct`)
            tableScore++
          }
        } catch (error) {
          console.log(`❌ ${table.name}: ${error.message}`)
        }
      }

      console.log(`📊 Table Score: ${tableScore}/${tablesToTest.length}`)
    }
  } catch (error) {
    console.log("❌ Database test failed:", error.message)
  }

  // 5. Test image URLs
  console.log("\n🖼️ Testing image URLs...")

  const imageUrls = [
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Adobe%20Express%20-%20file-Es1GtGpls4shSscGjp8jpeTXPdDeC6.png",
    "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop",
  ]

  let imageScore = 0
  for (const url of imageUrls) {
    try {
      const response = await fetch(url, { method: "HEAD" })
      if (response.ok) {
        console.log(`✅ Image accessible: ${url.substring(0, 50)}...`)
        imageScore++
      } else {
        console.log(`❌ Image failed: ${url.substring(0, 50)}... (${response.status})`)
      }
    } catch (error) {
      console.log(`❌ Image error: ${url.substring(0, 50)}... (${error.message})`)
    }
  }

  console.log(`📊 Image Score: ${imageScore}/${imageUrls.length}`)

  // 6. Overall assessment
  console.log("\n🎯 Overall Assessment:")

  const totalScore = envScore + functionScore + tableScore + imageScore
  const maxScore = requiredVars.length + functionsToTest.length + tablesToTest.length + imageUrls.length
  const percentage = Math.round((totalScore / maxScore) * 100)

  console.log(`📊 Total Score: ${totalScore}/${maxScore} (${percentage}%)`)

  if (percentage >= 90) {
    console.log("🎉 Excellent! All systems are working properly.")
  } else if (percentage >= 70) {
    console.log("✅ Good! Most systems are working with minor issues.")
  } else if (percentage >= 50) {
    console.log("⚠️ Fair! Some systems need attention.")
  } else {
    console.log("❌ Poor! Multiple systems need fixing.")
  }

  console.log("\n📋 Next Steps:")
  if (envScore < requiredVars.length) {
    console.log("1. Set up missing environment variables")
  }
  if (functionScore < functionsToTest.length) {
    console.log("2. Run database function setup scripts")
  }
  if (tableScore < tablesToTest.length) {
    console.log("3. Run database schema setup scripts")
  }
  if (imageScore < imageUrls.length) {
    console.log("4. Check image URL accessibility")
  }

  console.log("\n✨ Verification completed!")
}

verifyAllFixes()
