import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createClient()
    
    const { data: applications, error } = await supabase
      .from('intern_applications')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching applications:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ applications: applications || [] })
  } catch (error) {
    console.error('Error in applications API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const { id, status, reviewed_by, rejection_reason, interview_notes } = body
    
    const updateData: any = {
      status,
      reviewed_by,
      reviewed_at: new Date().toISOString()
    }
    
    if (rejection_reason) {
      updateData.rejection_reason = rejection_reason
    }
    
    if (interview_notes) {
      updateData.interview_notes = interview_notes
    }
    
    const { data, error } = await supabase
      .from('intern_applications')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating application:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ application: data })
  } catch (error) {
    console.error('Error in application update:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
