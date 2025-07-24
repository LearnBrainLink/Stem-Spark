import { createBrowserClient } from '@supabase/ssr'

// Create a single instance that persists across the entire application
const supabaseClient = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export function createClient() {
  return supabaseClient
}

// Export the singleton instance for direct imports
export const supabase = supabaseClient 