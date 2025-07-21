import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { volunteerHoursService } from '@/lib/volunteer-hours-service'
import { adminProtectionService } from '@/lib/admin-protection'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user can approve volunteer hours
    const { success: canApprove, allowed } = await adminProtectionService.canPerformAdminAction(
      user.id,
      'approve_hours'
    )

    if (!canApprove || !allowed) {
      return NextResponse.json({ error: 'You do not have permission to approve volunteer hours' }, { status: 403 })
    }

    const body = await request.json()
    const { hours_id, approved, rejection_reason } = body

    // Validate required fields
    if (!hours_id || typeof approved !== 'boolean') {
      return NextResponse.json({ error: 'Hours ID and approval status are required' }, { status: 400 })
    }

    // Validate rejection reason if rejecting
    if (!approved && !rejection_reason) {
      return NextResponse.json({ error: 'Rejection reason is required when rejecting hours' }, { status: 400 })
    }

    // Review volunteer hours
    const result = await volunteerHoursService.reviewVolunteerHours({
      hours_id,
      approved_by: user.id,
      approved,
      rejection_reason: rejection_reason?.trim()
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      message: approved ? 'Volunteer hours approved successfully' : 'Volunteer hours rejected successfully'
    })
  } catch (error) {
    console.error('Error reviewing volunteer hours:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 