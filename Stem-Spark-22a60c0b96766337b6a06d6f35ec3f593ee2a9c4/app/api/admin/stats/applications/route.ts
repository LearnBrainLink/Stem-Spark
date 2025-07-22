import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    // Get application statistics by status
    const { data: applicationStats } = await supabase
      .from('intern_applications')
      .select('status, created_at, education_level, areas_of_interest')

    // Get application statistics by month
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    
    const { data: monthlyApplications } = await supabase
      .from('intern_applications')
      .select('status, created_at')
      .gte('created_at', sixMonthsAgo.toISOString())
      .order('created_at', { ascending: true })

    // Process monthly data
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthlyData: { [key: string]: { pending: number; approved: number; rejected: number; total: number } } = {}
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthKey = monthNames[date.getMonth()]
      monthlyData[monthKey] = { pending: 0, approved: 0, rejected: 0, total: 0 }
    }

    // Count applications by month and status
    monthlyApplications?.forEach(app => {
      const date = new Date(app.created_at)
      const monthKey = monthNames[date.getMonth()]
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].total++
        monthlyData[monthKey][app.status as keyof typeof monthlyData[typeof monthKey]]++
      }
    })

    // Convert to chart format
    const monthlyChartData = Object.entries(monthlyData).map(([name, data]) => ({
      name,
      pending: data.pending,
      approved: data.approved,
      rejected: data.rejected,
      total: data.total
    }))

    // Get education level distribution
    const educationLevels = applicationStats?.reduce((acc: { [key: string]: number }, app) => {
      acc[app.education_level] = (acc[app.education_level] || 0) + 1
      return acc
    }, {}) || {}

    // Get areas of interest distribution
    const areasOfInterest: { [key: string]: number } = {}
    applicationStats?.forEach(app => {
      app.areas_of_interest?.forEach((area: string) => {
        areasOfInterest[area] = (areasOfInterest[area] || 0) + 1
      })
    })

    // Get status distribution
    const statusDistribution = applicationStats?.reduce((acc: { [key: string]: number }, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1
      return acc
    }, {}) || {}

    const stats = {
      monthlyChartData,
      educationLevels,
      areasOfInterest,
      statusDistribution,
      totalApplications: applicationStats?.length || 0
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