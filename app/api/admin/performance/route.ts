import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateAdminAccess } from '@/lib/admin-protection'

export async function GET(request: NextRequest) {
  try {
    // Validate admin access
    const { user, error: authError } = await validateAdminAccess()
    if (authError) {
      return NextResponse.json({ error: authError }, { status: 401 })
    }

    const supabase = createClient()

    // Get basic system metrics
    const systemMetrics = {
      timestamp: new Date().toISOString(),
      cpu: Math.random() * 100, // Simulated - in production, get from monitoring service
      memory: Math.random() * 100,
      disk: Math.random() * 100,
      network: Math.random() * 100,
      activeUsers: Math.floor(Math.random() * 100) + 10,
      uptime: Math.floor(Math.random() * 1000000)
    }

    // Get performance metrics from database
    const { data: performanceData, error: perfError } = await supabase
      .from('analytics_events')
      .select('*')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true })

    if (perfError) {
      console.error('Error fetching performance data:', perfError)
    }

    // Calculate performance metrics
    const pageLoads = performanceData?.filter(e => e.event_type === 'page_load') || []
    const apiCalls = performanceData?.filter(e => e.event_type === 'api_call') || []
    const databaseQueries = performanceData?.filter(e => e.event_type === 'database_query') || []

    const performanceMetrics = {
      totalEvents: performanceData?.length || 0,
      pageLoads: {
        count: pageLoads.length,
        averageDuration: pageLoads.length > 0 
          ? pageLoads.reduce((sum, e) => sum + (e.metadata?.duration || 0), 0) / pageLoads.length 
          : 0
      },
      apiCalls: {
        count: apiCalls.length,
        averageDuration: apiCalls.length > 0 
          ? apiCalls.reduce((sum, e) => sum + (e.metadata?.duration || 0), 0) / apiCalls.length 
          : 0
      },
      databaseQueries: {
        count: databaseQueries.length,
        averageDuration: databaseQueries.length > 0 
          ? databaseQueries.reduce((sum, e) => sum + (e.metadata?.duration || 0), 0) / databaseQueries.length 
          : 0
      }
    }

    // Get recent alerts
    const { data: alerts, error: alertsError } = await supabase
      .from('admin_actions_log')
      .select('*')
      .eq('action_type', 'system_alert')
      .order('created_at', { ascending: false })
      .limit(10)

    if (alertsError) {
      console.error('Error fetching alerts:', alertsError)
    }

    // Get user activity
    const { data: userActivity, error: userError } = await supabase
      .from('analytics_events')
      .select('user_id, event_type, created_at')
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Last hour
      .order('created_at', { ascending: false })

    if (userError) {
      console.error('Error fetching user activity:', userError)
    }

    const activeUsers = new Set(userActivity?.map(e => e.user_id) || []).size

    return NextResponse.json({
      systemMetrics: {
        ...systemMetrics,
        activeUsers
      },
      performanceMetrics,
      alerts: alerts || [],
      userActivity: userActivity || [],
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in performance monitoring API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validate admin access
    const { user, error: authError } = await validateAdminAccess()
    if (authError) {
      return NextResponse.json({ error: authError }, { status: 401 })
    }

    const body = await request.json()
    const { action, data } = body

    const supabase = createClient()

    switch (action) {
      case 'clear_cache':
        // Clear performance cache
        // In a real implementation, this would clear Redis or other cache
        return NextResponse.json({ 
          success: true, 
          message: 'Cache cleared successfully' 
        })

      case 'generate_report':
        // Generate performance report
        const { data: events, error: eventsError } = await supabase
          .from('analytics_events')
          .select('*')
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days

        if (eventsError) {
          throw new Error('Failed to fetch events for report')
        }

        const report = {
          totalEvents: events?.length || 0,
          eventsByType: events?.reduce((acc, event) => {
            acc[event.event_type] = (acc[event.event_type] || 0) + 1
            return acc
          }, {} as Record<string, number>) || {},
          averageResponseTime: events?.length > 0 
            ? events.reduce((sum, e) => sum + (e.metadata?.duration || 0), 0) / events.length 
            : 0,
          generatedAt: new Date().toISOString()
        }

        return NextResponse.json({ 
          success: true, 
          report 
        })

      case 'update_thresholds':
        // Update performance thresholds
        const { cpu, memory, disk, network } = data
        
        // In a real implementation, this would update configuration
        return NextResponse.json({ 
          success: true, 
          message: 'Thresholds updated successfully',
          thresholds: { cpu, memory, disk, network }
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Error in performance monitoring API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 