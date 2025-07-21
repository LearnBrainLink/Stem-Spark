import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { messagingService } from '@/lib/real-time-messaging'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get channels for the user
    const result = await messagingService.getChannels(user.id)
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ channels: result.channels })
  } catch (error) {
    console.error('Error getting channels:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, channelType, restrictions, allowedRoles } = body

    // Validate required fields
    if (!name || !channelType) {
      return NextResponse.json({ error: 'Name and channel type are required' }, { status: 400 })
    }

    // Validate channel type
    const validChannelTypes = ['public', 'private', 'group', 'announcement', 'role_restricted']
    if (!validChannelTypes.includes(channelType)) {
      return NextResponse.json({ error: 'Invalid channel type' }, { status: 400 })
    }

    // Create channel
    const result = await messagingService.createChannel(
      name,
      description || '',
      channelType,
      user.id,
      restrictions,
      allowedRoles
    )

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ channel: result.channel })
  } catch (error) {
    console.error('Error creating channel:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 