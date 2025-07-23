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
      .select('role, created_at')

    const roleDistribution = usersByRole?.reduce((acc: any, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1
      return acc
    }, {}) || {}

    // Calculate role-specific counts
    const students = roleDistribution.student || 0
    const teachers = roleDistribution.teacher || 0
    const parents = roleDistribution.parent || 0
    const admins = roleDistribution.admin || 0
    const interns = roleDistribution.intern || 0

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

    const pendingApplications = applicationStatusDistribution.pending || 0
    const activeInternships = applicationStatusDistribution.approved || 0
    const totalInternships = totalApplications || 0

    // Get total volunteer hours
    const { data: volunteerHours } = await supabase
      .from('volunteer_hours')
      .select('hours, status')

    const totalHours = volunteerHours?.reduce((sum, record) => sum + (record.hours || 0), 0) || 0
    const approvedHours = volunteerHours?.filter(record => record.status === 'approved')
      .reduce((sum, record) => sum + (record.hours || 0), 0) || 0
    const pendingHours = volunteerHours?.filter(record => record.status === 'pending')
      .reduce((sum, record) => sum + (record.hours || 0), 0) || 0

    // Get total videos
    const { count: totalVideos } = await supabase
      .from('videos')
      .select('*', { count: 'exact', head: true })

    const { count: activeVideos } = await supabase
      .from('videos')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    // Get messaging stats
    const { count: totalMessages } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })

    const { count: totalChannels } = await supabase
      .from('chat_channels')
      .select('*', { count: 'exact', head: true })

    // Generate user growth chart data (last 6 months)
    const userGrowthChart = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = date.toLocaleString('default', { month: 'short' })
      
      const { count: monthlyUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', date.toISOString())
        .lt('created_at', new Date(date.getFullYear(), date.getMonth() + 1, 1).toISOString())
      
      userGrowthChart.push({
        month: monthName,
        users: monthlyUsers || 0
      })
    }

    // Generate user distribution data for pie chart
    const userDistributionData = [
      { name: 'Students', value: students, color: '#3B82F6' },
      { name: 'Parents', value: parents, color: '#10B981' },
      { name: 'Interns', value: interns, color: '#F59E0B' },
      { name: 'Admins', value: admins, color: '#8B5CF6' },
      { name: 'Teachers', value: teachers, color: '#EF4444' }
    ].filter(item => item.value > 0)

    // Generate volunteer hours chart data
    const volunteerHoursChart = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = date.toLocaleString('default', { month: 'short' })
      
      const { data: monthlyHours } = await supabase
        .from('volunteer_hours')
        .select('hours')
        .gte('created_at', date.toISOString())
        .lt('created_at', new Date(date.getFullYear(), date.getMonth() + 1, 1).toISOString())
      
      const totalMonthlyHours = monthlyHours?.reduce((sum, record) => sum + (record.hours || 0), 0) || 0
      
      volunteerHoursChart.push({
        month: monthName,
        hours: totalMonthlyHours
      })
    }

    // Generate activity trends chart data
    const activityTrendsChart = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = date.toLocaleString('default', { month: 'short' })
      
      const { count: monthlyMessages } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', date.toISOString())
        .lt('created_at', new Date(date.getFullYear(), date.getMonth() + 1, 1).toISOString())
      
      const { count: monthlyApplications } = await supabase
        .from('intern_applications')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', date.toISOString())
        .lt('created_at', new Date(date.getFullYear(), date.getMonth() + 1, 1).toISOString())
      
      activityTrendsChart.push({
        month: monthName,
        messages: monthlyMessages || 0,
        applications: monthlyApplications || 0
      })
    }

    // Mock revenue data (since we don't have actual revenue tracking)
    const totalRevenue = 0
    const thisMonthRevenue = 0

    // Recent activity (last 10 activities)
    const { data: recentActivity } = await supabase
      .from('profiles')
      .select('full_name, role, created_at')
      .order('created_at', { ascending: false })
      .limit(10)

    const stats = {
      totalUsers: totalUsers || 0,
      students,
      teachers,
      parents,
      admins,
      activeInternships,
      totalInternships,
      pendingApplications,
      totalApplications: totalApplications || 0,
      totalRevenue,
      thisMonthRevenue,
      totalVideos: totalVideos || 0,
      activeVideos: activeVideos || 0,
      totalVolunteerHours: totalHours,
      pendingHours,
      totalApprovedHours: approvedHours,
      recentActivity: recentActivity || [],
      userGrowthChart,
      userDistributionData,
      volunteerHoursChart,
      activityTrendsChart,
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