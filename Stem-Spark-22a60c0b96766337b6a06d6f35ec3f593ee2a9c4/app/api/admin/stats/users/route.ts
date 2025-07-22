import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    // Get user statistics
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, role, created_at, last_active, total_volunteer_hours')

    const { data: userActivities } = await supabase
      .from('user_activities')
      .select('activity_type, created_at, user_id')

    // Get user growth by role (last 12 months)
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)
    
    const { data: recentProfiles } = await supabase
      .from('profiles')
      .select('role, created_at')
      .gte('created_at', twelveMonthsAgo.toISOString())
      .order('created_at', { ascending: true })

    // Process monthly user growth by role
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthlyUserGrowth: { [key: string]: { students: number; admins: number; parents: number; interns: number; total: number } } = {}
    
    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthKey = monthNames[date.getMonth()]
      monthlyUserGrowth[monthKey] = { students: 0, admins: 0, parents: 0, interns: 0, total: 0 }
    }

    // Count users by month and role
    recentProfiles?.forEach(profile => {
      const date = new Date(profile.created_at)
      const monthKey = monthNames[date.getMonth()]
      if (monthlyUserGrowth[monthKey]) {
        monthlyUserGrowth[monthKey].total++
        monthlyUserGrowth[monthKey][profile.role as keyof typeof monthlyUserGrowth[typeof monthKey]]++
      }
    })

    // Convert to chart format
    const monthlyUserChart = Object.entries(monthlyUserGrowth).map(([name, data]) => ({
      name,
      students: data.students,
      admins: data.admins,
      parents: data.parents,
      interns: data.interns,
      total: data.total
    }))

    // Get activity type distribution
    const activityTypeDistribution = userActivities?.reduce((acc: { [key: string]: number }, activity) => {
      acc[activity.activity_type] = (acc[activity.activity_type] || 0) + 1
      return acc
    }, {}) || {}

    // Get user engagement metrics
    const now = new Date()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const activeUsers = profiles?.filter(profile => {
      if (!profile.last_active) return false
      const lastActive = new Date(profile.last_active)
      return lastActive >= thirtyDaysAgo
    }).length || 0

    const totalUsers = profiles?.length || 0
    const engagementRate = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0

    // Get top active users
    const userActivityCounts: { [key: string]: number } = {}
    userActivities?.forEach(activity => {
      userActivityCounts[activity.user_id] = (userActivityCounts[activity.user_id] || 0) + 1
    })

    const topActiveUsers = Object.entries(userActivityCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([userId, count]) => {
        const profile = profiles?.find(p => p.id === userId)
        return {
          name: profile?.full_name || 'Unknown',
          activities: count,
          role: profile?.role || 'unknown',
          userId
        }
      })

    // Get role distribution
    const roleDistribution = profiles?.reduce((acc: { [key: string]: number }, profile) => {
      acc[profile.role] = (acc[profile.role] || 0) + 1
      return acc
    }, {}) || {}

    // Calculate average volunteer hours by role
    const avgVolunteerHoursByRole: { [key: string]: number } = {}
    const roleVolunteerHours: { [key: string]: { total: number; count: number } } = {}
    
    profiles?.forEach(profile => {
      if (profile.total_volunteer_hours) {
        if (!roleVolunteerHours[profile.role]) {
          roleVolunteerHours[profile.role] = { total: 0, count: 0 }
        }
        roleVolunteerHours[profile.role].total += profile.total_volunteer_hours
        roleVolunteerHours[profile.role].count++
      }
    })

    Object.entries(roleVolunteerHours).forEach(([role, data]) => {
      avgVolunteerHoursByRole[role] = Math.round((data.total / data.count) * 10) / 10
    })

    const stats = {
      monthlyUserChart,
      activityTypeDistribution,
      roleDistribution,
      avgVolunteerHoursByRole,
      topActiveUsers,
      totalUsers,
      activeUsers,
      engagementRate
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user statistics' },
      { status: 500 }
    )
  }
} 