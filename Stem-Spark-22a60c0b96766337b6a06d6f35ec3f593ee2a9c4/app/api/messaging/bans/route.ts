import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)
    const { action, channel_id, target_user_id, reason, expires_at } = await request.json()

    if (!action || !channel_id || !target_user_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Fetch channel and requester role
    const { data: channel } = await supabase
      .from('channels')
      .select('id, name, type, created_by')
      .eq('id', channel_id)
      .single()

    if (!channel) return NextResponse.json({ error: 'Channel not found' }, { status: 404 })

    const { data: requesterProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = requesterProfile?.role === 'admin' || requesterProfile?.role === 'super_admin'
    // Only creator can ban in custom channels; for General, only admins
    const canModerate = channel.name === 'General' ? isAdmin : (channel.created_by === user.id || isAdmin)
    if (!canModerate) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    if (action === 'ban') {
      const { error } = await supabase
        .from('channel_bans')
        .insert({ channel_id, user_id: target_user_id, banned_by: user.id, reason, expires_at })
      if (error) throw error
      return NextResponse.json({ success: true })
    }

    if (action === 'unban') {
      const { error } = await supabase
        .from('channel_bans')
        .delete()
        .eq('channel_id', channel_id)
        .eq('user_id', target_user_id)
      if (error) throw error
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('bans endpoint error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


