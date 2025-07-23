import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const createClient = () => {
  if (!supabaseServiceKey) {
    console.error("❌ Missing SUPABASE_SERVICE_ROLE_KEY - using anon key instead")
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey)
  }

  return createSupabaseClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
} 