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
    const timeRange = searchParams.get('time_range') || '30d';

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
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
        startDate.setDate(now.getDate() - 30);
    }

    // Fetch comprehensive analytics data
    const [
      { count: totalUsers },
      { count: newUsers },
      { count: activeUsers },
      { count: totalVolunteerHours },
      { count: pendingVolunteerHours },
      { count: totalTutoringSessions },
      { count: completedTutoringSessions },
      { count: totalMessages },
      { count: activeChannels },
      { data: userGrowthData },
      { data: volunteerHoursData },
      { data: messagingData },
      { data: topEvents }
    ] = await Promise.all([
      // User statistics
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', startDate.toISOString()),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      
      // Volunteer hours statistics
      supabase.from('volunteer_hours').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      supabase.from('volunteer_hours').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      
      // Tutoring sessions statistics
      supabase.from('tutoring_sessions').select('*', { count: 'exact', head: true }),
      supabase.from('tutoring_sessions').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
      
      // Messaging statistics
      supabase.from('chat_messages').select('*', { count: 'exact', head: true }),
      supabase.from('chat_channels').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      
      // User growth over time
      supabase.from('profiles')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true }),
      
      // Volunteer hours over time
      supabase.from('volunteer_hours')
        .select('created_at, hours')
        .eq('status', 'approved')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true }),
      
      // Messaging activity over time
      supabase.from('chat_messages')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true }),
      
      // Top analytics events
      supabase.from('analytics_events')
        .select('event_type, count')
        .gte('created_at', startDate.toISOString())
        .order('count', { ascending: false })
        .limit(10)
    ]);

    // Process user growth data
    const userGrowth = processTimeSeriesData(userGrowthData, 'created_at', timeRange);
    
    // Process volunteer hours data
    const volunteerHours = processTimeSeriesData(volunteerHoursData, 'created_at', timeRange, 'hours');
    
    // Process messaging data
    const messaging = processTimeSeriesData(messagingData, 'created_at', timeRange);

    // Calculate engagement metrics
    const engagementMetrics = {
      user_retention_rate: calculateRetentionRate(userGrowthData, timeRange),
      avg_session_duration: calculateAvgSessionDuration(volunteerHoursData),
      message_engagement: calculateMessageEngagement(messagingData, totalUsers),
      volunteer_participation_rate: calculateVolunteerParticipation(volunteerHoursData, totalUsers)
    };

    // Calculate conversion rates
    const conversionRates = {
      volunteer_hours_approval_rate: totalVolunteerHours / (totalVolunteerHours + pendingVolunteerHours) * 100,
      tutoring_completion_rate: completedTutoringSessions / totalTutoringSessions * 100,
      user_activation_rate: activeUsers / totalUsers * 100
    };

    return NextResponse.json({
      success: true,
      analytics: {
        overview: {
          total_users: totalUsers || 0,
          new_users: newUsers || 0,
          active_users: activeUsers || 0,
          total_volunteer_hours: totalVolunteerHours || 0,
          pending_volunteer_hours: pendingVolunteerHours || 0,
          total_tutoring_sessions: totalTutoringSessions || 0,
          completed_tutoring_sessions: completedTutoringSessions || 0,
          total_messages: totalMessages || 0,
          active_channels: activeChannels || 0
        },
        trends: {
          user_growth: userGrowth,
          volunteer_hours: volunteerHours,
          messaging_activity: messaging
        },
        engagement: engagementMetrics,
        conversions: conversionRates,
        top_events: topEvents || [],
        time_range: timeRange
      }
    });
  } catch (error) {
    console.error('Error fetching analytics dashboard:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions for data processing
function processTimeSeriesData(data: any[], dateField: string, timeRange: string, valueField?: string) {
  if (!data || data.length === 0) return [];

  const grouped = data.reduce((acc, item) => {
    const date = new Date(item[dateField]).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = {
        date,
        count: 0,
        value: 0
      };
    }
    acc[date].count++;
    if (valueField) {
      acc[date].value += parseFloat(item[valueField] || 0);
    }
    return acc;
  }, {});

  return Object.values(grouped).sort((a: any, b: any) => a.date.localeCompare(b.date));
}

function calculateRetentionRate(userData: any[], timeRange: string) {
  if (!userData || userData.length === 0) return 0;
  
  const totalUsers = userData.length;
  const activeUsers = userData.filter(user => {
    const userDate = new Date(user.created_at);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7); // Active in last 7 days
    return userDate > cutoffDate;
  }).length;
  
  return (activeUsers / totalUsers) * 100;
}

function calculateAvgSessionDuration(volunteerData: any[]) {
  if (!volunteerData || volunteerData.length === 0) return 0;
  
  const totalHours = volunteerData.reduce((sum, item) => sum + parseFloat(item.hours || 0), 0);
  return totalHours / volunteerData.length;
}

function calculateMessageEngagement(messageData: any[], totalUsers: number) {
  if (!messageData || totalUsers === 0) return 0;
  
  const uniqueUsers = new Set(messageData.map(msg => msg.user_id)).size;
  return (uniqueUsers / totalUsers) * 100;
}

function calculateVolunteerParticipation(volunteerData: any[], totalUsers: number) {
  if (!volunteerData || totalUsers === 0) return 0;
  
  const uniqueVolunteers = new Set(volunteerData.map(hours => hours.user_id)).size;
  return (uniqueVolunteers / totalUsers) * 100;
} 