import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', user.id)
      .single()

    // Get channel ID from query params
    const { searchParams } = new URL(request.url)
    const channelId = searchParams.get('channelId')

    if (!channelId) {
      return NextResponse.json(
        { error: 'Channel ID is required' },
        { status: 400 }
      )
    }

    // Fetch messages for the specified channel
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select(`
        *,
        profiles:profiles(full_name)
      `)
      .eq('channel_id', channelId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching messages:', error)
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      )
    }

    // Format messages
    const formattedMessages = (messages || []).map(msg => ({
      ...msg,
      sender_name: msg.profiles?.full_name || 'Unknown'
    }))

    return NextResponse.json({
      user: {
        id: user.id,
        name: profile?.full_name,
        role: profile?.role
      },
      channelId,
      messages: formattedMessages,
      total_messages: formattedMessages.length
    })
  } catch (error) {
    console.error('Error in test messages endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 