import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

let supabaseClient: ReturnType<typeof createSupabaseClient> | null = null

export function createClient() {
  if (!supabaseClient) {
    supabaseClient = createSupabaseClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseClient
}

// Export the singleton instance
export const supabase = createClient()

// Ensure we only create one instance
if (typeof window !== 'undefined') {
  // @ts-ignore - Add to global for debugging
  window.__supabaseClient = supabase
} 