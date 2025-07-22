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

    // Get messaging statistics
    const { data: messages } = await supabase
      .from('chat_messages')
      .select('created_at, message_type, channel_id')

    const { data: channels } = await supabase
      .from('chat_channels')
      .select('channel_type, created_at')

    const { data: channelMembers } = await supabase
      .from('chat_channel_members')
      .select('channel_id, user_id')

    // Get messaging trends (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const { data: recentMessages } = await supabase
      .from('chat_messages')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true })

    // Process daily message counts
    const dailyMessages: { [key: string]: number } = {}
    
    // Initialize last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayKey = date.toISOString().split('T')[0]
      dailyMessages[dayKey] = 0
    }

    // Count messages by day
    recentMessages?.forEach(message => {
      const dayKey = message.created_at.split('T')[0]
      if (dailyMessages[dayKey] !== undefined) {
        dailyMessages[dayKey]++
      }
    })

    // Convert to chart format
    const dailyMessageChart = Object.entries(dailyMessages).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      messages: count
    }))

    // Get message type distribution
    const messageTypeDistribution = messages?.reduce((acc: { [key: string]: number }, message) => {
      acc[message.message_type] = (acc[message.message_type] || 0) + 1
      return acc
    }, {}) || {}

    // Get channel type distribution
    const channelTypeDistribution = channels?.reduce((acc: { [key: string]: number }, channel) => {
      acc[channel.channel_type] = (acc[channel.channel_type] || 0) + 1
      return acc
    }, {}) || {}

    // Calculate engagement metrics
    const totalMessages = messages?.length || 0
    const totalChannels = channels?.length || 0
    const totalMembers = channelMembers?.length || 0
    const avgMessagesPerChannel = totalChannels > 0 ? Math.round(totalMessages / totalChannels) : 0
    const avgMembersPerChannel = totalChannels > 0 ? Math.round(totalMembers / totalChannels) : 0

    const stats = {
      dailyMessageChart,
      messageTypeDistribution,
      channelTypeDistribution,
      totalMessages,
      totalChannels,
      totalMembers,
      avgMessagesPerChannel,
      avgMembersPerChannel
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching messaging stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messaging statistics' },
      { status: 500 }
    )
  }
} 