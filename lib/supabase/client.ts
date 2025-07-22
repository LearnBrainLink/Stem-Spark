import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const createClient = () => {
  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey)
} 