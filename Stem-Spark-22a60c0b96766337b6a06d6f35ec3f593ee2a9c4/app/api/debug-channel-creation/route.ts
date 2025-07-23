import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { name, description, channel_type, created_by } = await request.json()

    console.log('Debug channel creation with:', { name, description, channel_type, created_by })

    // Test 1: Check if we can read existing channels
    const { data: existingChannels, error: readError } = await supabase
      .from('chat_channels')
      .select('*')
      .limit(1)

    if (readError) {
      console.error('Error reading channels:', readError)
      return NextResponse.json({ 
        error: 'Cannot read channels', 
        details: readError.message 
      }, { status: 400 })
    }

    console.log('Can read channels:', existingChannels)

    // Test 2: Try to create a channel
    const { data: channel, error: createError } = await supabase
      .from('chat_channels')
      .insert({
        name,
        description,
        channel_type,
        created_by
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating channel:', createError)
      return NextResponse.json({ 
        error: 'Cannot create channel', 
        details: createError.message,
        code: createError.code
      }, { status: 400 })
    }

    console.log('Channel created successfully:', channel)

    // Test 3: Try to add creator as member
    const { error: memberError } = await supabase
      .from('chat_channel_members')
      .insert({
        user_id: created_by,
        channel_id: channel.id,
        role: 'admin'
      })

    if (memberError) {
      console.error('Error adding creator as member:', memberError)
      // Clean up the channel
      await supabase.from('chat_channels').delete().eq('id', channel.id)
      return NextResponse.json({ 
        error: 'Cannot add creator as member', 
        details: memberError.message,
        code: memberError.code
      }, { status: 400 })
    }

    console.log('Creator added as member successfully')

    return NextResponse.json({ 
      success: true, 
      channel,
      message: 'Channel created and creator added successfully' 
    })

  } catch (error) {
    console.error('Debug channel creation failed:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 