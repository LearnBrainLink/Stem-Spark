// Check environment variables
console.log("🔍 Checking environment variables...")

const requiredVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"]
NEXT_PUBLIC_SUPABASE_URL=https://qnuevynptgkoivekuzer.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFudWV2eW5wdGdrb2l2ZWt1emVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NzM4MzYsImV4cCI6MjA2NDU0OTgzNn0.z3GzoVvcFXFx1CL1LA3cww_0587aUwrlkZStgQFRrww
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFudWV2eW5wdGdrb2l2ZWt1emVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODk3MzgzNiwiZXhwIjoyMDY0NTQ5ODM2fQ.0dzieduL18-aoMkfxPTD95bP7tykb764LAEsuOjUkVA
NEXT_PUBLIC_SITE_URL=https://v0-empowering-young-engineers-dt.vercel.app/#about

const missingVars = []
const availableVars = []

for (const varName of requiredVars) {
  if (!process.env[varName]) {
    missingVars.push(varName)
  } else {
    availableVars.push(varName)
  }
}

if (missingVars.length > 0) {
  console.log("❌ Missing required environment variables:")
  missingVars.forEach((varName) => {
    console.log(`   - ${varName}`)
  })

  console.log("\n📝 Please create or update your .env.local file with the following variables:")
  missingVars.forEach((varName) => {
    console.log(`   ${varName}=your_value_here`)
  })
} else {
  console.log("✅ All required environment variables are set!")
}

if (availableVars.length > 0) {
  console.log("\n✅ Available environment variables:")
  availableVars.forEach((varName) => {
    // Show first few characters of the value for verification
    const value = process.env[varName]
    const maskedValue = value.substring(0, 5) + "..." + value.substring(value.length - 5)
    console.log(`   - ${varName}: ${maskedValue}`)
  })
}

console.log("\n📋 Environment check completed")
