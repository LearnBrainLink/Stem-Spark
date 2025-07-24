import { createBrowserClient } from '@supabase/ssr'

// Global variable to ensure singleton
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (!supabaseClient) {
    supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
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