import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createClient()

    // Get all volunteer hours
    const { data: volunteerHours, error } = await supabase
      .from('volunteer_hours')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    // Get all interns
    const { data: interns } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('role', 'intern')

    // Calculate volunteer hours statistics
    const totalHours = volunteerHours?.reduce((sum, record) => sum + (record.hours || 0), 0) || 0
    const totalRecords = volunteerHours?.length || 0
    const approvedHours = volunteerHours?.filter(record => record.status === 'approved')
      .reduce((sum, record) => sum + (record.hours || 0), 0) || 0
    const pendingHours = volunteerHours?.filter(record => record.status === 'pending')
      .reduce((sum, record) => sum + (record.hours || 0), 0) || 0
    const rejectedHours = volunteerHours?.filter(record => record.status === 'rejected')
      .reduce((sum, record) => sum + (record.hours || 0), 0) || 0

    // Calculate status distribution
    const statusDistribution = volunteerHours?.reduce((acc: any, record) => {
      acc[record.status] = (acc[record.status] || 0) + 1
      return acc
    }, {}) || {}

    // Calculate activity type distribution
    const activityTypeDistribution = volunteerHours?.reduce((acc: any, record) => {
      acc[record.activity_type] = (acc[record.activity_type] || 0) + 1
      return acc
    }, {}) || {}

    // Get recent volunteer activity
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: recentVolunteerActivity } = await supabase
      .from('volunteer_hours')
      .select('created_at, hours')
      .gte('created_at', sevenDaysAgo.toISOString())

    const recentHours = recentVolunteerActivity?.reduce((sum, record) => sum + (record.hours || 0), 0) || 0
    const recentRecords = recentVolunteerActivity?.length || 0

    // Get volunteer hours growth data (last 6 months)
    const volunteerHoursGrowthData = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = date.toLocaleString('default', { month: 'short' })
      
      const { data: monthlyHours } = await supabase
        .from('volunteer_hours')
        .select('hours')
        .gte('created_at', date.toISOString())
        .lt('created_at', new Date(date.getFullYear(), date.getMonth() + 1, 1).toISOString())
      
      const totalMonthlyHours = monthlyHours?.reduce((sum, record) => sum + (record.hours || 0), 0) || 0
      
      volunteerHoursGrowthData.push({
        month: monthName,
        hours: totalMonthlyHours
      })
    }

    // Get top performing interns
    const internPerformance = interns?.map(intern => {
      const internHours = volunteerHours?.filter(record => record.intern_id === intern.id) || []
      const totalInternHours = internHours.reduce((sum, record) => sum + (record.hours || 0), 0)
      const approvedInternHours = internHours.filter(record => record.status === 'approved')
        .reduce((sum, record) => sum + (record.hours || 0), 0)
      
      return {
        id: intern.id,
        name: intern.full_name,
        totalHours: totalInternHours,
        approvedHours: approvedInternHours,
        recordCount: internHours.length,
        averageHoursPerRecord: internHours.length > 0 ? totalInternHours / internHours.length : 0
      }
    }).sort((a, b) => b.totalHours - a.totalHours) || []

    // Get volunteer hours by activity type
    const hoursByActivityType = Object.entries(activityTypeDistribution).map(([type, count]) => {
      const typeHours = volunteerHours?.filter(record => record.activity_type === type)
        .reduce((sum, record) => sum + (record.hours || 0), 0) || 0
      
      return {
        type,
        count: count as number,
        totalHours: typeHours,
        averageHours: (count as number) > 0 ? typeHours / (count as number) : 0
      }
    })

    // Calculate approval rate
    const approvalRate = totalRecords > 0 ? (statusDistribution.approved || 0) / totalRecords * 100 : 0
    const rejectionRate = totalRecords > 0 ? (statusDistribution.rejected || 0) / totalRecords * 100 : 0

    const stats = {
      overview: {
        totalHours,
        totalRecords,
        approvedHours,
        pendingHours,
        rejectedHours,
        recentHours,
        recentRecords
      },
      statusDistribution,
      activityTypeDistribution,
      volunteerHoursGrowthData,
      internPerformance: internPerformance.slice(0, 10),
      hoursByActivityType,
      metrics: {
        approvalRate: Math.round(approvalRate * 10) / 10,
        rejectionRate: Math.round(rejectionRate * 10) / 10,
        averageHoursPerRecord: totalRecords > 0 ? totalHours / totalRecords : 0,
        averageHoursPerIntern: (interns?.length || 0) > 0 ? totalHours / (interns?.length || 1) : 0
      },
      engagement: {
        totalHours,
        recentHours,
        activeInterns: internPerformance.filter(intern => intern.totalHours > 0).length
      }
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching volunteer hours statistics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch volunteer hours statistics' },
      { status: 500 }
    )
  }
} 