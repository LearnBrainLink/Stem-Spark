import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { target_channel_id } = await request.json()
    const originalMessageId = params.id

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the original message
    const { data: originalMessage, error: messageError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('id', originalMessageId)
      .single()

    if (messageError || !originalMessage) {
      return NextResponse.json({ error: 'Original message not found' }, { status: 404 })
    }

    // Check if user is member of target channel
    const { data: membership } = await supabase
      .from('chat_channel_members')
      .select('*')
      .eq('channel_id', target_channel_id)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'You are not a member of the target channel' }, { status: 403 })
    }

    // Create forwarded message
    const { data: forwardedMessage, error: forwardError } = await supabase
      .from('chat_messages')
      .insert({
        channel_id: target_channel_id,
        sender_id: user.id,
        content: originalMessage.content,
        message_type: originalMessage.message_type,
        file_url: originalMessage.file_url,
        image_url: originalMessage.image_url,
        image_caption: originalMessage.image_caption,
        file_name: originalMessage.file_name,
        file_size: originalMessage.file_size,
        file_type: originalMessage.file_type,
        forwarded_from_id: originalMessageId
      })
      .select()
      .single()

    if (forwardError) {
      return NextResponse.json({ error: 'Failed to forward message' }, { status: 500 })
    }

    return NextResponse.json({ message: forwardedMessage })
  } catch (error) {
    console.error('Error forwarding message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 