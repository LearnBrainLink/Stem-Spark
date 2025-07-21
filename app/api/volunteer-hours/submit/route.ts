import { NextRequest, NextResponse } from 'next/server';
import VolunteerHoursService from '@/lib/volunteer-hours-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { intern_id, activity_date, activity_type, activity_description, hours, description, reference_id } = body;

    // Validate required fields
    if (!intern_id || !activity_date || !activity_type || !activity_description || !hours) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const volunteerHoursService = new VolunteerHoursService();
    const result = await volunteerHoursService.submitVolunteerHours({
      intern_id,
      activity_date,
      activity_type,
      activity_description,
      hours,
      description,
      reference_id
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Error submitting volunteer hours:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 