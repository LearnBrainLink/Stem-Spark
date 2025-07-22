import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const body = await request.json()
    const { hoursId, approvedBy } = body

    if (!hoursId || !approvedBy) {
      return NextResponse.json({ error: 'Hours ID and approved by are required' }, { status: 400 })
    }

    // Update volunteer hours status
    const { data, error } = await supabase
      .from('volunteer_hours')
      .update({
        status: 'approved',
        approved_by: approvedBy,
        approved_at: new Date().toISOString()
      })
      .eq('id', hoursId)
      .select()
      .single()

    if (error) {
      console.error('Error approving volunteer hours:', error)
      return NextResponse.json({ error: 'Failed to approve volunteer hours' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error in approve volunteer hours:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 