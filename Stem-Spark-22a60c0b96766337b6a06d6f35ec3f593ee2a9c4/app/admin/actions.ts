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
    // Fetch all stats in parallel
    const userQuery = supabase.from('profiles').select('*', { count: 'exact', head: true })
    const internshipQuery = supabase.from('internships').select('*', { count: 'exact', head: true })
    const applicationQuery = supabase.from('internship_applications').select('*', { count: 'exact', head: true })
    const revenueQuery = supabase.from('donations').select('amount').eq('status' as any, 'completed' as any)

    const [
      userResult,
      internshipResult,
      applicationResult,
      revenueResult
    ] = await Promise.all([userQuery, internshipQuery, applicationQuery, revenueQuery])

    const { count: userCount, error: userError } = userResult
    const { count: internshipCount, error: internshipError } = internshipResult
    const { count: applicationCount, error: applicationError } = applicationResult
    const { data: revenueData, error: revenueError } = revenueResult

    if (userError || internshipError || applicationError || revenueError) {
      console.error("Error fetching dashboard stats:", { userError, internshipError, applicationError, revenueError })
      return {
        error: "Failed to fetch dashboard statistics",
        stats: null
      }
    }

    const totalRevenue = (revenueData as {amount: number}[])?.reduce((sum, current) => sum + current.amount, 0) ?? 0

    return {
      error: null,
      stats: {
        users: userCount ?? 0,
        internships: internshipCount ?? 0,
        applications: applicationCount ?? 0,
        revenue: totalRevenue,
      }
    }
  } catch (error) {
    console.error("Unexpected error fetching dashboard stats:", error)
    return {
      error: "An unexpected error occurred",
      stats: null
    }
  }
} 