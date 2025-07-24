import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a single instance that persists across the entire application
const supabaseClient = createSupabaseClient(supabaseUrl, supabaseAnonKey)

export function createClient() {
  return supabaseClient
}

// Export the singleton instance for direct imports
export const supabase = supabaseClient 