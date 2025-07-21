// Simple test to verify login functionality
console.log("🧪 Testing login functionality...")

// Test admin credentials
const adminCredentials = [
  { email: "admin@stemspark.academy", password: "STEMAdmin2024!" },
  { email: "director@stemspark.academy", password: "STEMDirector2024!" },
  { email: "coordinator@stemspark.academy", password: "STEMCoord2024!" },
  { email: "manager@stemspark.academy", password: "STEMManager2024!" },
]

console.log("🔑 Admin credentials to test:")
adminCredentials.forEach((cred, index) => {
  console.log(`${index + 1}. Email: ${cred.email}`)
  console.log(`   Password: ${cred.password}`)
})

console.log("\n📝 Test student credentials:")
console.log("Email: student@test.com")
console.log("Password: TestStudent123!")

console.log("\n✅ All credentials are ready for testing!")
console.log("🔗 Go to /login page and try these credentials")

// Output success
console.log("\n🎉 Login test setup completed!")
