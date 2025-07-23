import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    console.log('Testing service role key...')
    console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Not set')
    console.log('Service Key:', supabaseServiceKey ? 'Set' : 'Not set')
    
    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
    
    // Test basic connection
    const { data, error } = await supabase
      .from('chat_channels')
      .select('id, name')
      .limit(5)

    if (error) {
      console.error('Service role test error:', error)
      return NextResponse.json({ 
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Service role key working',
      data,
      count: data?.length || 0
    })
  } catch (error) {
    console.error('Service role test exception:', error)
    return NextResponse.json({ 
      error: 'Service role test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 