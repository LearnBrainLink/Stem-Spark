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

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', user.id)
      .single()

    // Fetch channels that the user can see
    const { data: channels, error } = await supabase
      .from('chats')
      .select(`
        *,
        members:chat_participants(
          user_id,
          role
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching channels:', error)
      return NextResponse.json(
        { error: 'Failed to fetch channels' },
        { status: 500 }
      )
    }

    // Get member counts for each channel
    const channelsWithCounts = await Promise.all(
      (channels || []).map(async (channel) => {
        const { count } = await supabase
          .from('chat_participants')
          .select('*', { count: 'exact', head: true })
          .eq('chat_id', channel.id)

        return {
          ...channel,
          member_count: count || 0
        }
      })
    )

    return NextResponse.json({
      user: {
        id: user.id,
        name: profile?.full_name,
        role: profile?.role
      },
      channels: channelsWithCounts,
      total_channels: channelsWithCounts.length
    })
  } catch (error) {
    console.error('Error in test channels endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 