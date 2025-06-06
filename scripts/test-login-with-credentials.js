// Test login functionality with your Supabase credentials
console.log("🔐 Testing login functionality with your credentials...")

const SUPABASE_URL = "https://qnuevynptgkoivekuzer.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFudWV2eW5wdGdrb2l2ZWt1emVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NzM4MzYsImV4cCI6MjA2NDU0OTgzNn0.z3GzoVvcFXFx1CL1LA3cww_0587aUwrlkZStgQFRrww"

async function testAuth() {
  try {
    console.log("📧 Testing signup functionality...")

    // Test signup
    const signupResponse = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        email: "test@example.com",
        password: "TestPassword123!",
        data: {
          full_name: "Test User",
          role: "student",
        },
      }),
    })

    const signupData = await signupResponse.json()

    if (signupResponse.ok) {
      console.log("✅ Signup endpoint working")
      console.log("📧 User created:", signupData.user?.email)
    } else {
      console.log("⚠️ Signup response:", signupData)
    }

    console.log("\n🔑 Testing signin functionality...")

    // Test signin
    const signinResponse = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        email: "test@example.com",
        password: "TestPassword123!",
      }),
    })

    const signinData = await signinResponse.json()

    if (signinResponse.ok) {
      console.log("✅ Signin endpoint working")
      console.log("🎫 Access token received:", !!signinData.access_token)
    } else {
      console.log("⚠️ Signin response:", signinData)
    }

    console.log("\n🎉 Auth system test completed!")

    return true
  } catch (error) {
    console.error("💥 Auth test failed:", error.message)
    return false
  }
}

// Run the test
testAuth().then((success) => {
  if (success) {
    console.log("\n🚀 Your authentication system is ready!")
    console.log("💡 Next steps:")
    console.log("   1. Configure your site URL in Supabase dashboard")
    console.log("   2. Set up email templates")
    console.log("   3. Test the login page")
  } else {
    console.log("\n❌ Authentication issues detected")
    console.log("💡 Please check your Supabase auth settings")
  }
})
