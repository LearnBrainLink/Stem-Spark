import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's profile to determine role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Fetch sessions based on user role
    let sessionsQuery;
    if (profile.role === 'intern') {
      // Interns can see sessions where they are the tutor
      sessionsQuery = supabase
        .from('tutoring_sessions')
        .select(`
          *,
          tutor:profiles!tutoring_sessions_tutor_id_fkey(full_name),
          student:profiles!tutoring_sessions_student_id_fkey(full_name)
        `)
        .eq('tutor_id', user.id);
    } else {
      // Students can see sessions where they are the student
      sessionsQuery = supabase
        .from('tutoring_sessions')
        .select(`
          *,
          tutor:profiles!tutoring_sessions_tutor_id_fkey(full_name),
          student:profiles!tutoring_sessions_student_id_fkey(full_name)
        `)
        .eq('student_id', user.id);
    }

    const { data: sessions, error } = await sessionsQuery.order('scheduled_date', { ascending: true });

    if (error) {
      console.error('Error fetching sessions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch sessions' },
        { status: 500 }
      );
    }

    // Transform the data to include tutor and student names
    const transformedSessions = sessions?.map(session => ({
      ...session,
      tutor_name: session.tutor?.full_name || 'Unknown Tutor',
      student_name: session.student?.full_name || 'Unknown Student'
    })) || [];

    return NextResponse.json({
      success: true,
      sessions: transformedSessions
    });
  } catch (error) {
    console.error('Error in sessions API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's profile to ensure they can book sessions
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can book tutoring sessions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { tutor_id, subject, topic, scheduled_date, scheduled_time, duration, notes } = body;

    // Validate required fields
    if (!tutor_id || !subject || !topic || !scheduled_date || !scheduled_time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if tutor exists and is available
    const { data: tutor } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', tutor_id)
      .eq('role', 'intern')
      .single();

    if (!tutor) {
      return NextResponse.json(
        { error: 'Tutor not found or not available' },
        { status: 404 }
      );
    }

    // Create the tutoring session
    const { data: session, error } = await supabase
      .from('tutoring_sessions')
      .insert({
        tutor_id,
        student_id: user.id,
        subject,
        topic,
        scheduled_date,
        scheduled_time,
        duration: duration || 60,
        notes,
        status: 'scheduled',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating session:', error);
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      session
    });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 