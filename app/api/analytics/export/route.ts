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
    const exportType = searchParams.get('type') || 'comprehensive';
    const timeRange = searchParams.get('time_range') || '30d';
    const format = searchParams.get('format') || 'json';

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

    let exportData: any = {};

    switch (exportType) {
      case 'user_analytics':
        exportData = await exportUserAnalytics(supabase, startDate);
        break;
      case 'volunteer_hours':
        exportData = await exportVolunteerHours(supabase, startDate);
        break;
      case 'tutoring_sessions':
        exportData = await exportTutoringSessions(supabase, startDate);
        break;
      case 'messaging_analytics':
        exportData = await exportMessagingAnalytics(supabase, startDate);
        break;
      case 'comprehensive':
      default:
        exportData = await exportComprehensiveData(supabase, startDate);
        break;
    }

    // Add metadata
    exportData.metadata = {
      export_type: exportType,
      time_range: timeRange,
      generated_at: new Date().toISOString(),
      generated_by: user.id
    };

    if (format === 'csv') {
      return generateCSVResponse(exportData, exportType);
    }

    return NextResponse.json({
      success: true,
      data: exportData
    });
  } catch (error) {
    console.error('Error exporting analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function exportUserAnalytics(supabase: any, startDate: Date) {
  const [
    { data: users },
    { data: userGrowth },
    { data: userActivity }
  ] = await Promise.all([
    supabase.from('profiles').select('*').gte('created_at', startDate.toISOString()),
    supabase.from('profiles').select('created_at, role, status').gte('created_at', startDate.toISOString()),
    supabase.from('analytics_events').select('*').gte('created_at', startDate.toISOString())
  ]);

  return {
    users: users || [],
    user_growth: userGrowth || [],
    user_activity: userActivity || [],
    summary: {
      total_users: users?.length || 0,
      new_users: users?.filter(u => new Date(u.created_at) > startDate).length || 0,
      active_users: users?.filter(u => u.status === 'active').length || 0
    }
  };
}

async function exportVolunteerHours(supabase: any, startDate: Date) {
  const [
    { data: volunteerHours },
    { data: approvedHours },
    { data: pendingHours }
  ] = await Promise.all([
    supabase.from('volunteer_hours').select('*').gte('created_at', startDate.toISOString()),
    supabase.from('volunteer_hours').select('*').eq('status', 'approved').gte('created_at', startDate.toISOString()),
    supabase.from('volunteer_hours').select('*').eq('status', 'pending').gte('created_at', startDate.toISOString())
  ]);

  const totalHours = approvedHours?.reduce((sum, hours) => sum + parseFloat(hours.hours || 0), 0) || 0;

  return {
    volunteer_hours: volunteerHours || [],
    approved_hours: approvedHours || [],
    pending_hours: pendingHours || [],
    summary: {
      total_submissions: volunteerHours?.length || 0,
      approved_submissions: approvedHours?.length || 0,
      pending_submissions: pendingHours?.length || 0,
      total_hours: totalHours,
      approval_rate: approvedHours?.length / volunteerHours?.length * 100 || 0
    }
  };
}

async function exportTutoringSessions(supabase: any, startDate: Date) {
  const [
    { data: sessions },
    { data: completedSessions },
    { data: scheduledSessions }
  ] = await Promise.all([
    supabase.from('tutoring_sessions').select('*').gte('created_at', startDate.toISOString()),
    supabase.from('tutoring_sessions').select('*').eq('status', 'completed').gte('created_at', startDate.toISOString()),
    supabase.from('tutoring_sessions').select('*').eq('status', 'scheduled').gte('created_at', startDate.toISOString())
  ]);

  return {
    tutoring_sessions: sessions || [],
    completed_sessions: completedSessions || [],
    scheduled_sessions: scheduledSessions || [],
    summary: {
      total_sessions: sessions?.length || 0,
      completed_sessions: completedSessions?.length || 0,
      scheduled_sessions: scheduledSessions?.length || 0,
      completion_rate: completedSessions?.length / sessions?.length * 100 || 0
    }
  };
}

async function exportMessagingAnalytics(supabase: any, startDate: Date) {
  const [
    { data: messages },
    { data: channels },
    { data: channelMembers }
  ] = await Promise.all([
    supabase.from('chat_messages').select('*').gte('created_at', startDate.toISOString()),
    supabase.from('chat_channels').select('*').gte('created_at', startDate.toISOString()),
    supabase.from('chat_channel_members').select('*').gte('created_at', startDate.toISOString())
  ]);

  return {
    messages: messages || [],
    channels: channels || [],
    channel_members: channelMembers || [],
    summary: {
      total_messages: messages?.length || 0,
      total_channels: channels?.length || 0,
      total_members: channelMembers?.length || 0,
      avg_messages_per_channel: messages?.length / channels?.length || 0
    }
  };
}

async function exportComprehensiveData(supabase: any, startDate: Date) {
  const [
    userAnalytics,
    volunteerHours,
    tutoringSessions,
    messagingAnalytics
  ] = await Promise.all([
    exportUserAnalytics(supabase, startDate),
    exportVolunteerHours(supabase, startDate),
    exportTutoringSessions(supabase, startDate),
    exportMessagingAnalytics(supabase, startDate)
  ]);

  return {
    user_analytics: userAnalytics,
    volunteer_hours: volunteerHours,
    tutoring_sessions: tutoringSessions,
    messaging_analytics: messagingAnalytics,
    platform_summary: {
      total_users: userAnalytics.summary.total_users,
      total_volunteer_hours: volunteerHours.summary.total_hours,
      total_tutoring_sessions: tutoringSessions.summary.total_sessions,
      total_messages: messagingAnalytics.summary.total_messages,
      platform_engagement_score: calculateEngagementScore(userAnalytics, volunteerHours, tutoringSessions, messagingAnalytics)
    }
  };
}

function calculateEngagementScore(userAnalytics: any, volunteerHours: any, tutoringSessions: any, messagingAnalytics: any) {
  const userEngagement = userAnalytics.summary.active_users / userAnalytics.summary.total_users * 100;
  const volunteerEngagement = volunteerHours.summary.approval_rate;
  const tutoringEngagement = tutoringSessions.summary.completion_rate;
  const messagingEngagement = messagingAnalytics.summary.avg_messages_per_channel > 0 ? 100 : 0;

  return (userEngagement + volunteerEngagement + tutoringEngagement + messagingEngagement) / 4;
}

function generateCSVResponse(data: any, exportType: string) {
  let csvContent = '';
  
  switch (exportType) {
    case 'user_analytics':
      csvContent = generateUserAnalyticsCSV(data);
      break;
    case 'volunteer_hours':
      csvContent = generateVolunteerHoursCSV(data);
      break;
    case 'tutoring_sessions':
      csvContent = generateTutoringSessionsCSV(data);
      break;
    case 'messaging_analytics':
      csvContent = generateMessagingAnalyticsCSV(data);
      break;
    default:
      csvContent = generateComprehensiveCSV(data);
  }

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${exportType}_${new Date().toISOString().split('T')[0]}.csv"`
    }
  });
}

function generateUserAnalyticsCSV(data: any) {
  let csv = 'User ID,Email,Full Name,Role,Status,Created At\n';
  data.users?.forEach((user: any) => {
    csv += `${user.id},${user.email},${user.full_name},${user.role},${user.status},${user.created_at}\n`;
  });
  return csv;
}

function generateVolunteerHoursCSV(data: any) {
  let csv = 'ID,User ID,Activity Type,Activity Date,Hours,Status,Created At\n';
  data.volunteer_hours?.forEach((hours: any) => {
    csv += `${hours.id},${hours.user_id},${hours.activity_type},${hours.activity_date},${hours.hours},${hours.status},${hours.created_at}\n`;
  });
  return csv;
}

function generateTutoringSessionsCSV(data: any) {
  let csv = 'ID,Tutor ID,Student ID,Subject,Topic,Scheduled Date,Status,Created At\n';
  data.tutoring_sessions?.forEach((session: any) => {
    csv += `${session.id},${session.tutor_id},${session.student_id},${session.subject},${session.topic},${session.scheduled_date},${session.status},${session.created_at}\n`;
  });
  return csv;
}

function generateMessagingAnalyticsCSV(data: any) {
  let csv = 'Message ID,Channel ID,Sender ID,Content,Created At\n';
  data.messages?.forEach((message: any) => {
    csv += `${message.id},${message.channel_id},${message.sender_id},${message.content},${message.created_at}\n`;
  });
  return csv;
}

function generateComprehensiveCSV(data: any) {
  let csv = 'Metric,Value\n';
  csv += `Total Users,${data.platform_summary.total_users}\n`;
  csv += `Total Volunteer Hours,${data.platform_summary.total_volunteer_hours}\n`;
  csv += `Total Tutoring Sessions,${data.platform_summary.total_tutoring_sessions}\n`;
  csv += `Total Messages,${data.platform_summary.total_messages}\n`;
  csv += `Platform Engagement Score,${data.platform_summary.platform_engagement_score}\n`;
  return csv;
} 