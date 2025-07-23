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
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Create channel
    const { data: channel, error } = await supabase
      .from('chat_channels')
      .insert({
        name,
        description,
        channel_type: channel_type || 'public',
        created_by: user.id
      })
      .select()
      .single()

    if (error) throw error

    // Add creator as admin member
    await supabase
      .from('chat_channel_members')
      .insert({
        channel_id: channel.id,
        user_id: user.id,
        role: 'admin'
      })

    return NextResponse.json({ channel })
  } catch (error) {
    console.error('Error creating channel:', error)
    return NextResponse.json(
      { error: 'Failed to create channel' },
      { status: 500 }
    )
  }
} 