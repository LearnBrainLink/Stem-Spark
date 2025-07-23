import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { name, description, channel_type, created_by } = await request.json()

    console.log('Testing channel creation with:', { name, description, channel_type, created_by })

    // Create the channel
    const { data: channel, error } = await supabase
      .from('chat_channels')
      .insert({
        name,
        description,
        channel_type,
        created_by
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating channel:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log('Channel created successfully:', channel)

    // Add creator as admin
    const { error: memberError } = await supabase
      .from('chat_channel_members')
      .insert({
        user_id: created_by,
        channel_id: channel.id,
        role: 'admin'
      })

    if (memberError) {
      console.error('Error adding creator as member:', memberError)
      // Clean up the channel if we can't add the member
      await supabase.from('chat_channels').delete().eq('id', channel.id)
      return NextResponse.json({ error: memberError.message }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      channel,
      message: 'Channel created successfully' 
    })

  } catch (error) {
    console.error('Test channel creation failed:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
} 