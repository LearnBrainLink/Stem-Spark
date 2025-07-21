import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { emailService } from '@/lib/email-service-integration'

export async function GET(request: NextRequest) {
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
      .select('role, is_super_admin')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Only admins can view applications
    if (profile.role !== 'admin' && !profile.is_super_admin) {
      return NextResponse.json({ error: 'Only admins can view applications' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabase
      .from('intern_applications')
      .select('*')
      .order('submitted_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    const { data: applications, error } = await query

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
    }

    return NextResponse.json({ applications: applications || [] })
  } catch (error) {
    console.error('Error getting applications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      applicant_email,
      full_name,
      phone_number,
      date_of_birth,
      education_level,
      school_institution,
      areas_of_interest,
      previous_experience,
      availability,
      motivation_statement,
      references
    } = body

    // Validate required fields
    const requiredFields = [
      'applicant_email', 'full_name', 'date_of_birth', 'education_level',
      'school_institution', 'areas_of_interest', 'availability', 'motivation_statement'
    ]

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 })
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(applicant_email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Validate date of birth
    const dob = new Date(date_of_birth)
    const today = new Date()
    const age = today.getFullYear() - dob.getFullYear()
    if (age < 14 || age > 100) {
      return NextResponse.json({ error: 'Invalid date of birth' }, { status: 400 })
    }

    // Validate areas of interest
    if (!Array.isArray(areas_of_interest) || areas_of_interest.length === 0) {
      return NextResponse.json({ error: 'At least one area of interest is required' }, { status: 400 })
    }

    // Validate availability
    if (!availability.days_per_week || !availability.hours_per_week || !availability.preferred_schedule) {
      return NextResponse.json({ error: 'Availability details are required' }, { status: 400 })
    }

    // Check if application already exists for this email
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data: existingApplication } = await supabase
      .from('intern_applications')
      .select('id')
      .eq('applicant_email', applicant_email)
      .single()

    if (existingApplication) {
      return NextResponse.json({ error: 'An application with this email already exists' }, { status: 400 })
    }

    // Create application
    const { data: application, error } = await supabase
      .from('intern_applications')
      .insert({
        applicant_email,
        full_name: full_name.trim(),
        phone_number: phone_number?.trim(),
        date_of_birth,
        education_level,
        school_institution: school_institution.trim(),
        areas_of_interest,
        previous_experience: previous_experience?.trim(),
        availability,
        motivation_statement: motivation_statement.trim(),
        references: references || null,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 })
    }

    // Send confirmation email
    await emailService.sendCustomEmail(
      applicant_email,
      'Application Received - Novakinetix Academy',
      `
      <h2>Thank you for your application!</h2>
      <p>Dear ${full_name},</p>
      <p>We have received your internship application for Novakinetix Academy. We will review your application and get back to you within 5-7 business days.</p>
      <p>Application Reference: ${application.id}</p>
      <p>Best regards,<br>The Novakinetix Academy Team</p>
      `,
      { full_name, application_id: application.id }
    )

    return NextResponse.json({ 
      success: true, 
      application,
      message: 'Application submitted successfully'
    })
  } catch (error) {
    console.error('Error submitting application:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 