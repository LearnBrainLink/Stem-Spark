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

    // Fetch all interns who are available as tutors
    const { data: tutors, error } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        bio,
        subjects,
        hourly_rate,
        rating,
        total_sessions,
        availability,
        image_url,
        created_at
      `)
      .eq('role', 'intern')
      .eq('status', 'active')
      .order('rating', { ascending: false });

    if (error) {
      console.error('Error fetching tutors:', error);
      return NextResponse.json(
        { error: 'Failed to fetch tutors' },
        { status: 500 }
      );
    }

    // Transform the data to include default values
    const transformedTutors = tutors?.map(tutor => ({
      id: tutor.id,
      name: tutor.full_name || 'Unknown Tutor',
      subjects: tutor.subjects || ['General'],
      rating: tutor.rating || 0,
      total_sessions: tutor.total_sessions || 0,
      availability: tutor.availability || [],
      bio: tutor.bio || 'No bio available',
      hourly_rate: tutor.hourly_rate || 25,
      image_url: tutor.image_url
    })) || [];

    return NextResponse.json({
      success: true,
      tutors: transformedTutors
    });
  } catch (error) {
    console.error('Error in tutors API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 