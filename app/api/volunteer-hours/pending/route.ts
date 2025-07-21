import { NextRequest, NextResponse } from 'next/server';
import VolunteerHoursService from '@/lib/volunteer-hours-service';

export async function GET(request: NextRequest) {
  try {
    const volunteerHoursService = new VolunteerHoursService();
    const result = await volunteerHoursService.getPendingVolunteerHours();

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
    console.error('Error fetching pending volunteer hours:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 