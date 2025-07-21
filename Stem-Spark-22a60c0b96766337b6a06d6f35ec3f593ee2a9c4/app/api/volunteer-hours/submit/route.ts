import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

import { volunteerHoursService } from '@/lib/volunteer-hours-service'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Only interns can submit volunteer hours
    if (profile.role !== 'intern') {
      return NextResponse.json({ error: 'Only interns can submit volunteer hours' }, { status: 403 })
    }

    const body = await request.json()
    const { activity_type, description, hours, date } = body

    // Validate required fields
    if (!activity_type || !description || !hours || !date) {
      return NextResponse.json({ 
        error: 'Activity type, description, hours, and date are required' 
      }, { status: 400 })
    }

    // Validate activity type
    const validActivityTypes = ['tutoring', 'mentoring', 'event_assistance', 'other']
    if (!validActivityTypes.includes(activity_type)) {
      return NextResponse.json({ error: 'Invalid activity type' }, { status: 400 })
    }

    // Validate hours
    if (typeof hours !== 'number' || hours <= 0 || hours > 24) {
      return NextResponse.json({ error: 'Hours must be a number between 0 and 24' }, { status: 400 })
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(date)) {
      return NextResponse.json({ error: 'Date must be in YYYY-MM-DD format' }, { status: 400 })
    }

    // Validate date is not in the future
    const submissionDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (submissionDate > today) {
      return NextResponse.json({ error: 'Cannot submit hours for future dates' }, { status: 400 })
    }

    // Submit volunteer hours
    const result = await volunteerHoursService.submitVolunteerHours({
      intern_id: user.id,
      activity_type,
      description: description.trim(),
      hours,
      date
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      hours: result.hours,
      message: 'Volunteer hours submitted successfully and pending approval'
    })
  } catch (error) {
    console.error('Error submitting volunteer hours:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 