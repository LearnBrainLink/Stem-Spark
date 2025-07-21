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
      recentActivity: recentActivityFormatted
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