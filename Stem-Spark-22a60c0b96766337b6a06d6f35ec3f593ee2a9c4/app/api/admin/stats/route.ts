import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    console.log('🔄 Fetching admin stats...')
    
    const supabase = createClient()

    // Get total users count
    const { count: totalUsers, error: usersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    if (usersError) {
      console.error('Error fetching users:', usersError)
      throw usersError
    }

    // Get users by role
    const { data: usersByRole, error: roleError } = await supabase
      .from('profiles')
      .select('role, created_at')

    if (roleError) {
      console.error('Error fetching user roles:', roleError)
      throw roleError
    }

    const roleDistribution = usersByRole?.reduce((acc: any, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1
      return acc
    }, {}) || {}

    // Calculate role-specific counts
    const studentCount = roleDistribution.student || 0
    const internCount = roleDistribution.intern || 0
    const adminCount = roleDistribution.admin || 0
    const parentCount = roleDistribution.parent || 0

    // Get total messages
    const { count: totalMessages, error: messagesError } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })

    if (messagesError) {
      console.error('Error fetching messages:', messagesError)
      throw messagesError
    }

    // Get total videos
    const { count: totalVideos, error: videosError } = await supabase
      .from('videos')
      .select('*', { count: 'exact', head: true })

    if (videosError) {
      console.error('Error fetching videos:', videosError)
      throw videosError
    }

    // Get total channels
    const { count: totalChannels, error: channelsError } = await supabase
      .from('channels')
      .select('*', { count: 'exact', head: true })

    if (channelsError) {
      console.error('Error fetching channels:', channelsError)
      throw channelsError
    }

    // Get total applications
    const { count: totalApplications, error: applicationsError } = await supabase
      .from('intern_applications')
      .select('*', { count: 'exact', head: true })

    if (applicationsError) {
      console.error('Error fetching applications:', applicationsError)
      throw applicationsError
    }

    // Get total volunteer hours
    const { count: totalVolunteerHours, error: volunteerError } = await supabase
      .from('volunteer_hours')
      .select('*', { count: 'exact', head: true })

    if (volunteerError) {
      console.error('Error fetching volunteer hours:', volunteerError)
      throw volunteerError
    }

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: recentUsers, error: recentUsersError } = await supabase
      .from('profiles')
      .select('created_at')
      .gte('created_at', sevenDaysAgo.toISOString())

    if (recentUsersError) {
      console.error('Error fetching recent users:', recentUsersError)
      throw recentUsersError
    }

    const { data: recentMessages, error: recentMessagesError } = await supabase
      .from('messages')
      .select('created_at')
      .gte('created_at', sevenDaysAgo.toISOString())

    if (recentMessagesError) {
      console.error('Error fetching recent messages:', recentMessagesError)
      throw recentMessagesError
    }

    // Calculate growth rates
    const newUsersThisWeek = recentUsers?.length || 0
    const newMessagesThisWeek = recentMessages?.length || 0

    // Get user activity data for charts
    const { data: userActivity, error: activityError } = await supabase
      .from('user_activities')
      .select('activity_type, created_at')
      .order('created_at', { ascending: false })
      .limit(50)

    if (activityError) {
      console.error('Error fetching user activities:', activityError)
      // Don't throw here, just use empty data
    }

    // Calculate activity distribution
    const activityDistribution = userActivity?.reduce((acc: any, activity) => {
      acc[activity.activity_type] = (acc[activity.activity_type] || 0) + 1
      return acc
    }, {}) || {}

    const stats = {
      overview: {
        totalUsers: totalUsers || 0,
        totalMessages: totalMessages || 0,
        totalVideos: totalVideos || 0,
        totalChannels: totalChannels || 0,
        totalApplications: totalApplications || 0,
        totalVolunteerHours: totalVolunteerHours || 0,
        newUsersThisWeek,
        newMessagesThisWeek
      },
      roleDistribution: {
        students: studentCount,
        interns: internCount,
        admins: adminCount,
        parents: parentCount
      },
      activityDistribution,
      recentActivity: {
        users: recentUsers?.length || 0,
        messages: recentMessages?.length || 0
      }
    }

    console.log('✅ Admin stats fetched successfully:', stats)
    return NextResponse.json(stats)
  } catch (error) {
    console.error('❌ Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin statistics' },
      { status: 500 }
    )
  }
} 