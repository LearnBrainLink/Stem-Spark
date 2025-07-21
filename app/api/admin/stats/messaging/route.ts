import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get messaging statistics
    const [
      { count: activeChannels },
      { count: totalMessages }
    ] = await Promise.all([
      supabase.from('chat_channels').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('chat_messages').select('*', { count: 'exact', head: true })
    ]);

    return NextResponse.json({
      success: true,
      activeChannels: activeChannels || 0,
      totalMessages: totalMessages || 0
    });
  } catch (error) {
    console.error('Error fetching messaging stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 