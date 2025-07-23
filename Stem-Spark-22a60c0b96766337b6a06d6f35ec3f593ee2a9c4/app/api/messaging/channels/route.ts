import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Use anon key for authentication
    const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
    
    // Verify the user token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get user profile to check role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // Use service role key for database operations
    const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    let channelsQuery = supabaseAdmin
      .from('chat_channels')
      .select(`
        *,
        chat_channel_members!inner(user_id)
      `)
      .eq('chat_channel_members.user_id', user.id)
      .order('name')

    // If user is admin, also include all public channels
    if (profile && ['admin', 'super_admin'].includes(profile.role)) {
      channelsQuery = supabaseAdmin
        .from('chat_channels')
        .select('*')
        .or(`chat_channel_members.user_id.eq.${user.id},channel_type.eq.public`)
        .order('name')
    }

    const { data: channels, error } = await channelsQuery

    if (error) throw error

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
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Use anon key for authentication
    const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
    
    // Verify the user token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { name, description, channel_type } = await request.json()

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Use service role key for database operations
    const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Create channel
    const { data: channel, error } = await supabaseAdmin
      .from('chat_channels')
      .insert({
        name,
        description,
        channel_type: channel_type || 'public',
        created_by: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Channel creation error:', error)
      throw error
    }

    // Add creator as admin member
    await supabaseAdmin
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