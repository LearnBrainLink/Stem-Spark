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