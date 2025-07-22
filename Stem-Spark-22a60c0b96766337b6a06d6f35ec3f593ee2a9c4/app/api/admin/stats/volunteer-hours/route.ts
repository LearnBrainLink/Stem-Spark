import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    // Get volunteer hours statistics
    const { data: volunteerHours } = await supabase
      .from('volunteer_hours')
      .select('hours, status, activity_type, created_at, intern_id')

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('role', 'intern')

    // Get volunteer hours by activity type
    const activityTypeDistribution = volunteerHours?.reduce((acc: { [key: string]: number }, record) => {
      acc[record.activity_type] = (acc[record.activity_type] || 0) + parseFloat(record.hours)
      return acc
    }, {}) || {}

    // Get volunteer hours by status
    const statusDistribution = volunteerHours?.reduce((acc: { [key: string]: number }, record) => {
      acc[record.status] = (acc[record.status] || 0) + parseFloat(record.hours)
      return acc
    }, {}) || {}

    // Get top volunteers
    const volunteerTotals: { [key: string]: number } = {}
    volunteerHours?.forEach(record => {
      if (record.status === 'approved') {
        volunteerTotals[record.intern_id] = (volunteerTotals[record.intern_id] || 0) + parseFloat(record.hours)
      }
    })

    // Get top 10 volunteers
    const topVolunteers = Object.entries(volunteerTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([internId, hours]) => {
        const profile = profiles?.find(p => p.id === internId)
        return {
          name: profile?.full_name || 'Unknown',
          hours: Math.round(hours * 10) / 10,
          internId
        }
      })

    // Get volunteer hours trends (last 12 months)
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)
    
    const { data: monthlyVolunteerHours } = await supabase
      .from('volunteer_hours')
      .select('hours, status, created_at')
      .gte('created_at', twelveMonthsAgo.toISOString())
      .order('created_at', { ascending: true })

    // Process monthly data
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthlyVolunteerData: { [key: string]: { approved: number; pending: number; total: number } } = {}
    
    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthKey = monthNames[date.getMonth()]
      monthlyVolunteerData[monthKey] = { approved: 0, pending: 0, total: 0 }
    }

    // Count volunteer hours by month and status
    monthlyVolunteerHours?.forEach(record => {
      const date = new Date(record.created_at)
      const monthKey = monthNames[date.getMonth()]
      if (monthlyVolunteerData[monthKey]) {
        const hours = parseFloat(record.hours) || 0
        monthlyVolunteerData[monthKey].total += hours
        if (record.status === 'approved') {
          monthlyVolunteerData[monthKey].approved += hours
        } else if (record.status === 'pending') {
          monthlyVolunteerData[monthKey].pending += hours
        }
      }
    })

    // Convert to chart format
    const monthlyVolunteerChart = Object.entries(monthlyVolunteerData).map(([name, data]) => ({
      name,
      approved: Math.round(data.approved * 10) / 10,
      pending: Math.round(data.pending * 10) / 10,
      total: Math.round(data.total * 10) / 10
    }))

    // Calculate summary statistics
    const totalHours = volunteerHours?.reduce((sum, record) => sum + parseFloat(record.hours), 0) || 0
    const approvedHours = volunteerHours?.filter(r => r.status === 'approved').reduce((sum, record) => sum + parseFloat(record.hours), 0) || 0
    const pendingHours = volunteerHours?.filter(r => r.status === 'pending').reduce((sum, record) => sum + parseFloat(record.hours), 0) || 0
    const avgHoursPerVolunteer = (profiles?.length || 0) > 0 ? Math.round((approvedHours / (profiles?.length || 1)) * 10) / 10 : 0

    const stats = {
      activityTypeDistribution,
      statusDistribution,
      topVolunteers,
      monthlyVolunteerChart,
      totalHours: Math.round(totalHours * 10) / 10,
      approvedHours: Math.round(approvedHours * 10) / 10,
      pendingHours: Math.round(pendingHours * 10) / 10,
      avgHoursPerVolunteer,
      totalVolunteers: profiles?.length || 0
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