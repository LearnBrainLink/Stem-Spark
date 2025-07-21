import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get application statistics
    const [
      { count: pendingApplications },
      { count: totalApplications },
      { count: activeInternships },
      { count: totalInternships }
    ] = await Promise.all([
      supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('applications').select('*', { count: 'exact', head: true }),
      supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      supabase.from('applications').select('*', { count: 'exact', head: true })
    ]);

    return NextResponse.json({
      success: true,
      pendingApplications: pendingApplications || 0,
      totalApplications: totalApplications || 0,
      activeInternships: activeInternships || 0,
      totalInternships: totalInternships || 0,
      totalRevenue: 0, // Placeholder for future revenue tracking
      thisMonthRevenue: 0 // Placeholder for future revenue tracking
    });
  } catch (error) {
    console.error('Error fetching application stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 