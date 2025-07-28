import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const channelId = searchParams.get('channel_id')
    
    if (!channelId) {
      return NextResponse.json(
        { error: 'Channel ID is required' },
        { status: 400 }
      )
    }

    const supabase = createClient()
    
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        profiles:profiles(full_name)
      `)
      .eq('chat_id', channelId)
      .order('created_at', { ascending: true })

    if (error) throw error

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { content, channel_id } = await request.json()

    // Validate user authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user profile to check permissions
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_super_admin')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Get channel to check permissions
    const { data: channel } = await supabase
      .from('chats')
      .select('is_announcement')
      .eq('id', channel_id)
      .single()

    if (!channel) {
      return NextResponse.json(
        { error: 'Channel not found' },
        { status: 404 }
      )
    }

    // Check permissions based on channel type
    const isAdmin = profile.role === 'admin' || profile.is_super_admin
    const canSendMessage = 
      !channel.is_announcement || isAdmin

    if (!canSendMessage) {
      return NextResponse.json(
        { error: 'You do not have permission to send messages in this channel' },
        { status: 403 }
      )
    }

    const { data: message, error } = await supabase
      .from('messages')
      .insert([{
        content,
        sender_id: user.id,
        chat_id: channel_id,
        message_type: 'text'
      }])
      .select(`
        *,
        profiles:profiles(full_name)
      `)
      .single()

    if (error) throw error

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    )
  }
} 