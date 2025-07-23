import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { Database } from "@/lib/database.types"

export const createServerClient = async (cookieStore?: ReturnType<typeof cookies>) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  const resolvedCookieStore = cookieStore || await cookies()

  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  })
} 