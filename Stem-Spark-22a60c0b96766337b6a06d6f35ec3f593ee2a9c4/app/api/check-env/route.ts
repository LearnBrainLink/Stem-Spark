import { NextResponse } from "next/server"

export async function GET() {
  const requiredServerVars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "NEXT_PUBLIC_SITE_URL",
  ]

  const envStatus: Record<string, boolean> = {}
  const envValues: Record<string, string> = {}

  requiredServerVars.forEach((varName) => {
    const value = process.env[varName]
    envStatus[varName] = !!value

    // Only show partial values for security
    if (value) {
      if (varName.includes("KEY") || varName.includes("SECRET")) {
        envValues[varName] = value.substring(0, 10) + "..."
      } else {
        envValues[varName] = value
      }
    } else {
      envValues[varName] = "Not set"
    }
  })

  const allSet = Object.values(envStatus).every(Boolean)

  return NextResponse.json({
    status: allSet ? "success" : "error",
    message: allSet ? "All required environment variables are set" : "Some environment variables are missing",
    variables: envStatus,
    values: envValues,
    timestamp: new Date().toISOString(),
  })
}
