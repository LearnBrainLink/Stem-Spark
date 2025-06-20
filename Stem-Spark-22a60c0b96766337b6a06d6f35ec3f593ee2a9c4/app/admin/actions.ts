'use server'

import { signOut as signOutOriginal } from '@/lib/enhanced-auth-actions'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'

export async function signOut() {
  const result = await signOutOriginal()
  if (result.redirectPath) {
    redirect(result.redirectPath)
  }
}

export async function getDashboardStats() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  try {
    console.log('🔍 Starting dashboard stats fetch...')

    // Initialize stats with defaults
    let stats = {
      users: 0,
      internships: 0,
      applications: 0,
      revenue: 0,
    }

    // Try to fetch each stat individually with error handling
    try {
      const { count: userCount, error: userError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
      
      if (!userError && userCount !== null) {
        stats.users = userCount
        console.log('✅ Users count:', userCount)
      } else {
        console.log('⚠️ Users query failed:', userError?.message || 'Unknown error')
      }
    } catch (err) {
      console.log('⚠️ Users query exception:', err)
    }

    try {
      const { count: internshipCount, error: internshipError } = await supabase
        .from('internships')
        .select('*', { count: 'exact', head: true })
      
      if (!internshipError && internshipCount !== null) {
        stats.internships = internshipCount
        console.log('✅ Internships count:', internshipCount)
      } else {
        console.log('⚠️ Internships query failed:', internshipError?.message || 'Unknown error')
      }
    } catch (err) {
      console.log('⚠️ Internships query exception:', err)
    }

    try {
      const { count: applicationCount, error: applicationError } = await supabase
        .from('internship_applications')
        .select('*', { count: 'exact', head: true })
      
      if (!applicationError && applicationCount !== null) {
        stats.applications = applicationCount
        console.log('✅ Applications count:', applicationCount)
      } else {
        console.log('⚠️ Applications query failed:', applicationError?.message || 'Unknown error')
      }
    } catch (err) {
      console.log('⚠️ Applications query exception:', err)
    }

    try {
      const { data: revenueData, error: revenueError } = await supabase
        .from('donations')
        .select('amount')
        .eq('status' as any, 'completed' as any)
      
      if (!revenueError && revenueData) {
        const totalRevenue = (revenueData as any[]).reduce((sum, donation) => sum + (donation.amount || 0), 0)
        stats.revenue = totalRevenue
        console.log('✅ Revenue calculated:', totalRevenue)
      } else {
        console.log('⚠️ Revenue query failed:', revenueError?.message || 'Unknown error')
      }
    } catch (err) {
      console.log('⚠️ Revenue query exception:', err)
    }

    console.log('📊 Final stats:', stats)

    return {
      error: null,
      stats: stats
    }
  } catch (error) {
    console.error('💥 Unexpected error in getDashboardStats:', error)
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
      stats: {
        users: 0,
        internships: 0,
        applications: 0,
        revenue: 0,
      },
    }
  }
}

export async function getAnalyticsData() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  try {
    console.log('🔍 Starting analytics data fetch...')

    // Initialize with defaults
    let analyticsData = {
      totalUsers: 0,
      newUsersThisMonth: 0,
      totalVideos: 0,
      totalApplications: 0,
      activeInternships: 0,
      userGrowth: [
        { month: 'Jan', users: 0 },
        { month: 'Feb', users: 0 },
        { month: 'Mar', users: 0 },
        { month: 'Apr', users: 0 },
        { month: 'May', users: 0 },
        { month: 'Jun', users: 0 },
      ],
      applicationStats: [
        { status: 'pending', count: 0 },
        { status: 'approved', count: 0 },
        { status: 'rejected', count: 0 },
      ],
    }

    // Try to fetch users data
    try {
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('created_at, role')
        .order('created_at', { ascending: true })

      if (!usersError && users) {
        analyticsData.totalUsers = users.length
        
        // Calculate new users this month
        const now = new Date()
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        analyticsData.newUsersThisMonth = users.filter((user: any) => 
          new Date(user.created_at) >= thisMonth
        ).length

        // Generate user growth data (last 6 months)
        for (let i = 5; i >= 0; i--) {
          const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
          const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
          const monthName = monthStart.toLocaleString('default', { month: 'short' })
          
          const usersInMonth = (users as any[]).filter((user: any) => {
            const userDate = new Date(user.created_at)
            return userDate >= monthStart && userDate <= monthEnd
          }).length
          
          analyticsData.userGrowth[5 - i] = { month: monthName, users: usersInMonth }
        }
        
        console.log('✅ Users data processed')
      } else {
        console.log('⚠️ Users query failed:', usersError?.message)
      }
    } catch (err) {
      console.log('⚠️ Users query exception:', err)
    }

    // Try to fetch videos data
    try {
      const { data: videos, error: videosError } = await supabase
        .from('videos')
        .select('title, created_at, status')
        .order('created_at', { ascending: false })

      if (!videosError && videos) {
        analyticsData.totalVideos = videos.length
        console.log('✅ Videos data processed')
      } else {
        console.log('⚠️ Videos query failed:', videosError?.message)
      }
    } catch (err) {
      console.log('⚠️ Videos query exception:', err)
    }

    // Try to fetch applications data
    try {
      const { data: applications, error: appsError } = await supabase
        .from('internship_applications')
        .select('status, applied_at')
        .order('applied_at', { ascending: false })

      if (!appsError && applications) {
        analyticsData.totalApplications = applications.length
        
        // Application stats by status
        analyticsData.applicationStats = [
          { status: 'pending', count: (applications as any[]).filter((app: any) => app.status === 'pending').length },
          { status: 'approved', count: (applications as any[]).filter((app: any) => app.status === 'approved').length },
          { status: 'rejected', count: (applications as any[]).filter((app: any) => app.status === 'rejected').length },
        ]
        
        console.log('✅ Applications data processed')
      } else {
        console.log('⚠️ Applications query failed:', appsError?.message)
      }
    } catch (err) {
      console.log('⚠️ Applications query exception:', err)
    }

    // Try to fetch internships data
    try {
      const { data: internships, error: internshipsError } = await supabase
        .from('internships')
        .select('status, created_at')

      if (!internshipsError && internships) {
        analyticsData.activeInternships = (internships as any[]).filter((i: any) => i.status === 'active').length
        console.log('✅ Internships data processed')
      } else {
        console.log('⚠️ Internships query failed:', internshipsError?.message)
      }
    } catch (err) {
      console.log('⚠️ Internships query exception:', err)
    }

    console.log('📊 Analytics data processed:', analyticsData)

    return {
      error: null,
      data: analyticsData
    }
  } catch (error) {
    console.error('💥 Unexpected error in getAnalyticsData:', error)
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null,
    }
  }
}

export async function getUsersData() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  try {
    const { data: users, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.log('⚠️ Users data fetch failed:', error.message)
      return {
        error: error.message,
        users: [],
      }
    }

    return {
      error: null,
      users: users || [],
    }
  } catch (error) {
    console.error('💥 Unexpected error in getUsersData:', error)
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
      users: [],
    }
  }
}

export async function getInternshipsData() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  try {
    const { data: internships, error } = await supabase
      .from('internships')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.log('⚠️ Internships data fetch failed:', error.message)
      return {
        error: error.message,
        internships: [],
      }
    }

    return {
      error: null,
      internships: internships || [],
    }
  } catch (error) {
    console.error('💥 Unexpected error in getInternshipsData:', error)
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
      internships: [],
    }
  }
}

export async function getApplicationsData() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  try {
    const { data: applications, error } = await supabase
      .from('internship_applications')
      .select(`
        *,
        internships(title, company),
        profiles(full_name, email, grade, school_name)
      `)
      .order('applied_at', { ascending: false })

    if (error) {
      console.log('⚠️ Applications data fetch failed:', error.message)
      return {
        error: error.message,
        applications: [],
      }
    }

    return {
      error: null,
      applications: applications || [],
    }
  } catch (error) {
    console.error('💥 Unexpected error in getApplicationsData:', error)
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
      applications: [],
    }
  }
}

export async function getVideosData() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  try {
    const { data: videos, error } = await supabase
      .from('videos')
      .select(`
        *,
        profiles(full_name)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.log('⚠️ Videos data fetch failed:', error.message)
      return {
        error: error.message,
        videos: [],
      }
    }

    return {
      error: null,
      videos: videos || [],
    }
  } catch (error) {
    console.error('💥 Unexpected error in getVideosData:', error)
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
      videos: [],
    }
  }
} 