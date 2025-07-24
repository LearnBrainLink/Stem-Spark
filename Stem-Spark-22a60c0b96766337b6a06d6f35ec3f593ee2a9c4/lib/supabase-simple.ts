import { supabase } from "./supabase/client"

export { supabase }

// This is a simplified server client for use in scripts and other non-Next.js environments
export const createSimpleServerClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase URL or service role key.')
  }

  return require('@supabase/supabase-js').createClient(supabaseUrl, supabaseKey)
}
