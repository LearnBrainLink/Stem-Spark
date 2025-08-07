import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createClient()

    // Get all videos
    const { data: videos, error } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    // Get user progress data
    const { data: userProgress } = await supabase
      .from('user_progress')
      .select('*')

    // Calculate video statistics
    const totalVideos = videos?.length || 0
    const activeVideos = videos?.filter(video => video.status === 'active').length || 0
    const inactiveVideos = videos?.filter(video => video.status === 'inactive').length || 0

    // Calculate video categories
    const categoryDistribution = videos?.reduce((acc: any, video) => {
      acc[video.category] = (acc[video.category] || 0) + 1
      return acc
    }, {}) || {}

    // Calculate total duration
    const totalDuration = videos?.reduce((sum, video) => sum + (video.duration || 0), 0) || 0

    // Get video engagement data
    const { data: videoEngagement } = await supabase
      .from('user_progress')
      .select('video_id, progress_percentage, completed_at')
      .not('video_id', 'is', null)

    // Calculate engagement statistics
    const totalViews = videoEngagement?.length || 0
    const completedViews = videoEngagement?.filter(progress => progress.completed_at).length || 0
    const averageProgress = videoEngagement?.reduce((sum, progress) => 
      sum + (progress.progress_percentage || 0), 0) / (videoEngagement?.length || 1) || 0

    // Get recent video activity
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: recentVideoActivity } = await supabase
      .from('user_progress')
      .select('video_id, created_at')
      .gte('created_at', sevenDaysAgo.toISOString())

    const recentViews = recentVideoActivity?.length || 0

    // Generate video performance data
    const videoPerformanceData = videos?.map(video => {
      const videoViews = videoEngagement?.filter(progress => progress.video_id === video.id).length || 0
      const videoCompletions = videoEngagement?.filter(progress => 
        progress.video_id === video.id && progress.completed_at).length || 0
      
      return {
        id: video.id,
        title: video.title,
        category: video.category,
        duration: video.duration,
        views: videoViews,
        completions: videoCompletions,
        completionRate: videoViews > 0 ? (videoCompletions / videoViews) * 100 : 0
      }
    }) || []

    // Get top performing videos
    const topVideos = videoPerformanceData
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)

    const stats = {
      overview: {
        totalVideos,
        activeVideos,
        inactiveVideos,
        totalDuration,
        totalViews,
        completedViews,
        averageProgress,
        recentViews
      },
      categoryDistribution,
      videoPerformanceData,
      topVideos,
      engagement: {
        totalViews,
        completedViews,
        averageProgress,
        recentViews
      }
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching video statistics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch video statistics' },
      { status: 500 }
    )
  }
} 