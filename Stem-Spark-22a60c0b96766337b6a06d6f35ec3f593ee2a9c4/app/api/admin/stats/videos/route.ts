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

    // Get video statistics
    const { data: videos } = await supabase
      .from('videos')
      .select('title, category, grade_level, duration, status, created_at')

    // Get videos by category
    const categoryDistribution = videos?.reduce((acc: { [key: string]: number }, video) => {
      acc[video.category] = (acc[video.category] || 0) + 1
      return acc
    }, {}) || {}

    // Get videos by grade level
    const gradeLevelDistribution = videos?.reduce((acc: { [key: string]: number }, video) => {
      acc[`Grade ${video.grade_level}`] = (acc[`Grade ${video.grade_level}`] || 0) + 1
      return acc
    }, {}) || {}

    // Get videos by month (last 12 months)
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)
    
    const { data: recentVideos } = await supabase
      .from('videos')
      .select('created_at')
      .gte('created_at', twelveMonthsAgo.toISOString())
      .order('created_at', { ascending: true })

    // Process monthly video data
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthlyVideos: { [key: string]: number } = {}
    
    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthKey = monthNames[date.getMonth()]
      monthlyVideos[monthKey] = 0
    }

    // Count videos by month
    recentVideos?.forEach(video => {
      const date = new Date(video.created_at)
      const monthKey = monthNames[date.getMonth()]
      if (monthlyVideos[monthKey] !== undefined) {
        monthlyVideos[monthKey]++
      }
    })

    // Convert to chart format
    const monthlyVideoChart = Object.entries(monthlyVideos).map(([name, count]) => ({
      name,
      videos: count
    }))

    // Calculate metrics
    const totalVideos = videos?.length || 0
    const totalDuration = videos?.reduce((sum, video) => sum + (video.duration || 0), 0) || 0
    const avgDuration = totalVideos > 0 ? Math.round(totalDuration / totalVideos) : 0
    const activeVideos = videos?.filter(video => video.status === 'active').length || 0

    const stats = {
      monthlyVideoChart,
      categoryDistribution,
      gradeLevelDistribution,
      totalVideos,
      totalDuration,
      avgDuration,
      activeVideos
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