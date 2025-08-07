import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createClient()

    // Get all internship applications
    const { data: applications, error } = await supabase
      .from('intern_applications')
      .select('*')
      .order('submitted_at', { ascending: false })

    if (error) {
      throw error
    }

    // Get all internships
    const { data: internships } = await supabase
      .from('internships')
      .select('*')

    // Calculate application statistics
    const totalApplications = applications?.length || 0
    const pendingApplications = applications?.filter(app => app.status === 'pending').length || 0
    const approvedApplications = applications?.filter(app => app.status === 'approved').length || 0
    const rejectedApplications = applications?.filter(app => app.status === 'rejected').length || 0
    const interviewScheduled = applications?.filter(app => app.status === 'interview_scheduled').length || 0

    // Calculate application status distribution
    const statusDistribution = applications?.reduce((acc: any, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1
      return acc
    }, {}) || {}

    // Get recent applications
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: recentApplications } = await supabase
      .from('intern_applications')
      .select('submitted_at')
      .gte('submitted_at', sevenDaysAgo.toISOString())

    const recentApplicationCount = recentApplications?.length || 0

    // Get application growth data (last 6 months)
    const applicationGrowthData = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = date.toLocaleString('default', { month: 'short' })
      
      const { count: monthlyApplications } = await supabase
        .from('intern_applications')
        .select('*', { count: 'exact', head: true })
        .gte('submitted_at', date.toISOString())
        .lt('submitted_at', new Date(date.getFullYear(), date.getMonth() + 1, 1).toISOString())
      
      applicationGrowthData.push({
        month: monthName,
        applications: monthlyApplications || 0
      })
    }

    // Get application review data
    const { data: applicationReviews } = await supabase
      .from('application_reviews')
      .select('*')
      .order('created_at', { ascending: false })

    // Calculate review statistics
    const totalReviews = applicationReviews?.length || 0
    const averageReviewTime = applications?.reduce((sum, app) => {
      if (app.reviewed_at && app.submitted_at) {
        const submitTime = new Date(app.submitted_at).getTime()
        const reviewTime = new Date(app.reviewed_at).getTime()
        return sum + (reviewTime - submitTime)
      }
      return sum
    }, 0) / (applications?.filter(app => app.reviewed_at).length || 1) || 0

    // Get application areas of interest
    const interestDistribution = applications?.reduce((acc: any, app) => {
      app.areas_of_interest?.forEach((interest: string) => {
        acc[interest] = (acc[interest] || 0) + 1
      })
      return acc
    }, {}) || {}

    // Get top performing application sources
    const sourceDistribution = applications?.reduce((acc: any, app) => {
      // This would need to be implemented based on how you track application sources
      const source = 'direct' // Placeholder
      acc[source] = (acc[source] || 0) + 1
      return acc
    }, {}) || {}

    // Get application quality metrics
    const applicationsWithMotivation = applications?.filter(app => 
      app.motivation_statement && app.motivation_statement.length > 100
    ).length || 0

    const qualityScore = totalApplications > 0 ? (applicationsWithMotivation / totalApplications) * 100 : 0

    const stats = {
      overview: {
        totalApplications,
        pendingApplications,
        approvedApplications,
        rejectedApplications,
        interviewScheduled,
        recentApplicationCount
      },
      statusDistribution,
      applicationGrowthData,
      reviewMetrics: {
        totalReviews,
        averageReviewTime: Math.round(averageReviewTime / (1000 * 60 * 60 * 24)), // Convert to days
        qualityScore: Math.round(qualityScore)
      },
      interestDistribution,
      sourceDistribution,
      engagement: {
        totalApplications,
        recentApplicationCount,
        approvalRate: totalApplications > 0 ? (approvedApplications / totalApplications) * 100 : 0
      }
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching application statistics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch application statistics' },
      { status: 500 }
    )
  }
} 