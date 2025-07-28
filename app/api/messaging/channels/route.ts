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

    // Fetch channels that the user can see (public channels + channels they're members of)
    const { data: channels, error } = await supabase
      .from('chats')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching channels:', error)
      throw error
    }

    return NextResponse.json({ channels: channels || [] })
  } catch (error) {
    console.error('Error fetching channels:', error)
    return NextResponse.json(
      { error: 'Failed to fetch channels' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { name, description, channel_type } = await request.json()

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

    // Allow students, interns, and admins to create channels
    const allowedRoles = ['student', 'intern', 'admin', 'super_admin']
    if (!allowedRoles.includes(profile.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to create channels' },
        { status: 403 }
      )
    }

    // Check if channel name already exists
    const { data: existingChannel } = await supabase
      .from('chats')
      .select('id')
      .eq('name', name)
      .single()

    if (existingChannel) {
      return NextResponse.json(
        { error: 'Channel name already exists' },
        { status: 400 }
      )
    }

    // Create channel
    const { data: channel, error: channelError } = await supabase
      .from('chats')
      .insert([{ 
        name, 
        description, 
        is_announcement: channel_type === 'announcement',
        created_by: user.id
      }])
      .select()
      .single()

    if (channelError) {
      console.error('Channel creation error:', channelError)
      throw channelError
    }

    // Add creator as admin member
    const { error: memberError } = await supabase
      .from('chat_participants')
      .insert([{
        user_id: user.id,
        chat_id: channel.id,
        role: 'admin'
      }])

    if (memberError) {
      console.error('Member creation error:', memberError)
      // Don't throw here, channel was created successfully
    }

    return NextResponse.json({ channel })
  } catch (error) {
    console.error('Error creating channel:', error)
    return NextResponse.json(
      { error: 'Failed to create channel' },
      { status: 500 }
    )
  }
} 