import { NextRequest, NextResponse } from 'next/server';
import VolunteerHoursService from '@/lib/volunteer-hours-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hours_id, approved_by } = body;

    // Validate required fields
    if (!hours_id || !approved_by) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const volunteerHoursService = new VolunteerHoursService();
    const result = await volunteerHoursService.approveVolunteerHours(
      hours_id,
      approved_by
    );

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
    console.error('Error approving volunteer hours:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 