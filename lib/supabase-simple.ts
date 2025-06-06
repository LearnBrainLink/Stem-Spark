import { createClient } from "@supabase/supabase-js"

// Get environment variables with fallbacks for safety
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

// Log environment variable status (without exposing values)
console.log(`Supabase URL configured: ${!!supabaseUrl}`)
console.log(`Supabase Anon Key configured: ${!!supabaseAnonKey}`)
console.log(`Supabase Service Key configured: ${!!supabaseServiceKey}`)

// Client-side Supabase client (with error handling)
export const createBrowserClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables for browser client")
    // Return a dummy client that won't crash but will log errors
    return createDummyClient()
  }

  try {
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  } catch (error) {
    console.error("Failed to create Supabase browser client:", error)
    return createDummyClient()
  }
}

// Server-side Supabase client (with error handling)
export const createServerClient = () => {
  if (!supabaseUrl) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
    return createDummyClient()
  }

  // Use service key if available, fall back to anon key
  const key = supabaseServiceKey || supabaseAnonKey
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

// Export a singleton instance for client-side use
export const supabase = createBrowserClient()
