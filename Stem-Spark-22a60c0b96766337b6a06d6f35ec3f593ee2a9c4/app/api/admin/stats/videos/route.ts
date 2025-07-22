import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    // Get video statistics
    const { data: videos } = await supabase
      .from('videos')
      .select('title, description, duration, category, grade_level, status, created_at, created_by')

    // Get video statistics by category
    const categoryDistribution = videos?.reduce((acc: { [key: string]: number }, video) => {
      acc[video.category] = (acc[video.category] || 0) + 1
      return acc
    }, {}) || {}

    // Get video statistics by grade level
    const gradeLevelDistribution = videos?.reduce((acc: { [key: string]: number }, video) => {
      acc[`Grade ${video.grade_level}`] = (acc[`Grade ${video.grade_level}`] || 0) + 1
      return acc
    }, {}) || {}

    // Get video statistics by status
    const statusDistribution = videos?.reduce((acc: { [key: string]: number }, video) => {
      acc[video.status] = (acc[video.status] || 0) + 1
      return acc
    }, {}) || {}

    // Get video creation trends (last 12 months)
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)
    
    const { data: recentVideos } = await supabase
      .from('videos')
      .select('created_at, category')
      .gte('created_at', twelveMonthsAgo.toISOString())
      .order('created_at', { ascending: true })

    // Process monthly video creation
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthlyVideoData: { [key: string]: { total: number; categories: { [key: string]: number } } } = {}
    
    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthKey = monthNames[date.getMonth()]
      monthlyVideoData[monthKey] = { total: 0, categories: {} }
    }

    // Count videos by month and category
    recentVideos?.forEach(video => {
      const date = new Date(video.created_at)
      const monthKey = monthNames[date.getMonth()]
      if (monthlyVideoData[monthKey]) {
        monthlyVideoData[monthKey].total++
        monthlyVideoData[monthKey].categories[video.category] = (monthlyVideoData[monthKey].categories[video.category] || 0) + 1
      }
    })

    // Convert to chart format
    const monthlyVideoChart = Object.entries(monthlyVideoData).map(([name, data]) => ({
      name,
      total: data.total,
      ...data.categories
    }))

    // Calculate summary statistics
    const totalVideos = videos?.length || 0
    const activeVideos = videos?.filter(v => v.status === 'active').length || 0
    const totalDuration = videos?.reduce((sum, video) => sum + video.duration, 0) || 0
    const avgDuration = totalVideos > 0 ? Math.round(totalDuration / totalVideos) : 0

    // Get top categories
    const topCategories = Object.entries(categoryDistribution)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category, count]) => ({
        category,
        count,
        percentage: Math.round((count / totalVideos) * 100)
      }))

    // Get videos by duration ranges
    const durationRanges = {
      '0-5 min': 0,
      '5-15 min': 0,
      '15-30 min': 0,
      '30+ min': 0
    }

    videos?.forEach(video => {
      if (video.duration <= 5) {
        durationRanges['0-5 min']++
      } else if (video.duration <= 15) {
        durationRanges['5-15 min']++
      } else if (video.duration <= 30) {
        durationRanges['15-30 min']++
      } else {
        durationRanges['30+ min']++
      }
    })

    const stats = {
      categoryDistribution,
      gradeLevelDistribution,
      statusDistribution,
      monthlyVideoChart,
      topCategories,
      durationRanges,
      totalVideos,
      activeVideos,
      totalDuration,
      avgDuration
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching video stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch video statistics' },
      { status: 500 }
    )
  }
} 