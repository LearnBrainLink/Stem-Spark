import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { 
      content, 
      channel_id, 
      message_type = 'text',
      file_url,
      image_url,
      image_caption,
      file_caption,
      file_name,
      file_size,
      file_type,
      reply_to_id
    } = await request.json()

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
      .select('role, is_super_admin, full_name')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Get channel to check permissions and creator
    const { data: channel } = await supabase
      .from('channels')
      .select('id, name, type, created_by')
      .eq('id', channel_id)
      .single()

    if (!channel) {
      return NextResponse.json(
        { error: 'Channel not found' },
        { status: 404 }
      )
    }

    // Check per-channel ban
    const { data: existingBan } = await supabase
      .from('channel_bans')
      .select('id, expires_at')
      .eq('channel_id', channel_id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (existingBan && (!existingBan.expires_at || new Date(existingBan.expires_at) > new Date())) {
      return NextResponse.json(
        { error: 'You are banned from this channel' },
        { status: 403 }
      )
    }

    // Check permissions based on channel type
    const isAdmin = profile.role === 'admin' || profile.is_super_admin
    const canSendMessage = (
      channel.type === 'general' ||
      channel.type === 'parent_teacher' ||
      (channel.type === 'announcements' && isAdmin) ||
      channel.type === 'admin_only'
    )

    if (!canSendMessage) {
      return NextResponse.json(
        { error: 'You do not have permission to send messages in this channel' },
        { status: 403 }
      )
    }

    // Create message with enhanced fields
    const messageData: any = {
      content,
      sender_id: user.id,
      sender_name: profile.full_name || 'Unknown User',
      chat_id: channel_id,
      message_type
    }

    // Add optional fields if provided
    if (file_url) messageData.file_url = file_url
    if (image_url) messageData.image_url = image_url
    if (image_caption) messageData.image_caption = image_caption
    if (file_caption) messageData.file_caption = file_caption
    if (file_name) messageData.file_name = file_name
    if (file_size) messageData.file_size = file_size
    if (file_type) messageData.file_type = file_type
    if (reply_to_id) messageData.reply_to_id = reply_to_id

    const { data: message, error } = await supabase
      .from('messages')
      .insert([messageData])
      .select(`
        *,
        sender:profiles(full_name, role)
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

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { searchParams } = new URL(request.url)
    const channelId = searchParams.get('channel_id')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!channelId) {
      return NextResponse.json(
        { error: 'Channel ID is required' },
        { status: 400 }
      )
    }

    // Validate user authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is member of the channel
    const { data: membership } = await supabase
      .from('channel_members')
      .select('*')
      .eq('channel_id', channelId)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json(
        { error: 'You are not a member of this channel' },
        { status: 403 }
      )
    }

    // Get messages with enhanced data
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles(full_name, role)
      `)
      .eq('chat_id', channelId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json({ messages: messages.reverse() })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { searchParams } = new URL(request.url)
    const messageId = searchParams.get('messageId')

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      )
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user can delete the message
    const { data: message } = await supabase
      .from('messages')
      .select('*')
      .eq('id', messageId)
      .single()

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      )
    }

    // Only allow deletion if user is the sender or an admin
    if (message.sender_id !== user.id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
        return NextResponse.json(
          { error: 'Not authorized to delete this message' },
          { status: 403 }
        )
      }
    }

    // Delete message
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting message:', error)
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    )
  }
} 