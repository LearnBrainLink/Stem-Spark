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
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  try {
    // Fetch total users
    const { count: userCount, error: userError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    // Fetch total internships
    const { count: internshipCount, error: internshipError } = await supabase
      .from('internships')
      .select('*', { count: 'exact', head: true })

    // Fetch total applications
    const { count: applicationCount, error: applicationError } = await supabase
      .from('internship_applications')
      .select('*', { count: 'exact', head: true })

    // Fetch total revenue from completed donations
    const { data: revenueData, error: revenueError } = await supabase
      .from('donations')
      .select('amount')
      .eq('status' as any, 'completed' as any)

    // Error handling
    if (userError || internshipError || applicationError || revenueError) {
      return {
        error: [userError, internshipError, applicationError, revenueError]
          .filter(Boolean)
          .map(e => (e && typeof e === 'object' && 'message' in e ? (e as any).message : String(e)))
          .join('; '),
        stats: null,
      }
    }

    const totalRevenue = (revenueData as { amount: number }[] | null)?.reduce((sum, current) => sum + current.amount, 0) ?? 0

    return {
      error: null,
      stats: {
        users: userCount ?? 0,
        internships: internshipCount ?? 0,
        applications: applicationCount ?? 0,
        revenue: totalRevenue,
      },
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
      stats: null,
    }
  }
}

export async function getAnalyticsData() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  try {
    // Fetch users with creation dates for growth analysis
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('created_at, role')
      .order('created_at', { ascending: true })

    // Fetch videos data
    const { data: videos, error: videosError } = await supabase
      .from('videos')
      .select('title, created_at, status')
      .order('created_at', { ascending: false })

    // Fetch applications with status
    const { data: applications, error: appsError } = await supabase
      .from('internship_applications')
      .select('status, applied_at')
      .order('applied_at', { ascending: false })

    // Fetch internships
    const { data: internships, error: internshipsError } = await supabase
      .from('internships')
      .select('status, created_at')

    if (usersError || videosError || appsError || internshipsError) {
      return {
        error: [usersError, videosError, appsError, internshipsError]
          .filter(Boolean)
          .map(e => (e && typeof e === 'object' && 'message' in e ? (e as any).message : String(e)))
          .join('; '),
        data: null,
      };
    }

    // Process user growth data (last 6 months)
    const now = new Date()
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
    const userGrowth = []
    
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      const monthName = monthStart.toLocaleString('default', { month: 'short' })
      
      const usersInMonth = (users as any[])?.filter((user: any) => {
        const userDate = new Date(user.created_at)
        return userDate >= monthStart && userDate <= monthEnd
      }).length || 0
      
      userGrowth.push({ month: monthName, users: usersInMonth })
    }

    // Application stats by status
    const applicationStats = [
      { status: 'pending', count: (applications as any[])?.filter((app: any) => app.status === 'pending').length || 0 },
      { status: 'approved', count: (applications as any[])?.filter((app: any) => app.status === 'approved').length || 0 },
      { status: 'rejected', count: (applications as any[])?.filter((app: any) => app.status === 'rejected').length || 0 },
    ]

    return {
      error: null,
      data: {
        totalUsers: users?.length || 0,
        newUsersThisMonth: (users as any[])?.filter((user: any) => {
          const userDate = new Date(user.created_at)
          const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
          return userDate >= thisMonth
        }).length || 0,
        totalVideos: videos?.length || 0,
        totalApplications: applications?.length || 0,
        activeInternships: (internships as any[])?.filter((i: any) => i.status === 'active').length || 0,
        userGrowth,
        applicationStats,
      }
    }
  } catch (error) {
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
      return {
        error: error.message,
        users: null,
      }
    }

    return {
      error: null,
      users: users || [],
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
      users: null,
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
      return {
        error: error.message,
        internships: null,
      }
    }

    return {
      error: null,
      internships: internships || [],
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
      internships: null,
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
      return {
        error: error.message,
        applications: null,
      }
    }

    return {
      error: null,
      applications: applications || [],
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
      applications: null,
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
      return {
        error: error.message,
        videos: null,
      }
    }

    return {
      error: null,
      videos: videos || [],
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
      videos: null,
    }
  }
} 