import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { reaction } = await request.json() // '👍', '❤️', '😄', '😮', '😢', '😡'
    const messageId = params.id

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the message
    const { data: message, error: messageError } = await supabase
      .from('chat_messages')
      .select('reactions')
      .eq('id', messageId)
      .single()

    if (messageError || !message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // Update reactions
    const currentReactions = message.reactions || {}
    const userReactions = currentReactions[user.id] || []
    
    let updatedReactions
    if (userReactions.includes(reaction)) {
      // Remove reaction if already exists
      updatedReactions = {
        ...currentReactions,
        [user.id]: userReactions.filter((r: string) => r !== reaction)
      }
    } else {
      // Add reaction
      updatedReactions = {
        ...currentReactions,
        [user.id]: [...userReactions, reaction]
      }
    }

    // Update the message
    const { data: updatedMessage, error: updateError } = await supabase
      .from('chat_messages')
      .update({ reactions: updatedReactions })
      .eq('id', messageId)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update reaction' }, { status: 500 })
    }

    return NextResponse.json({ message: updatedMessage })
  } catch (error) {
    console.error('Error updating reaction:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 