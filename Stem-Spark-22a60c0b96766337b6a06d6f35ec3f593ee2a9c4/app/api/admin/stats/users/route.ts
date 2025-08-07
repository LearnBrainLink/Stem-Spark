import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createClient()

    // Get all users with their details
    const { data: users, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    // Calculate user statistics
    const totalUsers = users?.length || 0
    const roleDistribution = users?.reduce((acc: any, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1
      return acc
    }, {}) || {}

    // Get recent user activity
    const { data: recentActivity } = await supabase
      .from('user_activities')
      .select('user_id, activity_type, created_at')
      .order('created_at', { ascending: false })
      .limit(20)

    // Get user growth data (last 6 months)
    const userGrowthData = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = date.toLocaleString('default', { month: 'short' })
      
      const { count: monthlyUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', date.toISOString())
        .lt('created_at', new Date(date.getFullYear(), date.getMonth() + 1, 1).toISOString())
      
      userGrowthData.push({
        month: monthName,
        users: monthlyUsers || 0
      })
    }

    // Get active users (users with recent activity)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const { data: activeUsers } = await supabase
      .from('user_activities')
      .select('user_id')
      .gte('created_at', sevenDaysAgo.toISOString())
      .limit(100)

    const uniqueActiveUsers = new Set(activeUsers?.map(u => u.user_id) || []).size

    // Get user engagement data
    const { data: userEngagement } = await supabase
      .from('user_activities')
      .select('activity_type, created_at')
      .order('created_at', { ascending: false })
      .limit(100)

    const engagementDistribution = userEngagement?.reduce((acc: any, activity) => {
      acc[activity.activity_type] = (acc[activity.activity_type] || 0) + 1
      return acc
    }, {}) || {}

    const stats = {
      totalUsers,
      roleDistribution,
      activeUsers: uniqueActiveUsers,
      engagementDistribution,
      userGrowthData,
      recentActivity: recentActivity || []
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching user statistics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user statistics' },
      { status: 500 }
    )
  }
} 