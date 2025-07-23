import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    // Test authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      return NextResponse.json({ 
        error: 'Authentication failed', 
        details: authError.message 
      }, { status: 401 })
    }

    if (!user) {
      return NextResponse.json({ 
        error: 'No user found' 
      }, { status: 401 })
    }

    // Test reading user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json({ 
        error: 'Profile read failed', 
        details: profileError.message 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email
      },
      profile: {
        id: profile.id,
        full_name: profile.full_name,
        role: profile.role
      }
    })

  } catch (error) {
    console.error('Test auth failed:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 