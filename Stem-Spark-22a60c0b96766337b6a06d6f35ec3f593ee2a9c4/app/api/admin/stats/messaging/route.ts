import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createClient()

    // Get all messages
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    // Get all channels
    const { data: channels } = await supabase
      .from('channels')
      .select('*')

    // Get channel members
    const { data: channelMembers } = await supabase
      .from('channel_members')
      .select('*')

    // Calculate messaging statistics
    const totalMessages = messages?.length || 0
    const totalChannels = channels?.length || 0
    const totalMembers = channelMembers?.length || 0

    // Calculate message types
    const messageTypeDistribution = messages?.reduce((acc: any, message) => {
      acc[message.message_type] = (acc[message.message_type] || 0) + 1
      return acc
    }, {}) || {}

    // Get recent messaging activity
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: recentMessages } = await supabase
      .from('messages')
      .select('created_at')
      .gte('created_at', sevenDaysAgo.toISOString())

    const recentMessageCount = recentMessages?.length || 0

    // Get channel activity
    const channelActivity = channels?.map(channel => {
      const channelMessages = messages?.filter(message => message.channel_id === channel.id).length || 0
      const channelMemberCount = channelMembers?.filter(member => member.channel_id === channel.id).length || 0
      
      return {
        id: channel.id,
        name: channel.name,
        description: channel.description,
        channel_type: channel.channel_type,
        messageCount: channelMessages,
        memberCount: channelMemberCount,
        activityLevel: channelMessages > 0 ? 'high' : channelMemberCount > 0 ? 'medium' : 'low'
      }
    }) || []

    // Get most active channels
    const mostActiveChannels = channelActivity
      .sort((a, b) => b.messageCount - a.messageCount)
      .slice(0, 5)

    // Get message growth data (last 6 months)
    const messageGrowthData = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = date.toLocaleString('default', { month: 'short' })
      
      const { count: monthlyMessages } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', date.toISOString())
        .lt('created_at', new Date(date.getFullYear(), date.getMonth() + 1, 1).toISOString())
      
      messageGrowthData.push({
        month: monthName,
        messages: monthlyMessages || 0
      })
    }

    // Get user messaging activity
    const { data: userMessagingActivity } = await supabase
      .from('messages')
      .select('sender_id, created_at')
      .order('created_at', { ascending: false })
      .limit(100)

    const userActivityDistribution = userMessagingActivity?.reduce((acc: any, message) => {
      acc[message.sender_id] = (acc[message.sender_id] || 0) + 1
      return acc
    }, {}) || {}

    const topMessagingUsers = Object.entries(userActivityDistribution)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([userId, count]) => ({ userId, messageCount: count }))

    const stats = {
      overview: {
        totalMessages,
        totalChannels,
        totalMembers,
        recentMessageCount
      },
      messageTypeDistribution,
      channelActivity,
      mostActiveChannels,
      messageGrowthData,
      topMessagingUsers,
      engagement: {
        totalMessages,
        recentMessageCount,
        averageMessagesPerChannel: totalChannels > 0 ? totalMessages / totalChannels : 0
      }
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching messaging statistics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messaging statistics' },
      { status: 500 }
    )
  }
} 