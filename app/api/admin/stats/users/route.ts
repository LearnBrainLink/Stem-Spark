import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get user counts by role
    const [
      { count: totalUsers },
      { count: students },
      { count: admins },
      { count: interns }
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).in('role', ['admin', 'super_admin']),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'intern')
    ]);

    return NextResponse.json({
      success: true,
      totalUsers: totalUsers || 0,
      students: students || 0,
      admins: admins || 0,
      interns: interns || 0
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 