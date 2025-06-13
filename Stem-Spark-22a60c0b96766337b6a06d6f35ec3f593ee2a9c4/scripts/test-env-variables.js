// Test environment variables
console.log("🧪 Testing environment variables...")

// Function to safely get environment variable
function getEnvVar(name) {
  const value = process.env[name]
  if (!value) {
    return `❌ Missing: ${name}`
  }
  // Mask the value for security
  return `✅ Set: ${name} (${value.substring(0, 3)}...${value.substring(value.length - 3)})`
}

// Check Supabase variables
console.log(getEnvVar("NEXT_PUBLIC_SUPABASE_URL"))
console.log(getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY"))
console.log(getEnvVar("SUPABASE_SERVICE_ROLE_KEY"))

// Check other variables
console.log(getEnvVar("NEXT_PUBLIC_SITE_URL"))

console.log("\n📋 Environment variable test completed")
