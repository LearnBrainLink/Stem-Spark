import { createServerClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// This is a temporary debug endpoint.
// It uses the service role key to bypass RLS policies
// and pinpoint if the issue is with permissions or something else.

export async function POST(request: NextRequest) {
  const supabase = createServerClient() // Uses service role key

  try {
    const { name, description, channel_type, user_id } = await request.json()

    if (!name || !channel_type || !user_id) {
      return NextResponse.json(
        { error: 'Missing required fields: name, channel_type, user_id' },
        { status: 400 }
      )
    }

    console.log('[DEBUG] Attempting to create channel as admin...')

    // Step 1: Create the channel using the service role
    const { data: channel, error: channelError } = await supabase
      .from('chat_channels')
      .insert({
        name: `${name} (Admin Created)`,
        description,
        channel_type,
        created_by: user_id,
      })
      .select()
      .single()

    if (channelError) {
      console.error('[DEBUG] Error creating channel:', channelError)
      return NextResponse.json({ error: 'Failed to create channel', details: channelError.message }, { status: 500 })
    }

    console.log('[DEBUG] Channel created successfully:', channel)

    // Step 2: Add the user as a member
    const { error: memberError } = await supabase
      .from('chat_channel_members')
      .insert({
        user_id: user_id,
        channel_id: channel.id,
        role: 'admin',
      })

    if (memberError) {
      console.error('[DEBUG] Error adding channel member:', memberError)
      // Rollback: delete the channel if we can't add a member
      await supabase.from('chat_channels').delete().eq('id', channel.id)
      return NextResponse.json({ error: 'Failed to add member', details: memberError.message }, { status: 500 })
    }
    
    console.log('[DEBUG] Member added successfully.')

    return NextResponse.json({ success: true, channel })

  } catch (error: any) {
    console.error('[DEBUG] Unexpected error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred', details: error.message }, { status: 500 })
  }
} 