import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
    
    // Test 1: Check if channels exist
    const { data: channels, error: channelsError } = await supabase
      .from('chat_channels')
      .select('id, name, channel_type')
      .limit(5)

    if (channelsError) {
      return NextResponse.json({ 
        error: 'Failed to fetch channels',
        details: channelsError 
      }, { status: 500 })
    }

    // Test 2: Check if messages exist
    const { data: messages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('id, content, channel_id, sender_id')
      .limit(5)

    if (messagesError) {
      return NextResponse.json({ 
        error: 'Failed to fetch messages',
        details: messagesError 
      }, { status: 500 })
    }

    // Test 3: Check if channel members exist
    const { data: members, error: membersError } = await supabase
      .from('chat_channel_members')
      .select('channel_id, user_id, role')
      .limit(5)

    if (membersError) {
      return NextResponse.json({ 
        error: 'Failed to fetch channel members',
        details: membersError 
      }, { status: 500 })
    }

    // Test 4: Check if users exist
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, full_name, email, role')
      .limit(5)

    if (usersError) {
      return NextResponse.json({ 
        error: 'Failed to fetch users',
        details: usersError 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Message delivery system is working',
      data: {
        channels: channels?.length || 0,
        messages: messages?.length || 0,
        members: members?.length || 0,
        users: users?.length || 0
      },
      sample: {
        channels: channels?.slice(0, 2),
        messages: messages?.slice(0, 2),
        members: members?.slice(0, 2),
        users: users?.slice(0, 2)
      }
    })
  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json({ 
      error: 'Message delivery test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 