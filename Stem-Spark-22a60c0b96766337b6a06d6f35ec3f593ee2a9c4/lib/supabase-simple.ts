import { createClient } from "@supabase/supabase-js"
import { supabase as clientSupabase } from "./supabase/client"

// Re-export the singleton client
export const supabase = clientSupabase

// For backward compatibility, export the createBrowserClient function
export const createBrowserClient = () => clientSupabase

// Server-side Supabase client (with error handling)
export const createServerClient = () => {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  
  if (!supabaseUrl) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
    return createDummyClient()
  }

  // Use service key if available, fall back to anon key
  const key = supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!key) {
    console.error("Missing Supabase API key environment variables")
    return createDummyClient()
  }

  try {
    return createClient(supabaseUrl, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  } catch (error) {
    console.error("Failed to create Supabase server client:", error)
    return createDummyClient()
  }
}

// Create a dummy client that won't crash but will log errors
function createDummyClient() {
  const errorHandler = () => {
    const error = new Error("Supabase client not properly configured")
    console.error(error)
    return { data: null, error }
  }

  return {
    auth: {
      signInWithPassword: errorHandler,
      signUp: errorHandler,
      signOut: errorHandler,
      getUser: () => ({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: null, error: null, subscription: { unsubscribe: () => {} } }),
    },
    from: () => ({
      select: () => ({ data: null, error: errorHandler() }),
      insert: () => ({ data: null, error: errorHandler() }),
      update: () => ({ data: null, error: errorHandler() }),
      delete: () => ({ data: null, error: errorHandler() }),
      eq: () => ({ data: null, error: errorHandler() }),
      single: () => ({ data: null, error: errorHandler() }),
    }),
  }
}
