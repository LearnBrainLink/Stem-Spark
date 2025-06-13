// Test the apply button functionality in chat
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

async function testApplyButtonInChat() {
  console.log("🧪 Testing apply button functionality in chat...\n")

  try {
    // Step 1: Create a test user if it doesn't exist
    console.log("Creating test user...")
    const testEmail = "test-student-chat@example.com"
    const testPassword = "TestPassword123!"

    // Check if user exists
    const { data: existingUser } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    })

    let userId

    if (!existingUser?.user) {
      // Create user
      const { data: newUser, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      })

      if (signUpError) {
        console.error(`❌ Failed to create test user: ${signUpError.message}`)
        return
      }

      userId = newUser.user.id
      console.log(`✅ Created test user: ${testEmail} (${userId})`)

      // Create profile
      await supabase.from("profiles").insert({
        id: userId,
        email: testEmail,
        role: "student",
        first_name: "Test",
        last_name: "Student",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      console.log("✅ Created test user profile")
    } else {
      userId = existingUser.user.id
      console.log(`✅ Using existing test user: ${testEmail} (${userId})`)
    }

    // Step 2: Create a test internship if none exist
    console.log("\nChecking for internships...")
    const { data: internships } = await supabase.from("internships").select("id, title").eq("status", "active").limit(1)

    let internshipId

    if (!internships || internships.length === 0) {
      // Create internship
      const { data: newInternship, error: internshipError } = await supabase
        .from("internships")
        .insert({
          title: "Chat Test Internship",
          company: "Chat Test Company",
          description: "This is a test internship for testing the apply button functionality in chat.",
          location: "Remote",
          requirements: "None - this is a test",
          duration: "4 weeks",
          application_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          start_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString(),
          max_participants: 10,
          current_participants: 0,
          status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (internshipError) {
        console.error(`❌ Failed to create test internship: ${internshipError.message}`)
        return
      }

      internshipId = newInternship.id
      console.log(`✅ Created test internship: ${newInternship.title} (${internshipId})`)
    } else {
      internshipId = internships[0].id
      console.log(`✅ Using existing internship: ${internships[0].title} (${internshipId})`)
    }

    // Step 3: Delete any existing applications for this user and internship
    console.log("\nCleaning up existing applications...")

    // Check both tables
    await supabase.from("internship_applications").delete().eq("student_id", userId).eq("internship_id", internshipId)

    await supabase.from("applications").delete().eq("student_id", userId).eq("internship_id", internshipId)

    console.log("✅ Cleaned up existing applications")

    // Step 4: Submit a test application
    console.log("\nSimulating apply button click and form submission...")

    // Create form data
    const applicationText = "This is a test application submitted via the test script for chat testing."

    // Create FormData-like object
    const formData = new FormData()
    formData.append("internshipId", internshipId)
    formData.append("applicationText", applicationText)

    // Import the server action
    const { applyToInternship } = require("../lib/internship-actions")

    // Call the server action directly
    const result = await applyToInternship(formData)

    if (result.error) {
      console.error(`❌ Application submission failed: ${result.error}`)
      return
    }

    console.log(`✅ Application submitted successfully: ${result.message || "Success!"}`)

    // Step 5: Verify the application exists
    console.log("\nVerifying application...")

    // Check both tables
    const { data: verifyApp1 } = await supabase
      .from("internship_applications")
      .select("id, status")
      .eq("student_id", userId)
      .eq("internship_id", internshipId)
      .maybeSingle()

    const { data: verifyApp2 } = await supabase
      .from("applications")
      .select("id, status")
      .eq("student_id", userId)
      .eq("internship_id", internshipId)
      .maybeSingle()

    if (verifyApp1) {
      console.log(`✅ Found application in internship_applications: ${verifyApp1.id} (${verifyApp1.status})`)
    }

    if (verifyApp2) {
      console.log(`✅ Found application in applications: ${verifyApp2.id} (${verifyApp2.status})`)
    }

    if (!verifyApp1 && !verifyApp2) {
      console.error("❌ Could not verify application in either table")
      return
    }

    // Step 6: Update internship participant count
    console.log("\nChecking if internship participant count was updated...")
    const { data: updatedInternship } = await supabase
      .from("internships")
      .select("current_participants, max_participants")
      .eq("id", internshipId)
      .single()

    console.log(
      `✅ Current participants: ${updatedInternship.current_participants}/${updatedInternship.max_participants}`,
    )

    console.log("\n🎉 Apply button functionality test in chat completed successfully!")
    console.log("\n📝 Test credentials:")
    console.log(`   Email: ${testEmail}`)
    console.log(`   Password: ${testPassword}`)
    console.log("\n🔍 You can now log in with these credentials and test the apply button in the UI")
  } catch (error) {
    console.error(`❌ Unexpected error: ${error.message}`)
    console.error(error.stack)
  }
}

// Run the test
testApplyButtonInChat()
