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

    // Get application statistics
    const { data: applications } = await supabase
      .from('intern_applications')
      .select('status, created_at, education_level, areas_of_interest')

    // Get applications by status
    const statusDistribution = applications?.reduce((acc: { [key: string]: number }, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1
      return acc
    }, {}) || {}

    // Get applications by education level
    const educationDistribution = applications?.reduce((acc: { [key: string]: number }, app) => {
      acc[app.education_level] = (acc[app.education_level] || 0) + 1
      return acc
    }, {}) || {}

    // Get applications by month (last 12 months)
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)
    
    const { data: recentApplications } = await supabase
      .from('intern_applications')
      .select('status, created_at')
      .gte('created_at', twelveMonthsAgo.toISOString())
      .order('created_at', { ascending: true })

    // Process monthly application data
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthlyApplications: { [key: string]: { total: number; pending: number; approved: number; rejected: number } } = {}
    
    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthKey = monthNames[date.getMonth()]
      monthlyApplications[monthKey] = { total: 0, pending: 0, approved: 0, rejected: 0 }
    }

    // Count applications by month and status
    recentApplications?.forEach(app => {
      const date = new Date(app.created_at)
      const monthKey = monthNames[date.getMonth()]
      if (monthlyApplications[monthKey]) {
        monthlyApplications[monthKey].total++
        monthlyApplications[monthKey][app.status as keyof typeof monthlyApplications[typeof monthKey]]++
      }
    })

    // Convert to chart format
    const monthlyApplicationChart = Object.entries(monthlyApplications).map(([name, data]) => ({
      name,
      total: data.total,
      pending: data.pending,
      approved: data.approved,
      rejected: data.rejected
    }))

    // Get area of interest distribution
    const areaDistribution: { [key: string]: number } = {}
    applications?.forEach(app => {
      app.areas_of_interest?.forEach((area: string) => {
        areaDistribution[area] = (areaDistribution[area] || 0) + 1
      })
    })

    // Calculate metrics
    const totalApplications = applications?.length || 0
    const pendingApplications = applications?.filter(app => app.status === 'pending').length || 0
    const approvedApplications = applications?.filter(app => app.status === 'approved').length || 0
    const rejectedApplications = applications?.filter(app => app.status === 'rejected').length || 0
    const approvalRate = totalApplications > 0 ? Math.round((approvedApplications / totalApplications) * 100) : 0

    const stats = {
      monthlyApplicationChart,
      statusDistribution,
      educationDistribution,
      areaDistribution,
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      approvalRate
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching application stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch application statistics' },
      { status: 500 }
    )
  }
} 