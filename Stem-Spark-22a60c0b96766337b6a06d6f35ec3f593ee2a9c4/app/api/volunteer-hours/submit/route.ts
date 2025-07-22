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
    const { internId, activityType, description, hours, date } = body

    if (!internId || !activityType || !description || !hours || !date) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Submit volunteer hours
    const { data, error } = await supabase
      .from('volunteer_hours')
      .insert({
        intern_id: internId,
        activity_type: activityType,
        description,
        hours: parseFloat(hours),
        date,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Error submitting volunteer hours:', error)
      return NextResponse.json({ error: 'Failed to submit volunteer hours' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error in submit volunteer hours:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 