import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Edit message
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { content, image_caption } = await request.json()
    const messageId = params.id

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the message to check ownership
    const { data: message, error: messageError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('id', messageId)
      .single()

    if (messageError || !message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // Check if user can edit this message (owner or admin)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isOwner = message.sender_id === user.id
    const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin'

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'You can only edit your own messages' }, { status: 403 })
    }

    // Update the message
    const { data: updatedMessage, error: updateError } = await supabase
      .from('chat_messages')
      .update({
        content,
        image_caption,
        edited_at: new Date().toISOString(),
        edited_by: user.id
      })
      .eq('id', messageId)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update message' }, { status: 500 })
    }

    return NextResponse.json({ message: updatedMessage })
  } catch (error) {
    console.error('Error updating message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Delete message
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const messageId = params.id

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the message to check ownership
    const { data: message, error: messageError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('id', messageId)
      .single()

    if (messageError || !message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // Check if user can delete this message (owner or admin)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isOwner = message.sender_id === user.id
    const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin'

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'You can only delete your own messages' }, { status: 403 })
    }

    // Soft delete the message
    const { error: deleteError } = await supabase
      .from('chat_messages')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by: user.id,
        content: '[Message deleted]'
      })
      .eq('id', messageId)

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 