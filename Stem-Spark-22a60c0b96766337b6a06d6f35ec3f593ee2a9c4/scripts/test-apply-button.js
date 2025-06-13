// Test the apply button functionality
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

async function testApplyButton() {
  console.log("🧪 Testing apply button functionality...\n")

  try {
    // Step 1: Sign in as a student
    console.log("Signing in as student@test.com...")
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: "student@test.com",
      password: "TestStudent123!",
    })

    if (signInError) {
      console.error(`❌ Login failed: ${signInError.message}`)
      return
    }

    console.log("✅ Login successful")
    const studentId = signInData.user.id

    // Step 2: Get available internships
    console.log("\nFetching available internships...")
    const { data: internships, error: internshipsError } = await supabase
      .from("internships")
      .select("id, title, company")
      .eq("status", "active")
      .limit(3)

    if (internshipsError) {
      console.error(`❌ Failed to fetch internships: ${internshipsError.message}`)
      return
    }

    if (!internships || internships.length === 0) {
      console.error("❌ No active internships found")
      return
    }

    console.log(`✅ Found ${internships.length} internships`)
    internships.forEach((internship, index) => {
      console.log(`   ${index + 1}. ${internship.title} at ${internship.company}`)
    })

    // Step 3: Apply for the first internship
    const internshipToApply = internships[0]
    console.log(`\nApplying for "${internshipToApply.title}"...`)

    const applicationData = {
      student_id: studentId,
      internship_id: internshipToApply.id,
      status: "pending",
      student_statement:
        "I am very interested in this opportunity and believe my skills in programming make me a good fit.",
      parent_approval: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data: application, error: applicationError } = await supabase
      .from("applications")
      .insert(applicationData)
      .select()
      .single()

    if (applicationError) {
      console.error(`❌ Application failed: ${applicationError.message}`)
      return
    }

    console.log("✅ Application submitted successfully")
    console.log(`   Application ID: ${application.id}`)
    console.log(`   Status: ${application.status}`)

    // Step 4: Verify the application was recorded
    console.log("\nVerifying application in database...")
    const { data: verifyApp, error: verifyError } = await supabase
      .from("applications")
      .select("id, status, created_at")
      .eq("student_id", studentId)
      .eq("internship_id", internshipToApply.id)
      .single()

    if (verifyError) {
      console.error(`❌ Verification failed: ${verifyError.message}`)
      return
    }

    console.log("✅ Application verified in database")
    console.log(`   Application ID: ${verifyApp.id}`)
    console.log(`   Status: ${verifyApp.status}`)
    console.log(`   Created at: ${new Date(verifyApp.created_at).toLocaleString()}`)

    // Step 5: Update internship participant count
    console.log("\nChecking if internship participant count was updated...")
    const { data: updatedInternship, error: updateError } = await supabase
      .from("internships")
      .select("id, title, current_participants, max_participants")
      .eq("id", internshipToApply.id)
      .single()

    if (updateError) {
      console.error(`❌ Failed to check internship: ${updateError.message}`)
      return
    }

    console.log("✅ Internship details retrieved")
    console.log(`   Title: ${updatedInternship.title}`)
    console.log(`   Current participants: ${updatedInternship.current_participants}`)
    console.log(`   Maximum participants: ${updatedInternship.max_participants}`)
  } catch (err) {
    console.error(`❌ Unexpected error: ${err.message}`)
  }

  console.log("\n🎯 Apply button testing completed!")
}

// Run the test
testApplyButton()
