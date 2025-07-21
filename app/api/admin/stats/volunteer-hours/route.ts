import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get volunteer hours statistics
    const [
      { count: pendingHours },
      { count: totalHours },
      { data: hoursData }
    ] = await Promise.all([
      supabase.from('volunteer_hours').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('volunteer_hours').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      supabase.from('volunteer_hours').select('hours').eq('status', 'approved')
    ]);

    // Calculate total approved hours
    const totalApprovedHours = hoursData?.reduce((sum, record) => sum + (record.hours || 0), 0) || 0;

    return NextResponse.json({
      success: true,
      pendingHours: pendingHours || 0,
      totalHours: totalHours || 0,
      totalApprovedHours: totalApprovedHours
    });
  } catch (error) {
    console.error('Error fetching volunteer hours stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 