import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import VolunteerHoursService from '@/lib/volunteer-hours-service';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const volunteerHoursService = new VolunteerHoursService();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the tutoring session
    const { data: session, error: sessionError } = await supabase
      .from('tutoring_sessions')
      .select('*')
      .eq('id', params.id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Check if user is authorized to complete this session
    if (session.tutor_id !== user.id && session.student_id !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to complete this session' },
        { status: 403 }
      );
    }

    // Update session status to completed
    const { error: updateError } = await supabase
      .from('tutoring_sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', params.id);

    if (updateError) {
      console.error('Error updating session:', updateError);
      return NextResponse.json(
        { error: 'Failed to complete session' },
        { status: 500 }
      );
    }

    // Automatically create volunteer hours for the tutor
    const hoursResult = await volunteerHoursService.createHoursFromTutoringSession({
      session_id: params.id,
      tutor_id: session.tutor_id,
      student_id: session.student_id,
      subject: session.subject,
      topic: session.topic,
      duration: session.duration,
      session_date: session.scheduled_date
    });

    if (!hoursResult.success) {
      console.error('Error creating volunteer hours:', hoursResult.error);
      // Don't fail the session completion if volunteer hours creation fails
    }

    return NextResponse.json({
      success: true,
      message: 'Session completed successfully',
      volunteerHours: hoursResult.success ? hoursResult.data : null
    });
  } catch (error) {
    console.error('Error completing session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 