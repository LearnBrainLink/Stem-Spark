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

    // Get volunteer hours statistics
    const { data: volunteerHours } = await supabase
      .from('volunteer_hours')
      .select('hours, status, activity_type, created_at, intern_id')

    // Get volunteer hours by status
    const statusDistribution = volunteerHours?.reduce((acc: { [key: string]: number }, record) => {
      acc[record.status] = (acc[record.status] || 0) + 1
      return acc
    }, {}) || {}

    // Get volunteer hours by activity type
    const activityTypeDistribution = volunteerHours?.reduce((acc: { [key: string]: number }, record) => {
      acc[record.activity_type] = (acc[record.activity_type] || 0) + 1
      return acc
    }, {}) || {}

    // Get volunteer hours by month (last 12 months)
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)
    
    const { data: recentVolunteerHours } = await supabase
      .from('volunteer_hours')
      .select('hours, status, created_at')
      .gte('created_at', twelveMonthsAgo.toISOString())
      .order('created_at', { ascending: true })

    // Process monthly volunteer hours data
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthlyVolunteerHours: { [key: string]: { total: number; approved: number; pending: number } } = {}
    
    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthKey = monthNames[date.getMonth()]
      monthlyVolunteerHours[monthKey] = { total: 0, approved: 0, pending: 0 }
    }

    // Count volunteer hours by month and status
    recentVolunteerHours?.forEach(record => {
      const date = new Date(record.created_at)
      const monthKey = monthNames[date.getMonth()]
      if (monthlyVolunteerHours[monthKey]) {
        monthlyVolunteerHours[monthKey].total += record.hours || 0
        if (record.status === 'approved') {
          monthlyVolunteerHours[monthKey].approved += record.hours || 0
        } else if (record.status === 'pending') {
          monthlyVolunteerHours[monthKey].pending += record.hours || 0
        }
      }
    })

    // Convert to chart format
    const monthlyVolunteerHoursChart = Object.entries(monthlyVolunteerHours).map(([name, data]) => ({
      name,
      total: Math.round(data.total * 10) / 10,
      approved: Math.round(data.approved * 10) / 10,
      pending: Math.round(data.pending * 10) / 10
    }))

    // Calculate metrics
    const totalHours = volunteerHours?.reduce((sum, record) => sum + (record.hours || 0), 0) || 0
    const approvedHours = volunteerHours?.filter(record => record.status === 'approved')
      .reduce((sum, record) => sum + (record.hours || 0), 0) || 0
    const pendingHours = volunteerHours?.filter(record => record.status === 'pending')
      .reduce((sum, record) => sum + (record.hours || 0), 0) || 0
    const totalRecords = volunteerHours?.length || 0
    const approvalRate = totalRecords > 0 ? Math.round((volunteerHours?.filter(r => r.status === 'approved').length || 0) / totalRecords * 100) : 0

    const stats = {
      monthlyVolunteerHoursChart,
      statusDistribution,
      activityTypeDistribution,
      totalHours,
      approvedHours,
      pendingHours,
      totalRecords,
      approvalRate
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching volunteer hours stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch volunteer hours statistics' },
      { status: 500 }
    )
  }
} 