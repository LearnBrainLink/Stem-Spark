// Check environment variables
console.log("🔍 Checking environment variables...")

const requiredVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"]

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
