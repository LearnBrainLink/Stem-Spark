import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get video statistics
    const [
      { count: totalVideos },
      { count: activeVideos }
    ] = await Promise.all([
      supabase.from('videos').select('*', { count: 'exact', head: true }),
      supabase.from('videos').select('*', { count: 'exact', head: true }).eq('status', 'active')
    ]);

    return NextResponse.json({
      success: true,
      totalVideos: totalVideos || 0,
      activeVideos: activeVideos || 0
    });
  } catch (error) {
    console.error('Error fetching video stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 