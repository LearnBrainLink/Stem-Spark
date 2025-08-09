import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    console.log('🔄 Fetching application stats...')
    const supabase = createClient()

    // Get all internship applications
    const { data: applications, error } = await supabase
      .from('intern_applications')
      .select('*')

    if (error) {
      console.error('Error fetching applications:', error)
      throw error
    }

    console.log(`Found ${applications?.length || 0} applications`)

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

    // Get recent applications (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentApplications = applications?.filter(app => 
      new Date(app.created_at) >= sevenDaysAgo
    ) || []
    const recentApplicationCount = recentApplications.length

    // Get application growth data (last 6 months)
    const applicationGrowthData = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      const monthName = date.toLocaleString('default', { month: 'short' })
      
      const monthlyApplications = applications?.filter(app => {
        const appDate = new Date(app.created_at)
        return appDate >= date && appDate < nextDate
      }).length || 0
      
      applicationGrowthData.push({
        month: monthName,
        applications: monthlyApplications
      })
    }

    // Calculate review statistics
    const reviewedApplications = applications?.filter(app => app.reviewed_at) || []
    const totalReviews = reviewedApplications.length
    
    let averageReviewTime = 0
    if (reviewedApplications.length > 0) {
      const totalReviewTime = reviewedApplications.reduce((sum, app) => {
        const submitTime = new Date(app.submitted_at).getTime()
        const reviewTime = new Date(app.reviewed_at!).getTime()
        return sum + (reviewTime - submitTime)
      }, 0)
      averageReviewTime = totalReviewTime / reviewedApplications.length
    }

    // Get application areas of interest
    const interestDistribution: Record<string, number> = {}
    applications?.forEach(app => {
      if (app.specialties && Array.isArray(app.specialties)) {
        app.specialties.forEach((specialty: string) => {
          interestDistribution[specialty] = (interestDistribution[specialty] || 0) + 1
        })
      }
    })

    // Get application quality metrics
    const applicationsWithMotivation = applications?.filter(app => 
      app.motivation && app.motivation.length > 100
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
      sourceDistribution: {
        direct: totalApplications, // Placeholder since we don't track sources yet
      },
      engagement: {
        totalApplications,
        recentApplicationCount,
        approvalRate: totalApplications > 0 ? (approvedApplications / totalApplications) * 100 : 0
      }
    }

    console.log('✅ Application stats calculated successfully')
    return NextResponse.json(stats)
  } catch (error) {
    console.error('❌ Error fetching application statistics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch application statistics' },
      { status: 500 }
    )
  }
}