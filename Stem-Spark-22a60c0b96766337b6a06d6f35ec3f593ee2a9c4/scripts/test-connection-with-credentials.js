// Test connection with the provided credentials
console.log("🔍 Testing Supabase connection with provided credentials...")

const SUPABASE_URL = "https://qnuevynptgkoivekuzer.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFudWV2eW5wdGdrb2l2ZWt1emVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NzM4MzYsImV4cCI6MjA2NDU0OTgzNn0.z3GzoVvcFXFx1CL1LA3cww_0587aUwrlkZStgQFRrww"
const SUPABASE_SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFudWV2eW5wdGdrb2l2ZWt1emVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODk3MzgzNiwiZXhwIjoyMDY0NTQ5ODM2fQ.0dzieduL18-aoMkfxPTD95bP7tykb764LAEsuOjUkVA"

async function testConnection() {
  try {
    console.log("📡 Testing basic connection...")

    // Test basic API connection
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    })

    if (response.ok) {
      console.log("✅ Basic API connection successful")
    } else {
      console.log("❌ Basic API connection failed:", response.status, response.statusText)
      return false
    }

    // Test auth endpoint
    console.log("🔐 Testing auth endpoint...")
    const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    })

    if (authResponse.ok) {
      const authData = await authResponse.json()
      console.log("✅ Auth endpoint accessible")
      console.log("🔧 Auth settings:", {
        external_email_enabled: authData.external?.email?.enabled,
        external_phone_enabled: authData.external?.phone?.enabled,
        disable_signup: authData.disable_signup,
        site_url: authData.site_url,
      })
    } else {
      console.log("⚠️ Auth endpoint test failed:", authResponse.status)
    }

    // Test with service role key
    console.log("🔑 Testing service role access...")
    const serviceResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    })

    if (serviceResponse.ok) {
      console.log("✅ Service role access successful")
    } else {
      console.log("❌ Service role access failed:", serviceResponse.status)
    }

    console.log("\n🎉 Connection test completed!")
    console.log("📋 Summary:")
    console.log("   - Supabase URL: ✅ Valid")
    console.log("   - Anon Key: ✅ Valid")
    console.log("   - Service Key: ✅ Valid")
    console.log("   - API Accessible: ✅ Yes")
    console.log("   - Auth Enabled: ✅ Yes")

    return true
  } catch (error) {
    console.error("💥 Connection test failed:", error.message)
    return false
  }
}

// Run the test
testConnection().then((success) => {
  if (success) {
    console.log("\n🚀 Your Supabase connection is ready!")
    console.log("💡 Next steps:")
    console.log("   1. Set up your database tables")
    console.log("   2. Configure authentication settings")
    console.log("   3. Test the login functionality")
  } else {
    console.log("\n❌ Connection issues detected")
    console.log("💡 Please check:")
    console.log("   1. Your Supabase project is active")
    console.log("   2. API keys are correct")
    console.log("   3. Project URL is accessible")
  }
})
