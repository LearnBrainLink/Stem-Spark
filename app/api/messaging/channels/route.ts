import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: channels, error } = await supabase
      .from('chat_channels')
      .select('*')
      .order('name')

    if (error) throw error

    return NextResponse.json({ channels })
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

    // Validate admin access
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_super_admin')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.role !== 'admin' && !profile.is_super_admin)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Create channel
    const { data: channel, error: channelError } = await supabase
      .from('chat_channels')
      .insert([{ 
        name, 
        description, 
        channel_type: channel_type || 'public',
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
      .from('chat_channel_members')
      .insert([{
        user_id: user.id,
        channel_id: channel.id,
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