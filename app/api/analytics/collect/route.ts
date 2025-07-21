import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    const body = await request.json();
    const { 
      event_type, 
      event_data, 
      page_url, 
      user_agent, 
      timestamp,
      session_id 
    } = body;

    // Validate required fields
    if (!event_type || !event_data) {
      return NextResponse.json(
        { error: 'Missing required fields: event_type and event_data' },
        { status: 400 }
      );
    }

    // Get user's consent status
    const { data: profile } = await supabase
      .from('profiles')
      .select('analytics_consent')
      .eq('id', user.id)
      .single();

    // Check if user has consented to analytics
    if (!profile?.analytics_consent) {
      return NextResponse.json(
        { error: 'Analytics consent required' },
        { status: 403 }
      );
    }

    // Store analytics event
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        user_id: user.id,
        event_type,
        event_data,
        page_url: page_url || null,
        user_agent: user_agent || null,
        timestamp: timestamp || new Date().toISOString(),
        session_id: session_id || null,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error storing analytics event:', error);
      return NextResponse.json(
        { error: 'Failed to store analytics event' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Analytics event recorded'
    });
  } catch (error) {
    console.error('Error in analytics collection:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    // Get user's profile to check admin status
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('time_range') || '7d';
    const eventType = searchParams.get('event_type');
    const limit = parseInt(searchParams.get('limit') || '100');

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '1d':
        startDate.setDate(now.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Build query
    let query = supabase
      .from('analytics_events')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(limit);

    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    const { data: events, error } = await query;

    if (error) {
      console.error('Error fetching analytics events:', error);
      return NextResponse.json(
        { error: 'Failed to fetch analytics events' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      events: events || [],
      time_range: timeRange,
      total_count: events?.length || 0
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 