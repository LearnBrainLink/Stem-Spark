import { supabase as clientSupabase } from "./supabase/client"
import { createClient as createServerSupabaseClient } from '@supabase/supabase-js'

// Re-export the singleton client
export const supabase = clientSupabase

// Server-side Supabase client
export const createServerClient = () => {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Supabase URL or Service Role Key is missing for server client.')
    // Return a dummy client or throw an error based on desired behavior
    return {
      from: () => ({ select: () => ({ data: null, error: new Error('Supabase client not initialized') }) }),
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        admin: {
          updateUserById: async () => ({ data: { user: null }, error: null }),
        },
      },
      storage: {
        from: () => ({ upload: async () => ({ data: null, error: new Error('Supabase storage not initialized') }) }),
      },
      rpc: () => ({ data: null, error: new Error('Supabase RPC not initialized') }),
    } as any // Cast to any to satisfy type checking for dummy client
  }

  return createServerSupabaseClient(supabaseUrl, supabaseServiceKey, {
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
