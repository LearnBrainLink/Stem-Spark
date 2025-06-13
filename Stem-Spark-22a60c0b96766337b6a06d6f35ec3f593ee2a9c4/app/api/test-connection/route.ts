import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("🔍 Testing database connection...")

    const supabase = createServerClient()

    // Test 1: Basic connection
    const { data: connectionTest, error: connectionError } = await supabase.from("profiles").select("count").limit(1)

    if (connectionError) {
      console.error("❌ Connection failed:", connectionError)
      return NextResponse.json(
        {
          success: false,
          error: "Database connection failed",
          details: connectionError.message,
          code: connectionError.code,
          suggestion: getErrorSuggestion(connectionError),
        },
        { status: 500 },
      )
    }

    // Test 2: Check tables exist
    const tables = ["profiles", "internships", "internship_applications", "user_activities", "videos"]
    const tableStatus: Record<string, boolean> = {}

    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select("*").limit(1)
        tableStatus[table] = !error
      } catch {
        tableStatus[table] = false
      }
    }

    // Test 3: Check sample data
    const { data: internships } = await supabase.from("internships").select("id, title").eq("status", "active")

    const { data: videos } = await supabase.from("videos").select("id, title").eq("status", "active")

    console.log("✅ Connection test successful")

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      tables: tableStatus,
      sampleData: {
        internships: internships?.length || 0,
        videos: videos?.length || 0,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("💥 Connection test failed:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Unexpected connection error",
        details: error instanceof Error ? error.message : "Unknown error",
        suggestion: "Check your environment variables and Supabase configuration",
      },
      { status: 500 },
    )
  }
}

function getErrorSuggestion(error: any): string {
  if (error.message?.includes("relation") && error.message?.includes("does not exist")) {
    return "Tables don't exist. Run the database setup script: scripts/complete-database-connection-setup.sql"
  }

  if (error.message?.includes("permission denied")) {
    return "Permission denied. Check your RLS policies or use the service role key"
  }

  if (error.message?.includes("connection")) {
    return "Connection failed. Check your SUPABASE_URL and API keys"
  }

  if (error.code === "PGRST301") {
    return "Table not found. Make sure you've run the database setup script"
  }

  return "Check your Supabase configuration and database setup"
}
