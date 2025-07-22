import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Get total users count
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    // Get users by role
    const { data: usersByRole } = await supabase
      .from('profiles')
      .select('role')

    const roleDistribution = usersByRole?.reduce((acc: any, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1
      return acc
    }, {}) || {}

    // Get total applications
    const { count: totalApplications } = await supabase
      .from('intern_applications')
      .select('*', { count: 'exact', head: true })

    // Get applications by status
    const { data: applicationsByStatus } = await supabase
      .from('intern_applications')
      .select('status')

    const applicationStatusDistribution = applicationsByStatus?.reduce((acc: any, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1
      return acc
    }, {}) || {}

    // Get total volunteer hours
    const { data: volunteerHours } = await supabase
      .from('volunteer_hours')
      .select('hours, status')

    const totalHours = volunteerHours?.reduce((sum, record) => sum + (record.hours || 0), 0) || 0
    const approvedHours = volunteerHours?.filter(record => record.status === 'approved')
      .reduce((sum, record) => sum + (record.hours || 0), 0) || 0

    // Get total videos
    const { count: totalVideos } = await supabase
      .from('videos')
      .select('*', { count: 'exact', head: true })

    // Get messaging stats
    const { count: totalMessages } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })

    const { count: totalChannels } = await supabase
      .from('chat_channels')
      .select('*', { count: 'exact', head: true })

    const stats = {
      totalUsers: totalUsers || 0,
      roleDistribution,
      totalApplications: totalApplications || 0,
      applicationStatusDistribution,
      totalVolunteerHours: totalHours,
      approvedVolunteerHours: approvedHours,
      totalVideos: totalVideos || 0,
      totalMessages: totalMessages || 0,
      totalChannels: totalChannels || 0
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin statistics' },
      { status: 500 }
    )
  }
} 