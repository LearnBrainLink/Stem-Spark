import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    // Get user statistics
    const { data: userStats } = await supabase
      .from('profiles')
      .select('role')

    const totalUsers = userStats?.length || 0
    const students = userStats?.filter(u => u.role === 'student').length || 0
    const admins = userStats?.filter(u => u.role === 'admin').length || 0
    const parents = userStats?.filter(u => u.role === 'parent').length || 0
    const interns = userStats?.filter(u => u.role === 'intern').length || 0

    // Get internship statistics
    const { data: internshipStats } = await supabase
      .from('internships')
      .select('status')

    const totalInternships = internshipStats?.length || 0
    const activeInternships = internshipStats?.filter(i => i.status === 'active').length || 0

    // Get application statistics
    const { data: applicationStats } = await supabase
      .from('intern_applications')
      .select('status')

    const totalApplications = applicationStats?.length || 0
    const pendingApplications = applicationStats?.filter(a => a.status === 'pending').length || 0

    // Get video statistics
    const { data: videoStats } = await supabase
      .from('videos')
      .select('status')

    const totalVideos = videoStats?.length || 0
    const activeVideos = videoStats?.filter(v => v.status === 'active').length || 0

    // Get donation statistics
    const { data: donationStats } = await supabase
      .from('donations')
      .select('amount, created_at, status')
      .eq('status', 'completed')

    const totalDonations = donationStats?.length || 0
    const totalRevenue = donationStats?.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0) || 0
    
    // Calculate this month's revenue
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const thisMonthRevenue = donationStats?.filter(d => new Date(d.created_at) >= thirtyDaysAgo)
      .reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0) || 0

    // Get volunteer hours statistics
    const { data: volunteerStats } = await supabase
      .from('volunteer_hours')
      .select('hours, status')

    const totalVolunteerHours = volunteerStats?.length || 0
    const pendingHours = volunteerStats?.filter(v => v.status === 'pending').length || 0
    const totalApprovedHours = volunteerStats?.filter(v => v.status === 'approved')
      .reduce((sum, v) => sum + (parseFloat(v.hours) || 0), 0) || 0

    // Get recent activity
    const { data: recentActivity } = await supabase
      .from('user_activities')
      .select('activity_type, activity_description, created_at')
      .order('created_at', { ascending: false })
      .limit(5)

    const recentActivityFormatted = recentActivity?.map(activity => ({
      title: `${activity.activity_type} activity`,
      description: activity.activity_description || `User performed ${activity.activity_type}`,
      time: new Date(activity.created_at).toLocaleString()
    })) || []

    // Get user growth data (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    
    const { data: userGrowthData } = await supabase
      .from('profiles')
      .select('created_at, role')
      .gte('created_at', sixMonthsAgo.toISOString())
      .order('created_at', { ascending: true })

    // Process user growth data by month
    const userGrowthByMonth: { [key: string]: { users: number; interns: number; applications: number } } = {}
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthKey = monthNames[date.getMonth()]
      userGrowthByMonth[monthKey] = { users: 0, interns: 0, applications: 0 }
    }

    // Count users by month
    userGrowthData?.forEach(user => {
      const date = new Date(user.created_at)
      const monthKey = monthNames[date.getMonth()]
      if (userGrowthByMonth[monthKey]) {
        userGrowthByMonth[monthKey].users++
        if (user.role === 'intern') {
          userGrowthByMonth[monthKey].interns++
        }
      }
    })

    // Get application data by month
    const { data: applicationData } = await supabase
      .from('intern_applications')
      .select('created_at')
      .gte('created_at', sixMonthsAgo.toISOString())

    applicationData?.forEach(app => {
      const date = new Date(app.created_at)
      const monthKey = monthNames[date.getMonth()]
      if (userGrowthByMonth[monthKey]) {
        userGrowthByMonth[monthKey].applications++
      }
    })

    // Convert to chart format
    const userGrowthChart = Object.entries(userGrowthByMonth).map(([name, data]) => ({
      name,
      users: data.users,
      interns: data.interns,
      applications: data.applications
    }))

    // Create user distribution pie chart data
    const userDistributionData = [
      { name: 'Students', value: students, color: '#3B82F6' },
      { name: 'Admins', value: admins, color: '#10B981' },
      { name: 'Parents', value: parents, color: '#F59E0B' },
      { name: 'Interns', value: interns, color: '#8B5CF6' }
    ].filter(item => item.value > 0) // Only show categories with data

    // Get volunteer hours trends (last 6 months)
    const { data: volunteerTrendsData } = await supabase
      .from('volunteer_hours')
      .select('hours, status, created_at')
      .gte('created_at', sixMonthsAgo.toISOString())
      .order('created_at', { ascending: true })

    // Process volunteer hours by month
    const volunteerHoursByMonth: { [key: string]: { approved: number; pending: number; total: number } } = {}
    
    // Initialize last 6 months for volunteer hours
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthKey = monthNames[date.getMonth()]
      volunteerHoursByMonth[monthKey] = { approved: 0, pending: 0, total: 0 }
    }

    // Count volunteer hours by month and status
    volunteerTrendsData?.forEach(record => {
      const date = new Date(record.created_at)
      const monthKey = monthNames[date.getMonth()]
      if (volunteerHoursByMonth[monthKey]) {
        volunteerHoursByMonth[monthKey].total += parseFloat(record.hours) || 0
        if (record.status === 'approved') {
          volunteerHoursByMonth[monthKey].approved += parseFloat(record.hours) || 0
        } else if (record.status === 'pending') {
          volunteerHoursByMonth[monthKey].pending += parseFloat(record.hours) || 0
        }
      }
    })

    // Convert to chart format
    const volunteerHoursChart = Object.entries(volunteerHoursByMonth).map(([name, data]) => ({
      name,
      approved: Math.round(data.approved * 10) / 10,
      pending: Math.round(data.pending * 10) / 10,
      total: Math.round(data.total * 10) / 10
    }))

    // Get activity trends (last 30 days)
    const activityThirtyDaysAgo = new Date()
    activityThirtyDaysAgo.setDate(activityThirtyDaysAgo.getDate() - 30)
    
    const { data: activityTrendsData } = await supabase
      .from('user_activities')
      .select('activity_type, created_at')
      .gte('created_at', activityThirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true })

    // Process activity by day
    const activityByDay: { [key: string]: number } = {}
    
    // Initialize last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayKey = date.toISOString().split('T')[0]
      activityByDay[dayKey] = 0
    }

    // Count activities by day
    activityTrendsData?.forEach(activity => {
      const dayKey = activity.created_at.split('T')[0]
      if (activityByDay[dayKey] !== undefined) {
        activityByDay[dayKey]++
      }
    })

    // Convert to chart format
    const activityTrendsChart = Object.entries(activityByDay).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      activities: count
    }))

    const stats = {
      totalUsers,
      students,
      teachers: 0, // No teachers in current schema
      parents,
      admins,
      activeInternships,
      totalInternships,
      pendingApplications,
      totalApplications,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      thisMonthRevenue: Math.round(thisMonthRevenue * 100) / 100,
      totalVideos,
      activeVideos,
      totalVolunteerHours,
      pendingHours,
      totalApprovedHours,
      recentActivity: recentActivityFormatted,
      userGrowthChart,
      userDistributionData,
      volunteerHoursChart,
      activityTrendsChart
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
} 