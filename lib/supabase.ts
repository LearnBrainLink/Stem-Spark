import { createClient } from "@supabase/supabase-js"

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
}

if (!supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable")
}

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// Server-side Supabase client
export const createServerClient = () => {
  if (!supabaseServiceKey) {
    console.error("❌ Missing SUPABASE_SERVICE_ROLE_KEY - using anon key instead")
    return createClient(supabaseUrl, supabaseAnonKey)
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Test connection function
export async function testConnection() {
  try {
    console.log("🔍 Testing Supabase connection...")

    // Test client connection
    const { data, error } = await supabase.from("profiles").select("count").limit(1)

    if (error) {
      console.error("❌ Client connection failed:", error.message)
      return { success: false, error: error.message, type: "client" }
    }

    console.log("✅ Client connection successful")

    // Test server connection
    const serverClient = createServerClient()
    const { data: serverData, error: serverError } = await serverClient.from("profiles").select("count").limit(1)

    if (serverError) {
      console.error("❌ Server connection failed:", serverError.message)
      return { success: false, error: serverError.message, type: "server" }
    }

    console.log("✅ Server connection successful")
    return { success: true, message: "All connections working" }
  } catch (error) {
    console.error("💥 Connection test failed:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      type: "unknown",
    }
  }
}
